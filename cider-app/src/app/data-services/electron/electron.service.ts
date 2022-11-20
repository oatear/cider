import { Injectable } from '@angular/core';
import { IpcRenderer } from 'electron';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import StringUtils from 'src/app/shared/utils/string-utils';
import { Asset } from '../types/asset.type';

@Injectable({
  providedIn: 'root'
})
export class ElectronService {
  private static readonly ASSETS_DIR = "assets";
  private static readonly CARDS_DIR = "cards";
  public projectHomeUrl: BehaviorSubject<string | undefined>;

  constructor() {
    this.projectHomeUrl = new BehaviorSubject<string | undefined>(undefined);
  }

  public getProjectHomeUrl() {
    return this.projectHomeUrl.asObservable();
  }

  /**
   * Determine if application is running in electron
   * 
   * @returns true/false
   */
  public isElectron() : boolean {
    return typeof window !== 'undefined' 
      && typeof window.process === 'object' 
      && (<any>window.process).type === 'renderer';
  }

  private getIpcRenderer(): IpcRenderer {
    return window.require('electron').ipcRenderer;
  }

  public selectDirectory(url: string) {
    this.projectHomeUrl.next(url);
  }

  public openSelectDirectoryDialog(): Promise<string | null> {
    if (!this.isElectron()) {
      return Promise.resolve(null);
    }
    return this.getIpcRenderer().invoke("open-select-directory-dialog").then(
      (result : Electron.OpenDialogReturnValue) => {
        if (!result.canceled) {
          this.projectHomeUrl.next(result.filePaths[0]);
          console.log("projectHomeUrl: ", result.filePaths[0]);
          return result.filePaths[0];
        }
        return null;
    });
  }

  public createDirectory(dirUrl: string): Promise<boolean> {
    if (!this.isElectron()) {
      return Promise.resolve(false);
    }
    return this.getIpcRenderer().invoke("create-directory", dirUrl);
  }

  public listDirectory(dirUrl: string): Promise<string[]> {
    if (!this.isElectron()) {
      return Promise.resolve([]);
    }
    return this.getIpcRenderer().invoke("list-directory", dirUrl);
  }

  public readFile(fileUrl: string): Promise<Buffer | null> {
    if (!this.isElectron()) {
      return Promise.resolve(null);
    }
    return this.getIpcRenderer().invoke("read-file", fileUrl);
  }

  public writeFile(fileUrl: string, data: string | NodeJS.ArrayBufferView): Promise<boolean> {
    if (!this.isElectron()) {
      return Promise.resolve(false);
    }
    return this.getIpcRenderer().invoke("write-file", fileUrl, data);
  }

  public titlebarDoubleClick(): void {
    if (!this.isElectron()) {
      return;
    }
    this.getIpcRenderer().send("titlebar-double-clicked");
  }

  public exitApplication(): void {
    if (!this.isElectron()) {
      return;
    }
    this.getIpcRenderer().send("exit-application");
  }

  public saveProject(assets: Asset[]) {
    if (!this.isElectron()) {
      return;
    }
    const homeUrl = this.projectHomeUrl.getValue();
    const assetsUrl = homeUrl + "/" + ElectronService.ASSETS_DIR;
    const cardsUrl = homeUrl + "/" + ElectronService.CARDS_DIR;

    const writeAllAssets: Promise<boolean[]> = Promise.all(assets.map(asset => {
      return asset.file.arrayBuffer().then(buffer => {
        return this.writeFile(
          assetsUrl + '/' + StringUtils.toKebabCase(asset.name) 
          + '.' + StringUtils.mimeToExtension(asset.file.type),
          Buffer.from(buffer));
      });
    }));

    // write assets
    // write cards
    // write database.json
    Promise.all([
      this.createDirectory(assetsUrl).then(result => writeAllAssets),
      this.createDirectory(cardsUrl)
    ]);
  }

  public openProject(homeUrl: string) {
    if (!this.isElectron()) {
      return;
    }
    //const homeUrl = this.projectHomeUrl.getValue();
    const assetsUrl = homeUrl + "/" + ElectronService.ASSETS_DIR;
    const cardsUrl = homeUrl + "/" + ElectronService.CARDS_DIR;
    // read database.json
    // read cards
    // read assets
  }
}
