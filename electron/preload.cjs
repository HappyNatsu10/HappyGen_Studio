const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  isElectron: true,
  platform: process.platform,
  startDesktopAuth: (provider) => ipcRenderer.invoke('start-desktop-auth', provider),
  cancelDesktopAuth: () => ipcRenderer.invoke('cancel-desktop-auth'),
  onDesktopAuthCallback: (callback) => {
    const handler = (_event, data) => callback(data);
    ipcRenderer.on('desktop-auth-callback', handler);
    return () => ipcRenderer.removeListener('desktop-auth-callback', handler);
  },
  onDesktopAuthError: (callback) => {
    const handler = (_event, error) => callback(error);
    ipcRenderer.on('desktop-auth-error', handler);
    return () => ipcRenderer.removeListener('desktop-auth-error', handler);
  }
});
