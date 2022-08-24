import path from 'path'
import { BrowserWindow, Menu, MenuItem, app, ipcMain } from 'electron'

export const ROOT_PATH = {
  // /dist
  // dist: path.join(__dirname, '../..'),
  dist: path.join(__dirname, '../renderer'),
  // /dist or /public
  // public: path.join(__dirname, app.isPackaged ? '../..' : '../../../public'),
}

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
// if (require('electron-squirrel-startup')) {
//   app.quit()
// }

let count = 0

const createWindow = (): void => {
  count++
  let x = 20
  let y = 20
  const frontWindow = BrowserWindow.getFocusedWindow()
  if (frontWindow) {
    const bounds = frontWindow.getBounds()
    x = bounds.x + 20
    y = bounds.y + 20
  }

  // are we running tests?
  const testing = process.env.CI === 'e2e'

  const mainWindow = new BrowserWindow({
    height: 600,
    width: 800,
    x,
    y,
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      additionalArguments: [`--window-id=${count}`],
      nodeIntegration: !!testing,
      contextIsolation: !testing,
    },
    show: false,
  })

  const indexHtml = path.join(ROOT_PATH.dist, 'index.html')

  // and load the index.html of the app.
  // mainWindow.loadURL(indexHtml);
  mainWindow.loadFile(indexHtml)

  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
  })

  // Open the DevTools.
  // mainWindow.webContents.openDevTools();
}

function initMenu() {
  const menu = Menu.getApplicationMenu()
  // create the "New Window" MenuItem
  const newWindow = new MenuItem({
    label: 'New Window',
    id: 'new-window',
    accelerator: 'CmdOrCtrl+N',
    click: () => {
      createWindow()
    },
  })
  // find the "File" MenuItem
  if (menu) {
    const filemenu = menu.items.find(({ role }) => role === (process.platform !== 'darwin' ? 'fileMenu' : 'fileMenu'.toLowerCase()))
    // add the "New Window" MenuItem to the beginning of the File menu
    filemenu?.submenu?.insert(0, newWindow)
  }
  // update the application menu
  Menu.setApplicationMenu(menu)
}

app.on('ready', () => {
  initMenu()
  createWindow()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

/**
 * Respond to IPC request for a new window
 */
ipcMain.on('new-window', () => {
  createWindow()
})

/**
 * Return the current number of windows (via IPC)
 */
ipcMain.handle('how-many-windows', () => {
  return count
})

function mainSynchronousData() {
  return 'Main Synchronous Data'
}

async function mainAsynchronousData() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve('Main Asynchronous Data')
    }, 1000)
  })
}

ipcMain.on('main-synchronous-data', (event, arg) => {
  return mainSynchronousData()
})

ipcMain.on('main-asynchronous-data', async (event, arg) => {
  return await mainAsynchronousData()
})
