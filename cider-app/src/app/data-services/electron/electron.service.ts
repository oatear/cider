import { Injectable } from '@angular/core';
import { IpcRenderer } from 'electron';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';

@Injectable({
  providedIn: 'root'
})
export class ElectronService {
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
    return this.getIpcRenderer().invoke("select-directory").then(
      (result : Electron.OpenDialogReturnValue) => {
        if (!result.canceled) {
          this.projectHomeUrl.next(result.filePaths[0]);
          console.log("projectHomeUrl: ", result.filePaths[0]);
          return result.filePaths[0];
        }
        return null;
    });
  }

  public titlebarDoubleClick() {
    if (!this.isElectron()) {
      return;
    }
    this.getIpcRenderer().send("titlebar-double-clicked");
  }

  public exitApplication() {
    if (!this.isElectron()) {
      return;
    }
    this.getIpcRenderer().send("exit-application");
  }
}
