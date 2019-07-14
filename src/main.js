/*jshint esversion: 6 */
const electron = require('electron');
const {app} = electron;
const {BrowserWindow} = electron;
const {Menu} = electron;
const ipcMain = electron.ipcMain;

/*TODO: Perhaps the functions do not work in a newly created window because of mainWindow.webContents.send() 
Need to change mainWindow to refer to current window? */
let isMacOS = process.platform === 'darwin' ? true : false;
let menu = null;
const createWindow = () => {

    //Main BrowserWindow Object
    mainWindow = new BrowserWindow({
        width: 1150,
        height: 500
    });

    mainWindow.loadFile('src/index.html');
    //mainWindow.loadFile('src/test.js');

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
                    click: function(){mainWindow.webContents.send('open-file');},
                    accelerator: `${shortcutAccelerator}+O`
                },

                {
                    label: 'Save',
                    click: function(){mainWindow.webContents.send('save-file');},
                    accelerator: `${shortcutAccelerator}+S`
                },

                {type: 'separator'},

                {
                    label: 'Save As',
                    click: function(){mainWindow.webContents.send('save-file-as');},
                    accelerator: `${shortcutAccelerator}+Shift+S`
                },

                {type: 'separator'},

                {
                    label: 'New Window',
                    click: function(){mainWindow.webContents.send('invoke-create-new-window');},
                    accelerator: `${shortcutAccelerator}+Shift+N`
                },

                {
                    label: 'Exit',
                    click: function(){mainWindow.webContents.send('exit');},
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
                    click: function(){mainWindow.webContents.send('create-measure');}, //Sending request to ipcRenderer in TabWriter.js to create measure
                    accelerator: `${shortcutAccelerator}+Alt+N`
                }

            ]
        }
    ];

    menu = Menu.buildFromTemplate(menuTemplate);
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

//First ackknowledge to create the first bar and measure - This event is triggerred from TabWriter.js
ipcMain.on('setup-first-measure', (event) => {
    event.sender.send('create-measure'); //Triggerring event in TabWriter.js
});

ipcMain.on('change-window-title', (args) => {
    //TODO: Develop this
});

ipcMain.on('create-new-window', () => {
    let newWindow = new BrowserWindow({
        width: 1150,
        height: 500
    });

    newWindow.loadFile('src/index.html');

    newWindow.openDevTools({mode: 'undocked'});

});




