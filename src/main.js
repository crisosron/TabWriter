/*jshint esversion: 6 */
const electron = require('electron');
const {app, BrowserWindow} = electron;
const {Menu} = electron;

let isMacOS = process.platform === 'darwin' ? true : false;

const createWindow = () => {

    //Main BrowserWindow Object
    mainWindow = new BrowserWindow({
        width: 800,
        height: 500
    });

    mainWindow.loadFile('src/index.html');

    app.on('close', () => {
        if(isMacOS) mainWindow = null;
    });

    //Automatically opens dev tools in a seperate window
    mainWindow.openDevTools({mode: 'undocked'});
    

};

const createMenu = () => {
    let shortcutAccelerator = isMacOS ? 'Cmd' : 'Ctrl';
    let menuTemplate = [
        {
            label: 'File', //First Menu
            submenu: [
                {
                    label: 'New', //Menu Item
                    click: function(){console.log('New Clicked');},
                    accelerator: `${shortcutAccelerator}+N`
                },

                {
                    label: 'Open',
                    click: function(){console.log('Open Clicked');},
                    accelerator: `${shortcutAccelerator}+O`
                },

                {
                    label: 'Save',
                    click: function(){console.log('Save Clicked');},
                    accelerator: `${shortcutAccelerator}+S`
                },

                {type: 'separator'},

                {
                    label: 'Save As',
                    click: function(){console.log('Save As Clicked');},
                    accelerator: `${shortcutAccelerator}+Shift+S`
                },

                {type: 'separator'},

                {
                    label: 'New Window',
                    click: function(){console.log('New Window Clicked');},
                    accelerator: `${shortcutAccelerator}+Shift+N`
                },

                {
                    label: 'Exit',
                    click: function(){console.log('Exit Clicked');},
                    accelerator: `${shortcutAccelerator}+W`
                }
            ]
        },

        {
            label: 'Edit',
            submenu: [

                {role: 'undo'},
                {role: 'redo'},
                {type: 'separator'},
                {role: 'cut'},
                {role: 'copy'},
                {role: 'paste'},
                {type: 'separator'},
                {
                    label: 'New Measure',
                    click: function(){console.log('New Measure Clicked');},
                    accelerator: `${shortcutAccelerator}+Alt+N`
                }

            ]
        }
    ];

    const menu = Menu.buildFromTemplate(menuTemplate);
    Menu.setApplicationMenu(menu);
};

//Handling application activity
app.on('ready', () => {
    createWindow();
    createMenu();
});

app.on('window-all-closed', () => {
    if(isMacOS) app.quit();
});

app.on('activate', () => {
    if(mainWindow === null) createWindow();
});