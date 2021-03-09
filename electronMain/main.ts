// Modules to control application life and create native browser window
console.log('>>>', __dirname)
import { app, BrowserWindow, ipcMain, Menu, dialog } from 'electron'
import * as path from 'path'
import TBCommand from "./src/TBCommand";

import {AppGateway} from './src/AppGateway'
new AppGateway(ipcMain)

console.log('Launching Electron App\n')

process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'YES'


// TODO: load the last saved size and position from settings
// if not there, use the configured start size


function createWindow (): void {
    // Create the browser window.
    const mainWindow:BrowserWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: false, // we handle all the node stuff back-side
            contextIsolation: true, // gateway through window.api
            enableRemoteModule: false,
            preload: path.join(__dirname, 'preload.js')
        }
    })

    // send eindow events via ipc
    mainWindow.on('resize', e=> {
        const size = mainWindow.getSize()
        // console.log('electron sees resize ', size)
        AppGateway.sendMessage('EV', {subject: 'resize', data: size})

    })

    // and load the index.html of the app.
    mainWindow.loadFile('../index.html')

    mainWindow.fullScreen = true;
    // Open the DevTools.
    mainWindow.webContents.openDevTools()
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
    TBCommand.startCLI()
    // if in a window mode
    // createWindow()

    app.on('activate', function () {
        // On macOS it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

