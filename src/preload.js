const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('vg', {
  findBinary: () => ipcRenderer.invoke('find-binary'),
  run: (args) => ipcRenderer.invoke('run', args),
  stop: () => ipcRenderer.invoke('stop'),
  selectOutputFile: () => ipcRenderer.invoke('select-output-file'),
  selectPatternFile: () => ipcRenderer.invoke('select-pattern-file'),
  selectSeedFile: () => ipcRenderer.invoke('select-seed-file'),
  onStdout: (cb) => ipcRenderer.on('stdout', (_, d) => cb(d)),
  onStderr: (cb) => ipcRenderer.on('stderr', (_, d) => cb(d)),
  onExit: (cb) => ipcRenderer.on('exit', (_, c) => cb(c)),
});
