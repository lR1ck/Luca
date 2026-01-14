const { app, BrowserWindow, screen, ipcMain } = require('electron');

let mainWindow;

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

// Crear ventana cuando la app esté lista
app.whenReady().then(createWindow);

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
