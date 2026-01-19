const { app, BrowserWindow, screen, ipcMain } = require('electron');

// Importar servicios
const OllamaClient = require('./services/OllamaClient');
const CaptureManager = require('./services/CaptureManager');
const ContextManager = require('./services/ContextManager');

let mainWindow;

// Instancias de servicios
let ollamaClient;
let captureManager;
let contextManager;

function createWindow() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;

  // Ventana inicial: 120x120px para que la bola (80px) + padding no se recorte
  mainWindow = new BrowserWindow({
    width: 120,
    height: 120,
    x: width - 140, // Margen desde el borde derecho
    y: height - 140, // Margen desde el borde inferior
    transparent: true,
    backgroundColor: '#00000000',
    alwaysOnTop: true,
    frame: false,
    resizable: false,
    skipTaskbar: true, // No aparecer en barra de tareas
    webPreferences: {
      preload: require('path').join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // En desarrollo carga desde Vite dev server
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173');
    // Opcional: abrir DevTools para debug (descomenta si necesitas)
    // mainWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    // En producción carga el build
    mainWindow.loadFile('dist/index.html');
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// IPC para redimensionar ventana dinámicamente
ipcMain.on('resize-window', (event, { width, height }) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (!win) return;

  const screenBounds = screen.getPrimaryDisplay().workAreaSize;
  const [currentX, currentY] = win.getPosition();
  const [currentWidth, currentHeight] = win.getSize();

  // Calcular ajuste de posición para mantener la bola en su lugar
  // Cuando la ventana crece, necesitamos ajustar la posición para que la bola no se mueva
  const deltaWidth = width - currentWidth;
  const deltaHeight = height - currentHeight;

  // Ajustar posición: si crece a la derecha, no mover X
  // Si crece hacia abajo, centrar verticalmente
  let newX = currentX;
  let newY = currentY;

  // Si hay espacio a la derecha, expandir ahí
  if (currentX + width > screenBounds.width) {
    // No hay espacio a la derecha, mover hacia la izquierda
    newX = Math.max(0, currentX - deltaWidth);
  }

  // Centrar verticalmente cuando se expande
  if (deltaHeight > 0) {
    newY = Math.max(0, currentY - deltaHeight / 2);
  }

  // Aplicar cambios con animación
  win.setBounds(
    {
      x: Math.round(newX),
      y: Math.round(newY),
      width: width,
      height: height,
    },
    true // animate
  );
});

// Inicializar servicios de backend
function initializeServices() {
  console.log('[Main] 🚀 Inicializando servicios...');

  // 1. Inicializar cliente Ollama
  ollamaClient = new OllamaClient('http://localhost:11434', 'llama3.2-vision');

  // 2. Inicializar context manager
  contextManager = new ContextManager({
    captureLimit: 10,
    chatLimit: 20
  });

  // 3. Inicializar capture manager
  captureManager = new CaptureManager(ollamaClient, {
    interval: 30,  // 30 segundos (llama3.2-vision tarda ~2 minutos)
    excludedApps: [],
    enabled: false // No auto-start, esperamos que el usuario lo active desde UI
  });

  // Escuchar eventos de capturas y reenviar al frontend
  captureManager.on('capture-complete', (data) => {
    console.log('[Main] ✅ Captura completa, agregando a contexto...');

    // Agregar al contexto
    contextManager.addCapture(data);

    // Enviar al frontend (sin screenshot para reducir payload)
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('capture-update', {
        timestamp: data.timestamp,
        appName: data.appName,
        analysis: data.analysis,
        captureNumber: data.captureNumber
      });
    }
  });

  captureManager.on('capture-error', (error) => {
    console.error('[Main] ❌ Error en captura:', error.error);

    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('capture-error', error);
    }
  });

  captureManager.on('status-change', (status) => {
    console.log('[Main] 🔄 Estado de capturas:', status.status);

    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('status-change', status);
    }
  });

  console.log('[Main] ✅ Servicios inicializados correctamente');
}

// === HANDLERS IPC ===

// --- CAPTURAS ---
ipcMain.on('start-captures', () => {
  console.log('[IPC] Iniciando capturas...');
  captureManager.start();
});

ipcMain.on('stop-captures', () => {
  console.log('[IPC] Deteniendo capturas...');
  captureManager.stop();
});

ipcMain.on('pause-captures', () => {
  console.log('[IPC] Pausando capturas...');
  captureManager.pause();
});

ipcMain.on('resume-captures', () => {
  console.log('[IPC] Reanudando capturas...');
  captureManager.resume();
});

ipcMain.on('update-capture-config', (event, config) => {
  console.log('[IPC] Actualizando configuración de capturas:', config);
  captureManager.updateConfig(config);
});

// --- CHAT ---
ipcMain.on('send-message', async (event, message) => {
  console.log('[IPC] Mensaje recibido:', message);

  try {
    // Agregar mensaje del usuario al contexto
    contextManager.addMessage('user', message);

    // Construir prompt con contexto
    const prompt = contextManager.buildPromptWithContext(message);

    console.log('[IPC] Enviando a Ollama...');

    // Enviar a Ollama
    const response = await ollamaClient.chat(prompt);

    if (response.success) {
      console.log('[IPC] ✅ Respuesta de Ollama recibida');

      // Agregar respuesta al contexto
      contextManager.addMessage('assistant', response.response);

      // Enviar a frontend
      event.reply('message-response', {
        role: 'assistant',
        content: response.response,
        timestamp: Date.now()
      });
    } else {
      console.error('[IPC] ❌ Error en Ollama:', response.error);
      event.reply('message-error', { error: response.error });
    }
  } catch (error) {
    console.error('[IPC] ❌ Error procesando mensaje:', error.message);
    event.reply('message-error', { error: error.message });
  }
});

// --- ESTADO Y QUERIES ---
ipcMain.handle('get-capture-history', () => {
  console.log('[IPC] Solicitando historial de capturas');
  return contextManager.getCaptureHistory();
});

ipcMain.handle('get-chat-history', () => {
  console.log('[IPC] Solicitando historial de chat');
  return contextManager.getChatHistory();
});

ipcMain.handle('get-activity-summary', () => {
  console.log('[IPC] Solicitando resumen de actividad');
  return contextManager.summarizeActivity();
});

ipcMain.handle('check-ollama-connection', async () => {
  console.log('[IPC] Verificando conexión con Ollama...');
  const result = await ollamaClient.checkConnection();
  console.log('[IPC] Estado de Ollama:', result.connected ? '✅ Conectado' : '❌ Desconectado');
  return result;
});

ipcMain.on('clear-context', () => {
  console.log('[IPC] Limpiando contexto...');
  contextManager.clear();
});

ipcMain.handle('get-capture-stats', () => {
  console.log('[IPC] Solicitando estadísticas de capturas');
  return captureManager.getStats();
});

// Crear ventana cuando la app esté lista
app.whenReady().then(() => {
  createWindow();
  initializeServices();
});

// Cerrar app cuando todas las ventanas se cierren (Windows/Linux)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// En macOS re-crear ventana si se hace click en el dock
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
