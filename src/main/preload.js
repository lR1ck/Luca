const { contextBridge, ipcRenderer } = require('electron');

// Exponer API segura para comunicación con el proceso principal
contextBridge.exposeInMainWorld('electron', {
  // Resize de ventana
  resizeWindow: (width, height) => {
    ipcRenderer.send('resize-window', { width, height });
  },

  // Comunicación genérica (legacy, por si se necesita)
  send: (channel, data) => {
    const validChannels = ['toggle-panel', 'resize-window'];
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data);
    }
  },

  on: (channel, func) => {
    const validChannels = ['toggle-panel'];
    if (validChannels.includes(channel)) {
      ipcRenderer.on(channel, (event, ...args) => func(...args));
    }
  },
});
