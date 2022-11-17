import { Injectable } from '@angular/core';
import { IpcRenderer } from 'electron';

@Injectable({
  providedIn: 'root'
})
export class ElectronService {

  projectHomeUrl: string | undefined;

  constructor() {
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

  public selectDirectory() {
    if (!this.isElectron()) {
      return;
    }
    this.getIpcRenderer().send("select-directory");
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
