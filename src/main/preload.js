const { contextBridge, ipcRenderer } = require('electron');

// Exponer API segura para comunicación con el proceso principal
contextBridge.exposeInMainWorld('electron', {
  // === WINDOW ===
  resizeWindow: (width, height) => {
    ipcRenderer.send('resize-window', { width, height });
  },

  // === CAPTURAS ===
  startCaptures: () => {
    console.log('[Preload] Enviando start-captures');
    ipcRenderer.send('start-captures');
  },

  stopCaptures: () => {
    console.log('[Preload] Enviando stop-captures');
    ipcRenderer.send('stop-captures');
  },

  pauseCaptures: () => {
    console.log('[Preload] Enviando pause-captures');
    ipcRenderer.send('pause-captures');
  },

  resumeCaptures: () => {
    console.log('[Preload] Enviando resume-captures');
    ipcRenderer.send('resume-captures');
  },

  updateCaptureConfig: (config) => {
    console.log('[Preload] Enviando update-capture-config:', config);
    ipcRenderer.send('update-capture-config', config);
  },

  // === CHAT ===
  sendMessage: (message) => {
    console.log('[Preload] Enviando mensaje:', message);
    ipcRenderer.send('send-message', message);
  },

  onMessageResponse: (callback) => {
    ipcRenderer.on('message-response', (event, data) => {
      console.log('[Preload] Respuesta recibida');
      callback(data);
    });
  },

  onMessageError: (callback) => {
    ipcRenderer.on('message-error', (event, data) => {
      console.error('[Preload] Error en mensaje:', data);
      callback(data);
    });
  },

  // === LISTENERS DE EVENTOS ===
  onCaptureUpdate: (callback) => {
    ipcRenderer.on('capture-update', (event, data) => {
      console.log('[Preload] Captura recibida:', data.appName);
      callback(data);
    });
  },

  onCaptureError: (callback) => {
    ipcRenderer.on('capture-error', (event, data) => {
      console.error('[Preload] Error en captura:', data);
      callback(data);
    });
  },

  onStatusChange: (callback) => {
    ipcRenderer.on('status-change', (event, data) => {
      console.log('[Preload] Estado cambiado:', data.status);
      callback(data);
    });
  },

  // === QUERIES ASÍNCRONAS ===
  getCaptureHistory: async () => {
    console.log('[Preload] Solicitando historial de capturas');
    return await ipcRenderer.invoke('get-capture-history');
  },

  getChatHistory: async () => {
    console.log('[Preload] Solicitando historial de chat');
    return await ipcRenderer.invoke('get-chat-history');
  },

  getActivitySummary: async () => {
    console.log('[Preload] Solicitando resumen de actividad');
    return await ipcRenderer.invoke('get-activity-summary');
  },

  checkOllamaConnection: async () => {
    console.log('[Preload] Verificando conexión con Ollama');
    return await ipcRenderer.invoke('check-ollama-connection');
  },

  getCaptureStats: async () => {
    console.log('[Preload] Solicitando estadísticas de capturas');
    return await ipcRenderer.invoke('get-capture-stats');
  },

  clearContext: () => {
    console.log('[Preload] Limpiando contexto');
    ipcRenderer.send('clear-context');
  },
});
