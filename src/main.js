const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let mainWindow;
let vgProcess = null;

function findVanityGen() {
  const root = path.join(__dirname, '..');
  const candidates = [
    path.join(root, 'vanitygen++'),
    path.join(root, 'vanitygen'),
    path.join(root, 'build', 'vanitygen++'),
    path.join(root, 'vanitygen.exe'),
  ];
  for (const p of candidates) {
    try {
      require('fs').accessSync(p, require('fs').constants.X_OK);
      return p;
    } catch {}
  }
  return null;
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 960,
    height: 780,
    backgroundColor: '#0a0a0a',
    title: 'VanityGen++ // HED',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  mainWindow.loadFile(path.join(__dirname, 'index.html'));
}

app.whenReady().then(createWindow);
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });

ipcMain.handle('find-binary', () => findVanityGen());

ipcMain.handle('run', async (event, args) => {
  const bin = findVanityGen();
  if (!bin) return { error: 'vanitygen binary not found. Run `make` first.' };

  if (vgProcess) return { error: 'Already running. Stop first.' };

  vgProcess = spawn(bin, args, { cwd: path.join(__dirname, '..') });

  vgProcess.stdout.on('data', (data) => {
    mainWindow.webContents.send('stdout', data.toString());
  });

  vgProcess.stderr.on('data', (data) => {
    mainWindow.webContents.send('stderr', data.toString());
  });

  vgProcess.on('close', (code) => {
    mainWindow.webContents.send('exit', code);
    vgProcess = null;
  });

  vgProcess.on('error', (err) => {
    mainWindow.webContents.send('stderr', err.message);
    vgProcess = null;
  });

  return { ok: true };
});

ipcMain.handle('stop', async () => {
  if (vgProcess) {
    vgProcess.kill('SIGTERM');
    vgProcess = null;
    return { ok: true };
  }
  return { error: 'No process running' };
});

ipcMain.handle('select-output-file', async () => {
  const result = await dialog.showSaveDialog(mainWindow, {
    defaultPath: 'matches.txt',
    filters: [{ name: 'Text', extensions: ['txt'] }],
  });
  return result.canceled ? null : result.filePath;
});

ipcMain.handle('select-pattern-file', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    title: 'Select Pattern File',
    filters: [{ name: 'Text', extensions: ['txt'] }],
  });
  return result.filePaths.length > 0 ? result.filePaths[0] : null;
});

ipcMain.handle('select-seed-file', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    title: 'Select Seed File',
  });
  return result.filePaths.length > 0 ? result.filePaths[0] : null;
});
