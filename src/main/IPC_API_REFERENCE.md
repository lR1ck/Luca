# IPC API Reference - LUCA

Este documento describe todas las APIs disponibles en `window.electron` para comunicación entre el frontend React y el backend Electron.

## 📋 Tabla de Contenidos

1. [Window Management](#window-management)
2. [Capturas](#capturas)
3. [Chat](#chat)
4. [Listeners de Eventos](#listeners-de-eventos)
5. [Queries Asíncronas](#queries-asíncronas)
6. [Ejemplos de Integración](#ejemplos-de-integración)

---

## Window Management

### `resizeWindow(width, height)`
Redimensiona la ventana de la aplicación.

```javascript
// Expandir para mostrar panel
window.electron.resizeWindow(520, 600);

// Contraer a bola flotante
window.electron.resizeWindow(120, 120);
```

---

## Capturas

### `startCaptures()`
Inicia el sistema de capturas periódicas.

```javascript
window.electron.startCaptures();
```

### `stopCaptures()`
Detiene completamente el sistema de capturas.

```javascript
window.electron.stopCaptures();
```

### `pauseCaptures()`
Pausa las capturas sin detener el intervalo (se pueden reanudar).

```javascript
window.electron.pauseCaptures();
```

### `resumeCaptures()`
Reanuda las capturas pausadas.

```javascript
window.electron.resumeCaptures();
```

### `updateCaptureConfig(config)`
Actualiza la configuración de capturas en caliente.

```javascript
window.electron.updateCaptureConfig({
  interval: 5, // segundos
  excludedApps: ['1Password', 'Bitwarden'],
  enabled: true
});
```

**Parámetros:**
- `interval` (number): Intervalo entre capturas en segundos (1-60)
- `excludedApps` (string[]): Array de nombres de apps a excluir
- `enabled` (boolean): Estado habilitado/deshabilitado

---

## Chat

### `sendMessage(message)`
Envía un mensaje al asistente.

```javascript
window.electron.sendMessage('¿Qué estoy haciendo?');
```

### `onMessageResponse(callback)`
Escucha respuestas del asistente.

```javascript
window.electron.onMessageResponse((data) => {
  console.log('Respuesta:', data);
  // data = { role: 'assistant', content: '...', timestamp: 123456 }
});
```

**Datos recibidos:**
- `role` (string): Siempre 'assistant'
- `content` (string): Respuesta del asistente
- `timestamp` (number): Timestamp en milisegundos

### `onMessageError(callback)`
Escucha errores al procesar mensajes.

```javascript
window.electron.onMessageError((data) => {
  console.error('Error:', data.error);
});
```

---

## Listeners de Eventos

### `onCaptureUpdate(callback)`
Escucha cuando se completa una captura.

```javascript
window.electron.onCaptureUpdate((data) => {
  console.log('Nueva captura:', data);
  // data = { timestamp, appName, analysis, captureNumber }
});
```

**Datos recibidos:**
- `timestamp` (number): Timestamp en milisegundos
- `appName` (string): Nombre de la app activa
- `analysis` (string): Análisis de Ollama
- `captureNumber` (number): Número de captura

**Nota:** El screenshot NO se envía al frontend para reducir payload.

### `onCaptureError(callback)`
Escucha errores en capturas.

```javascript
window.electron.onCaptureError((data) => {
  console.error('Error en captura:', data.error);
  // data = { error: '...', timestamp: 123456 }
});
```

### `onStatusChange(callback)`
Escucha cambios de estado del CaptureManager.

```javascript
window.electron.onStatusChange((data) => {
  console.log('Estado:', data.status);
  // data = { status: 'active' | 'paused' | 'stopped' }
});
```

---

## Queries Asíncronas

Todas estas funciones son asíncronas y retornan Promises.

### `getCaptureHistory()`
Obtiene el historial de capturas (últimas 10).

```javascript
const history = await window.electron.getCaptureHistory();
// Array de capturas: [{ timestamp, appName, analysis, screenshot }]
```

### `getChatHistory()`
Obtiene el historial de chat (últimos 20 mensajes).

```javascript
const history = await window.electron.getChatHistory();
// Array de mensajes: [{ role, content, timestamp }]
```

### `getActivitySummary()`
Obtiene resumen de actividad del usuario.

```javascript
const summary = await window.electron.getActivitySummary();
// {
//   totalCaptures: 15,
//   appsUsed: ['VSCode', 'Chrome', 'Terminal'],
//   mostUsedApp: 'VSCode',
//   timeRange: { start: 123456, end: 789012 }
// }
```

### `checkOllamaConnection()`
Verifica si Ollama está disponible.

```javascript
const conn = await window.electron.checkOllamaConnection();
// {
//   connected: true,
//   error: null,
//   models: ['llava', 'llama2', ...]
// }
```

### `getCaptureStats()`
Obtiene estadísticas del CaptureManager.

```javascript
const stats = await window.electron.getCaptureStats();
// {
//   status: 'active',
//   captureCount: 25,
//   config: { interval: 3, excludedApps: [], enabled: true },
//   isRunning: true
// }
```

### `clearContext()`
Limpia todo el contexto (capturas + chat).

```javascript
window.electron.clearContext();
```

---

## Ejemplos de Integración

### Componente ChatView.jsx

```javascript
import { useState, useEffect } from 'react';

export default function ChatView() {
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    // Cargar historial al montar
    loadChatHistory();

    // Escuchar respuestas
    window.electron.onMessageResponse((data) => {
      setMessages(prev => [...prev, data]);
      setIsTyping(false);
    });

    // Escuchar errores
    window.electron.onMessageError((data) => {
      alert('Error: ' + data.error);
      setIsTyping(false);
    });
  }, []);

  const loadChatHistory = async () => {
    const history = await window.electron.getChatHistory();
    setMessages(history);
  };

  const handleSendMessage = (text) => {
    // Agregar mensaje del usuario
    setMessages(prev => [...prev, {
      role: 'user',
      content: text,
      timestamp: Date.now()
    }]);

    // Enviar a backend
    setIsTyping(true);
    window.electron.sendMessage(text);
  };

  return (
    <div>
      {messages.map((msg, i) => (
        <Message key={i} {...msg} />
      ))}
      {isTyping && <TypingIndicator />}
      <ChatInput onSend={handleSendMessage} />
    </div>
  );
}
```

### Componente PanelLuca.jsx

```javascript
import { useState, useEffect } from 'react';

export default function PanelLuca() {
  const [status, setStatus] = useState('stopped');
  const [captures, setCaptures] = useState(0);
  const [mostUsedApp, setMostUsedApp] = useState('N/A');
  const [ollamaConnected, setOllamaConnected] = useState(false);

  useEffect(() => {
    // Verificar conexión Ollama
    checkOllama();

    // Cargar resumen inicial
    loadActivitySummary();

    // Escuchar cambios de estado
    window.electron.onStatusChange((data) => {
      setStatus(data.status);
    });

    // Escuchar nuevas capturas
    window.electron.onCaptureUpdate((data) => {
      setCaptures(prev => prev + 1);
      loadActivitySummary(); // Actualizar resumen
    });

    // Escuchar errores
    window.electron.onCaptureError((data) => {
      console.error('Error en captura:', data.error);
    });
  }, []);

  const checkOllama = async () => {
    const conn = await window.electron.checkOllamaConnection();
    setOllamaConnected(conn.connected);
  };

  const loadActivitySummary = async () => {
    const summary = await window.electron.getActivitySummary();
    setCaptures(summary.totalCaptures);
    setMostUsedApp(summary.mostUsedApp || 'N/A');
  };

  const handleStartStop = () => {
    if (status === 'stopped') {
      window.electron.startCaptures();
    } else {
      window.electron.stopCaptures();
    }
  };

  const handlePauseResume = () => {
    if (status === 'active') {
      window.electron.pauseCaptures();
    } else if (status === 'paused') {
      window.electron.resumeCaptures();
    }
  };

  return (
    <div>
      <StatusIndicator
        status={status}
        ollamaConnected={ollamaConnected}
      />

      <ActivityCard
        captures={captures}
        mostUsedApp={mostUsedApp}
      />

      <button onClick={handleStartStop}>
        {status === 'stopped' ? 'Iniciar' : 'Detener'}
      </button>

      <button onClick={handlePauseResume}>
        {status === 'active' ? 'Pausar' : 'Reanudar'}
      </button>
    </div>
  );
}
```

### Componente QuickSettings.jsx

```javascript
import { useState } from 'react';

export default function QuickSettings() {
  const [interval, setInterval] = useState(3);
  const [excludedApps, setExcludedApps] = useState([]);

  const handleIntervalChange = (newInterval) => {
    setInterval(newInterval);
    window.electron.updateCaptureConfig({ interval: newInterval });
  };

  const handleAddExcludedApp = (appName) => {
    const newList = [...excludedApps, appName];
    setExcludedApps(newList);
    window.electron.updateCaptureConfig({ excludedApps: newList });
  };

  const handleRemoveExcludedApp = (appName) => {
    const newList = excludedApps.filter(app => app !== appName);
    setExcludedApps(newList);
    window.electron.updateCaptureConfig({ excludedApps: newList });
  };

  return (
    <div>
      <label>Intervalo: {interval}s</label>
      <input
        type="range"
        min="1"
        max="10"
        value={interval}
        onChange={(e) => handleIntervalChange(Number(e.target.value))}
      />

      <h3>Apps Excluidas:</h3>
      {excludedApps.map(app => (
        <div key={app}>
          {app}
          <button onClick={() => handleRemoveExcludedApp(app)}>❌</button>
        </div>
      ))}

      <button onClick={() => {
        const app = prompt('Nombre de la app:');
        if (app) handleAddExcludedApp(app);
      }}>
        Agregar App
      </button>
    </div>
  );
}
```

---

## 🔍 Tips de Debugging

### Verificar disponibilidad de APIs

```javascript
// En la consola del navegador (DevTools)
console.log(window.electron);

// Debería mostrar todas las funciones disponibles:
// {
//   resizeWindow: ƒ,
//   startCaptures: ƒ,
//   sendMessage: ƒ,
//   ...
// }
```

### Ver logs en consola de Electron

Todos los handlers IPC tienen logs que empiezan con `[IPC]` o `[Main]`. Para verlos:

1. Descomentar `mainWindow.webContents.openDevTools()` en `main.js`
2. O ejecutar con: `npm run dev` y ver la terminal

### Verificar estado de servicios

```javascript
// Verificar Ollama
const ollama = await window.electron.checkOllamaConnection();
console.log('Ollama:', ollama);

// Verificar capturas
const stats = await window.electron.getCaptureStats();
console.log('Capturas:', stats);

// Verificar actividad
const summary = await window.electron.getActivitySummary();
console.log('Actividad:', summary);
```

---

## 🚨 Errores Comunes

### Error: "window.electron is undefined"
- **Causa**: El preload script no se cargó correctamente
- **Solución**: Verificar que `preload.js` está en `src/main/` y que la ruta en `main.js` es correcta

### Error: "Ollama no disponible"
- **Causa**: Ollama no está corriendo o no tiene el modelo LLaVA
- **Solución**:
  1. Ejecutar `ollama serve`
  2. Descargar modelo: `ollama pull llava`

### Error: "Screenshot permissions denied"
- **Causa**: macOS/Windows bloqueando permisos de captura
- **Solución**: Dar permisos de Screen Recording a Electron en Preferencias del Sistema

---

## 📚 Referencias

- [Electron IPC Documentation](https://www.electronjs.org/docs/latest/tutorial/ipc)
- [Context Bridge API](https://www.electronjs.org/docs/latest/api/context-bridge)
- [CLAUDE.md - Reglas del Proyecto](../CLAUDE.md)
