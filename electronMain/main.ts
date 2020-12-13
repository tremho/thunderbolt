// Modules to control application life and create native browser window
import { app, BrowserWindow, ipcMain, Menu, dialog } from 'electron'
import * as path from 'path'

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
    createWindow()

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

// TODO: environment contribution, os.platform and os.release
// because we might be running on something other than the build system.

const isMac = process.platform === 'darwin'

// TODO: move menu creation to a cross-platform solution (will make a hamburger menu for mobile)

const template = [
    // { role: 'appMenu' }
    ...(isMac ? [{
        label: 'Thunderbolt', //app.name, // TODO: will say 'Electron' until packaging, apparently.
        submenu: [
            // { role: 'about' },
            {
                // label: app.name,
                label: 'About Thunderbolt',
                // Custom about
                click: function (item, focusedWindow) {
                    if (focusedWindow) {
                        const options = {
                            type: 'info',
                            title: 'About Thunderbolt',
                            buttons: ['Ok'],
                            message: 'Thunderbolt is a work in progress (c) 2020, Tremho Berserker Development, LLC'
                        }
                        dialog.showMessageBox(focusedWindow, options)
                    }
                }
            },

            { type: 'separator' },
            { role: 'services' },
            { type: 'separator' },
            { role: 'hide' },
            { role: 'hideothers' },
            { role: 'unhide' },
            { type: 'separator' },
            { role: 'quit' }
        ]
    }] : []),
    // { role: 'fileMenu' }
    {
        label: 'File',
        submenu: [
            { label: 'Attach Project'},
            { label: 'New Project'},
            { type: 'separator'},
            isMac ? { role: 'close' } : { role: 'quit' }
        ]
    },
    // { role: 'editMenu' }
    {
        label: 'Edit',
        submenu: [
            { role: 'undo' },
            { role: 'redo' },
            { type: 'separator' },
            { role: 'cut' },
            { role: 'copy' },
            { role: 'paste' },
            ...(isMac ? [
                { role: 'pasteAndMatchStyle' },
                { role: 'delete' },
                { role: 'selectAll' },
                { type: 'separator' },
                {
                    label: 'Speech',
                    submenu: [
                        { role: 'startspeaking' },
                        { role: 'stopspeaking' }
                    ]
                }
            ] : [
                { role: 'delete' },
                { type: 'separator' },
                { role: 'selectAll' }
            ])
        ]
    },
    // { role: 'viewMenu' }
    {
        label: 'View',
        submenu: [
            { role: 'reload' },
            { role: 'forcereload' },
            { role: 'toggledevtools' },
            { type: 'separator' },
            { role: 'resetzoom' },
            { role: 'zoomin' },
            { role: 'zoomout' },
            { type: 'separator' },
            { role: 'togglefullscreen' }
        ]
    },
    // { role: 'windowMenu' }
    {
        label: 'Window',
        submenu: [
            { role: 'minimize' },
            { role: 'zoom' },
            ...(isMac ? [
                { type: 'separator' },
                { role: 'front' },
                { type: 'separator' },
                { role: 'window' }
            ] : [
                { role: 'close' }
            ])
        ]
    },
    {
        role: 'help',
        submenu: [
            {
                label: 'Learn More',
                click: async () => {
                    const { shell } = require('electron')
                    await shell.openExternal('https://electronjs.org')
                }
            }
        ]
    }
]

// @ts-ignore
const menu = Menu.buildFromTemplate(template)
Menu.setApplicationMenu(menu)

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
