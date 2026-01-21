import { app, BrowserWindow, screen, systemPreferences, ipcMain, dialog } from 'electron';
import * as path from 'path';
import * as fs from 'fs';

let win: BrowserWindow = null;
const args = process.argv.slice(1);
const serve = args.some(val => val === '--serve');
var shouldClose: Boolean = false;

export interface PersistentPath {
  url: string;
  bookmark: string;
}

function createWindow(): BrowserWindow {

  const defaultSize: { width: number, height: number } = { width: 1280, height: 800 };
  const screenSize = screen.getPrimaryDisplay().workAreaSize;

  win = new BrowserWindow({
    x: screenSize.width / 2 - defaultSize.width / 2,
    y: screenSize.height / 2 - defaultSize.height / 2,
    width: defaultSize.width,
    height: defaultSize.height,
    minWidth: 800,
    minHeight: 600,
    titleBarStyle: 'hidden',
    //titleBarOverlay: true,
    titleBarOverlay: {
      color: '#181c21',
      symbolColor: '#aeb2b8'
    },
    trafficLightPosition: { x: 20, y: 15 },
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
    if (fs.existsSync(path.join(__dirname, '../../dist/cider/browser/index.html'))) {
      pathIndex = '../../dist/cider/browser/index.html';
    }

    const url = new URL(path.join('file:', __dirname, pathIndex));
    win.loadURL(url.href);
  }

  // Emitted when the window is closed.
  win.on('close', (event) => {
    if (!shouldClose) {
      win.webContents.send('app-closed');
      event.preventDefault();
    }
  });
  win.on('closed', () => {
    // Dereference the window object, usually you would store window
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null;
  });
  // win.on('close', function (e) {
  //   let response = dialog.showMessageBoxSync(this, {
  //       type: 'question',
  //       buttons: ['Yes', 'No'],
  //       title: 'Confirm',
  //       message: 'Are you sure you want to quit?'
  //   });

  //   if(response == 1) e.preventDefault();
  // });

  return win;
}

function requestPathAccess(persistentPath: PersistentPath): () => void {
  if (!persistentPath || !persistentPath.bookmark) {
    return () => { };
  }
  return app.startAccessingSecurityScopedResource(persistentPath.bookmark) as () => void;
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
      var css = ".site-wrapper .site-menu { margin-left: 80px; }"
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

  // app.on('before-quit', (event) => {
  //   win.webContents.send('app-closed');
  //   event.preventDefault();
  // });

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
      properties: ['openDirectory', 'createDirectory'],
      securityScopedBookmarks: true,
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
  ipcMain.handle('create-directory', async (event, persistentPath) => {
    const stopAccess = requestPathAccess(persistentPath);
    if (fs.existsSync(persistentPath.path)) {
      console.log('directory already exists', persistentPath.path);
      stopAccess();
      return false;
    }
    return fs.promises.mkdir(persistentPath.path).then(() => {
      console.log('directory created', persistentPath.path);
      stopAccess();
      return true;
    });
  });

  /**
   * Remove directory
   * 
   * params: dirUrl
   * return true
   */
  ipcMain.handle('remove-directory', async (event, persistentPath) => {
    const stopAccess = requestPathAccess(persistentPath);
    if (!fs.existsSync(persistentPath.path)) {
      console.log('directory does not exists', persistentPath.path);
      stopAccess();
      return false;
    }
    return fs.promises.rm(persistentPath.path, { recursive: true, force: true }).then(() => {
      console.log('directory removed', persistentPath.path);
      stopAccess();
      return true;
    });
  });
  /**
   * Rename directory
   * 
   * params: oldUrl, newUrl
   * return true
   */
  ipcMain.handle('rename-directory', async (event, oldPersistentPath, newPersistentPath) => {
    const stopAccess = requestPathAccess(oldPersistentPath);
    if (!fs.existsSync(oldPersistentPath.path)) {
      console.log('directory does not exists', oldPersistentPath.path);
      stopAccess();
      return false;
    }
    return fs.promises.rename(oldPersistentPath.path, newPersistentPath.path).then(() => {
      console.log('directory renamed', oldPersistentPath.path, 'to', newPersistentPath.path);
      stopAccess();
      return true;
    });
  });

  /**
   * List files in a directory
   * 
   * params: dirUrl
   * return Dirent[]
   */
  ipcMain.handle('list-directory', async (event, persistentPath) => {
    const stopAccess = requestPathAccess(persistentPath);
    if (!fs.existsSync(persistentPath.path)) {
      console.log('directory does not exists', persistentPath.path);
      stopAccess();
      return [];
    }
    const files = fs.readdirSync(persistentPath.path, { withFileTypes: true }).map(dirent => {
      return {
        name: dirent.name,
        isDirectory: dirent.isDirectory(),
        isFile: dirent.isFile()
      }
    });
    stopAccess();
    console.log('directory listed', files);
    return files;
  });

  /**
   * Read file
   * 
   * params: fileUrl
   * return Buffer
   */
  ipcMain.handle('read-file', async (event, persistentPath) => {
    const stopAccess = requestPathAccess(persistentPath);
    if (!fs.existsSync(persistentPath.path)) {
      stopAccess();
      return null;
    }
    const buffer = fs.readFileSync(persistentPath.path);
    console.log('read file', persistentPath.path);
    stopAccess();
    return buffer;
  });


  /**
   * Read text file
   * 
   * params: fileUrl
   * return String
   */
  ipcMain.handle('read-text-file', async (event, persistentPath) => {
    const stopAccess = requestPathAccess(persistentPath);
    if (!fs.existsSync(persistentPath.path)) {
      stopAccess();
      return null;
    }
    const buffer = fs.readFileSync(persistentPath.path, { encoding: 'utf8' });
    console.log('read file', persistentPath.path);
    stopAccess();
    return buffer;
  });

  /**
   * Write file
   * 
   * params: fileUrl, data
   * return true
   */
  ipcMain.handle('write-file', async (event, persistentPath, data) => {
    const stopAccess = requestPathAccess(persistentPath);
    fs.writeFileSync(persistentPath.path, data);
    console.log('wrote file', persistentPath.path);
    stopAccess();
    return true;
  });

  /**
   * Watch directory
   */
  let watcher: any = null;
  ipcMain.handle('watch-directory', async (event, persistentPath) => {
    const stopAccess = requestPathAccess(persistentPath);
    if (watcher) {
      watcher.close();
    }
    const chokidar = require('chokidar');
    watcher = chokidar.watch(persistentPath.path, {
      ignored: /(^|[\/\\])\../, // ignore dotfiles
      persistent: true,
      ignoreInitial: true // don't emit add for existing files
    });

    watcher
      .on('add', (path: string) => {
        if (win) win.webContents.send('file-added', path);
      })
      .on('change', (path: string) => {
        if (win) win.webContents.send('file-changed', path);
      })
      .on('unlink', (path: string) => {
        if (win) win.webContents.send('file-removed', path);
      })
      .on('addDir', (path: string) => {
        if (win) win.webContents.send('directory-added', path);
      })
      .on('unlinkDir', (path: string) => {
        if (win) win.webContents.send('directory-removed', path);
      });

    console.log('watching directory', persistentPath.path);
    // stopAccess(); // Don't stop access while watching? 
    // Actually, startAccessingSecurityScopedResource returns a function to release. 
    // Ideally we keep it open while using it. But for file system events, the kernel handles it? 
    // Safe to close for now as we don't hold a file descriptor open continuously in node but chokidar might need it.
    // However, usually we can release after setting up. 
    stopAccess();
    return true;
  });

  ipcMain.handle('unwatch-directory', async (event) => {
    if (watcher) {
      watcher.close();
      watcher = null;
      console.log('stopped watching directory');
    }
    return true;
  });

  /**
   * Exit the application
   */
  ipcMain.on('exit-application', async (event, arg) => {
    if (watcher) {
      watcher.close();
    }
    shouldClose = true;
    app.quit();
  });

} catch (e) {
  // Catch Error
  // throw e;
}
