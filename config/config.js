//Created by mkafr on 1/16/2018.

const path = require('path');
const url = require('url');

const electron = require('electron');
const app = electron.app;

const BrowserWindow = electron.BrowserWindow;

let mainWindow;

app.on('ready', function () {
    mainWindow = new BrowserWindow({});
    mainWindow.setMenu(null);
    mainWindow.maximize();
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, '/settings.html'),
        protocol: "file:",
        slashes: true
    }))
});
