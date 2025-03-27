const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow () {
  const win = new BrowserWindow({
    width: 400,
    height: 720,
    resizable: false,
    fullscreenable: false,
    minimizable: true,
    maximizable: false,
    webPreferences: {
      contextIsolation: true
    }
  })

  win.loadURL('http://localhost:5173'); // use dev server during development
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});
