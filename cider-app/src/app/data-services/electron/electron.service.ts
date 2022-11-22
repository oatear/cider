import { Injectable } from '@angular/core';
import { IpcRenderer } from 'electron';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import StringUtils from 'src/app/shared/utils/string-utils';
import { Asset } from '../types/asset.type';
import { CardTemplate } from '../types/card-template.type';

@Injectable({
  providedIn: 'root'
})
export class ElectronService {
  private static readonly ASSETS_DIR = "assets";
  private static readonly DECKS_DIR = "decks";
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

  public async openSelectDirectoryDialog(): Promise<string | null> {
    if (!this.isElectron()) {
      return Promise.resolve(null);
    }
    const result_2 = await this.getIpcRenderer().invoke("open-select-directory-dialog");
    if (!result_2.canceled) {
      this.projectHomeUrl.next(result_2.filePaths[0]);
      console.log("projectHomeUrl: ", result_2.filePaths[0]);
      return result_2.filePaths[0];
    }
    return null;
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

  public async saveProject(assets: Asset[], decks: { name: string; cardsCsv: string; 
    attributesCsv: string; templates: CardTemplate[];}[]) {
    if (!this.isElectron()) {
      return;
    }
    const homeUrl = this.projectHomeUrl.getValue();
    const assetsUrl = homeUrl + "/" + ElectronService.ASSETS_DIR;
    const decksUrl = homeUrl + "/" + ElectronService.DECKS_DIR;

    await this.createDirectory(assetsUrl);
    const writeAllAssets: Promise<boolean[]> = Promise.all(assets.map(async asset => {
      const buffer = await asset.file.arrayBuffer();
      return await this.writeFile(
        assetsUrl + '/' + StringUtils.toKebabCase(asset.name)
        + '.' + StringUtils.mimeToExtension(asset.file.type),
        Buffer.from(buffer));
    }));

    await this.createDirectory(decksUrl);
    const writeAllDecks = Promise.all(decks.map(async deck => {
      const deckUrl = decksUrl + '/' + StringUtils.toKebabCase(deck.name);
      await this.createDirectory(deckUrl);
      this.writeFile(deckUrl + '/cards.csv', deck.cardsCsv);
      this.writeFile(deckUrl + '/attributes.csv', deck.attributesCsv)
      const writeTemplates = await Promise.all(deck.templates.map(template => {
        return Promise.all([
          this.writeFile(deckUrl + '/' + StringUtils.toKebabCase(template.name) + '.css', template.css),
          this.writeFile(deckUrl + '/' + StringUtils.toKebabCase(template.name) + '.html', template.html)
        ]);
      }));
      return true;
    }));
  }

  public openProject(homeUrl: string) {
    if (!this.isElectron()) {
      return;
    }
    //const homeUrl = this.projectHomeUrl.getValue();
    const assetsUrl = homeUrl + "/" + ElectronService.ASSETS_DIR;
    const cardsUrl = homeUrl + "/" + ElectronService.DECKS_DIR;
    // read database.json
    // read cards
    // read assets
  }
}
