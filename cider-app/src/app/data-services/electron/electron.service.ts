import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ElectronService {

  constructor() {
  }

  /**
   * async () => {
   * const result = await ipcRenderer.invoke('my-invokable-ipc', arg1, arg2)
   *   // ...
   * }
   */

  public selectDirectory() {
    if (typeof window.require === 'function') {
      const ipcRenderer = window.require('electron').ipcRenderer;
      ipcRenderer.send("select-directory");
    }
  }

  public titlebarDoubleClick() {
    if (typeof window.require === 'function') {
      const ipcRenderer = window.require('electron').ipcRenderer;
      ipcRenderer.send("titlebar-double-clicked");
    }
  }
}
