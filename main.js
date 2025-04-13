import { app, BrowserWindow } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let mainWindow, catWindow;

app.whenReady().then(() => {
  // Main app window
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    }
  });

  mainWindow.loadURL('http://localhost:5173');

  // Cat window
  catWindow = new BrowserWindow({
    width: 128,
    height: 128,
    x: 100,
    y: 100,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    hasShadow: false,
    resizable: false,
    fullscreenable: false,
    skipTaskbar: true,
    show: false,
    webPreferences: {
      contextIsolation: true
    }
  });

  console.log('Creating cat window...');

  catWindow.loadFile(path.join(__dirname, 'cat.html'));

  catWindow.webContents.on('did-finish-load', () => {
    console.log('Cat window loaded!');
  });
  catWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('Cat window failed to load:', errorDescription);
  });

  catWindow.once('ready-to-show', () => {
    catWindow.show();
  });

  catWindow.setIgnoreMouseEvents(true);

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
