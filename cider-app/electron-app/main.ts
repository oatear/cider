import {app, BrowserWindow, screen, systemPreferences, ipcMain, dialog } from 'electron';
import * as path from 'path';
import * as fs from 'fs';

let win: BrowserWindow = null;
const args = process.argv.slice(1),
  serve = args.some(val => val === '--serve');

function createWindow(): BrowserWindow {

  const defaultSize : {width: number, height: number} = {width: 1000, height: 800};
  const screenSize = screen.getPrimaryDisplay().workAreaSize;

  win = new BrowserWindow({
    x: screenSize.width / 2 - defaultSize.width / 2,
    y: screenSize.height / 2 - defaultSize.height / 2,
    width: defaultSize.width,
    height: defaultSize.height,
    minWidth: 800,
    minHeight: 600,
    titleBarStyle: 'hidden',
    titleBarOverlay: true,
    trafficLightPosition: { x: 20, y: 22 },
    webPreferences: {
      nodeIntegration: true,
      allowRunningInsecureContent: (serve),
      contextIsolation: false
    }
  });

  if (serve) {
    const debug = require('electron-debug');
    debug();

    require('electron-reloader')(module);
    win.loadURL('http://localhost:4200');
  } else {
    // Path when running electron executable
    let pathIndex = './index.html';

    // Path when running electron in local folder
    if (fs.existsSync(path.join(__dirname, '../../dist/cider/index.html'))) {
      pathIndex = '../../dist/cider/index.html';
    }

    const url = new URL(path.join('file:', __dirname, pathIndex));
    win.loadURL(url.href);
  }

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store window
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null;
  });

  return win;
}

try {
  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  app.on('ready', () => {
    const window = createWindow();
    Object.defineProperty(window, "isElectron", { get: () => true });

    // If on mac, push the menu icon over for the traffic lights to fit in title bar
    if (process.platform === 'darwin') {
      var css = ".site-wrapper .logo-image { margin-left: 80px; }"
      win.webContents.insertCSS(css, {
        cssOrigin: 'author'
      });
    }
  });

  // Quit when all windows are closed.
  app.on('window-all-closed', () => {
    app.quit();
  });

  app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win === null) {
      createWindow();
    }
  });

  /**
   * Minimize/maximize the window on titlebar double click
   */
  ipcMain.on('titlebar-double-clicked', async (event, arg) => {
    const action: string =
      systemPreferences.getUserDefault("AppleActionOnDoubleClick", "string") || "Maximize";
    if (action === "Minimize") {
      win.minimize();
    } else {
      win.isMaximized() ? win.unmaximize() : win.maximize();
    }
  });

  /**
   * Open select directory dialog
   * 
   * return Electron.OpenDialogReturnValue
   */
  ipcMain.handle('open-select-directory-dialog', async (event, arg) => {
    const result = await dialog.showOpenDialog(win, {
      properties: ['openDirectory']
    });
    console.log('directory selected', result.filePaths);
    return result;
  });

  /**
   * Create directory
   * 
   * params: dirUrl
   * return true
   */
  ipcMain.handle('create-directory', async (event, dirUrl) => {
    if (fs.existsSync(dirUrl)) {
      console.log('directory already exists', dirUrl);
      return false;
    }
    fs.mkdirSync(dirUrl);
    console.log('directory created', dirUrl);
    return true;
  });

  /**
   * List files in a directory
   * 
   * params: dirUrl
   * return string[]
   */
  ipcMain.handle('list-directory', async (event, dirUrl) => {
    const files = fs.readdirSync(dirUrl);
    console.log('directory listed', files);
    return files;
  });

  /**
   * Read file
   * 
   * params: fileUrl
   * return Buffer
   */
  ipcMain.handle('read-file', async (event, fileUrl) => {
    if (!fs.existsSync(fileUrl)) {
      return null;
    }
    const buffer = fs.readFileSync(fileUrl);
    console.log('read file', buffer);
    return buffer;
  });

  /**
   * Write file
   * 
   * params: fileUrl, data
   * return true
   */
  ipcMain.handle('write-file', async (event, fileUrl, data) => {
    fs.writeFileSync(fileUrl, data);
    console.log('wrote file', fileUrl);
    return true;
  });

  /**
   * Exit the application
   */
  ipcMain.on('exit-application', async (event, arg) => {
    app.quit();
  });

} catch (e) {
  // Catch Error
  // throw e;
}