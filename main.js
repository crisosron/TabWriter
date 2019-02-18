/*jshint esversion: 6 */
const electron = require('electron');
const {app, BrowserWindow} = electron;

let isMacOS = process.platform === 'darwin' ? true : false;

const createWindow = () => {

    //Main BrowserWindow Object
    mainWindow = new BrowserWindow({
        width: 400,
        height: 200
    });

    app.on('close', () => {
        if(isMacOS) mainWindow = null;
    });
};

//Handling application activity
app.on('ready', createWindow);

app.on('window-all-closed', () => {
    if(isMacOS) app.quit();
});

app.on('activate', () => {
    if(mainWindow === null) createWindow();
});