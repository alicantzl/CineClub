const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  windowControl: (action) => ipcRenderer.send('window-control', action),
  onWindowStateChange: (callback) =>
    ipcRenderer.on('window-state-change', (_event, state) => callback(state)),
  isMaximized: () => ipcRenderer.invoke('is-maximized'),
});
