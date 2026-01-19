# Reglas del Proyecto: LUCA - Asistente IA con Visión

## 🎯 Contexto del Proyecto

Estamos construyendo un asistente de IA que ve la pantalla del usuario y lo asiste en tiempo real.
- **Stack**: Electron + React + Vite + Ollama (LLaVA)
- **Fase actual**: Backend (Capturas + Ollama)
- **Fase completada**: ✅ UI (Frontend React)
- **Próximas fases**: Contexto inteligente, Automatización

---

## 📁 Estructura del Proyecto
```
LUCA/
├── src/
│   ├── main/              # Backend Electron (TRABAJAMOS AQUÍ AHORA)
│   │   ├── main.js        # Proceso principal de Electron
│   │   └── preload.js     # Bridge IPC seguro
│   ├── renderer/          # Frontend React (✅ COMPLETADO)
│   │   ├── components/    # Componentes React
│   │   │   ├── MenuPanel.jsx
│   │   │   ├── MenuHeader.jsx
│   │   │   ├── ChatView.jsx
│   │   │   ├── Message.jsx
│   │   │   ├── ChatInput.jsx
│   │   │   ├── PanelLuca.jsx
│   │   │   ├── StatusIndicator.jsx
│   │   │   ├── ActivityCard.jsx
│   │   │   └── QuickSettings.jsx
│   │   ├── App.jsx        # Componente raíz
│   │   ├── main.jsx       # Entry point
│   │   └── styles.css     # Estilos globales
│   └── shared/            # Código compartido (futuro)
├── public/
│   └── index.html         # HTML base
├── .env                   # Variables de entorno
└── package.json
```

---

## 📦 Componentes Implementados

### Componentes Base
- **App.jsx** (`src/renderer/App.jsx`)
  - Componente raíz de la aplicación
  - Maneja estado de panel abierto/cerrado
  - Controla resize dinámico de ventana vía IPC
  - Integra bola flotante + MenuPanel

### Bola Flotante
- **Incluido en App.jsx**
  - Bola circular draggable (80px)
  - Hover effect (scale 1.1)
  - Pulso idle cada 3 segundos
  - Click en icono ⚡ abre/cierra panel

### Menú Desplegable
- **MenuPanel.jsx** (`src/renderer/components/MenuPanel.jsx`)
  - Container principal del panel (400x600px)
  - Animación slide-in/out
  - Glassmorphism con backdrop-blur
  - Toggle entre ChatView y PanelLuca

- **MenuHeader.jsx** (`src/renderer/components/MenuHeader.jsx`)
  - Tabs "Chat" y "Panel LUCA"
  - Botón cerrar (X)
  - Highlight morado en tab activo

### Vista Chat
- **ChatView.jsx** (`src/renderer/components/ChatView.jsx`)
  - Container de chat con scroll automático
  - Mensajes de bienvenida
  - Typing indicator animado
  - Estado vacío con placeholder

- **Message.jsx** (`src/renderer/components/Message.jsx`)
  - Mensaje individual (IA o usuario)
  - Avatar emoji (🤖/👤)
  - Timestamp
  - Animación fade-in + slide-up

- **ChatInput.jsx** (`src/renderer/components/ChatInput.jsx`)
  - Textarea auto-resize (1-5 líneas)
  - Enter envía, Shift+Enter nueva línea
  - Botón adjuntar (📎) placeholder
  - Botón enviar (⚡) activo solo con texto

### Panel LUCA
- **PanelLuca.jsx** (`src/renderer/components/PanelLuca.jsx`)
  - Container principal del panel de control
  - Gestión de estados mock
  - Integra StatusIndicator + ActivityCard + QuickSettings
  - Botón Pausar/Reanudar

- **StatusIndicator.jsx** (`src/renderer/components/StatusIndicator.jsx`)
  - Indicador visual de estado (🟢/🟡/🔴)
  - Descripción contextual
  - Muestra app activa

- **ActivityCard.jsx** (`src/renderer/components/ActivityCard.jsx`)
  - Card con estadísticas (capturas, app más usada, etc.)
  - Diseño glassmorphism

- **QuickSettings.jsx** (`src/renderer/components/QuickSettings.jsx`)
  - Slider intervalo capturas (1-10s)
  - Radio buttons modo observador
  - Lista apps excluidas (agregar/eliminar)

---

## 🎨 Reglas de Estilo y Diseño

### Principios de diseño:
- **Minimalista**: Menos es más
- **Oscuro**: Tema dark por defecto
- **Glassmorphism**: backdrop-blur en paneles
- **Animaciones suaves**: transitions 200-300ms
- **Espaciado**: Padding generoso, no apretar elementos

### Paleta de colores:
```javascript
// Principales
primary: '#8B5CF6'      // Morado (botones activos, highlights)
secondary: '#3B82F6'    // Azul (gradientes, acentos)
background: '#1F2937'   // Gris oscuro (fondos)
surface: '#374151'      // Gris medio (cards, mensajes IA)
text: '#F9FAFB'        // Blanco suave (texto principal)
textMuted: '#9CA3AF'   // Gris claro (texto secundario)
success: '#10B981'     // Verde (estado activo)
warning: '#F59E0B'     // Amarillo (estado pausado)
error: '#EF4444'       // Rojo (errores)
```

### Tamaños:
- Bola flotante: 80px diámetro
- Panel desplegable: 400px x 600px
- Bordes redondeados: 16px (paneles), 12px (botones), 8px (inputs)
- Sombras: `shadow-xl` para paneles, `shadow-lg` para bola

---

## 💻 Reglas de Código

### Framework y librerías:
- **React 19** (ya instalado)
- **NO uses** class components, solo functional components
- **NO uses** CSS modules o styled-components
- **SÍ usa** Tailwind inline classes
- **NO instales** librerías adicionales sin preguntar primero

### Naming conventions:
- **Componentes**: PascalCase → `FloatingBubble.jsx`, `ChatView.jsx`
- **Funciones**: camelCase → `handleClick()`, `togglePanel()`
- **Variables**: camelCase → `isMenuOpen`, `activeTab`
- **Constantes**: UPPER_SNAKE_CASE → `CAPTURE_INTERVAL`, `DEFAULT_MODEL`
- **Archivos**: kebab-case solo para configs → `vite.config.js`

### Estructura de componentes:
```jsx
import { useState, useEffect } from 'react';

export default function MiComponente({ prop1, prop2 }) {
  // 1. Estados
  const [miEstado, setMiEstado] = useState(false);
  
  // 2. Effects
  useEffect(() => {
    // ...
  }, []);
  
  // 3. Funciones
  const handleAlgo = () => {
    // ...
  };
  
  // 4. Early returns (si aplica)
  if (!prop1) return null;
  
  // 5. Render
  return (
    <div className="tailwind-classes">
      {/* JSX aquí */}
    </div>
  );
}
```

### Reglas específicas:

#### ✅ HACER:
- Usar Tailwind inline para TODOS los estilos
- Componentes pequeños y reutilizables (< 150 líneas)
- Comentarios en español para lógica compleja
- PropTypes o TypeScript types (comentados por ahora)
- Manejar estados de carga y error
- Animaciones con Tailwind (`transition`, `duration-200`, etc.)

#### ❌ NO HACER:
- CSS externo (excepto resets globales mínimos)
- Componentes gigantes (> 200 líneas)
- Inline styles con `style={{}}` (usa Tailwind)
- console.log en producción (ok en desarrollo)
- Cualquier lógica de backend en src/renderer/

---

## 🔧 Convenciones de Electron

### Comunicación IPC (para más adelante):
```javascript
// Renderer → Main
window.electron.send('channel-name', data);

// Main → Renderer
window.electron.on('channel-name', (data) => {});
```

**POR AHORA NO implementes IPC**, solo UI pura.

---

## 📱 Especificaciones de UI

### Bolita flotante:
- Tamaño: 80px × 80px
- Gradiente: `bg-gradient-to-br from-purple-500 to-blue-500`
- Hover: scale 1.1
- Draggable: true
- Always on top: true
- Posición inicial: bottom-right (con margin)

### Panel desplegable:
- Tamaño: 400px × 600px
- Posición: al lado de la bola (derecha preferible)
- Animación entrada: slide-in 200ms
- Fondo: `bg-gray-800/95 backdrop-blur-lg`
- Sombra: `shadow-2xl`
- Border radius: `rounded-2xl`

### Tabs (Chat / Panel LUCA):
- Header fijo arriba
- Botones side-by-side
- Activo: `bg-purple-600 text-white`
- Inactivo: `text-gray-400 hover:text-white`
- Transición suave entre vistas

### Chat:
- Mensajes IA: izquierda, `bg-gray-700`
- Mensajes usuario: derecha, `bg-purple-600`
- Scroll automático al último
- Input: auto-resize (max 5 líneas)
- Placeholder: "Escribe tu mensaje..."

### Panel LUCA:
- Estado: indicador visual (🟢/🟡/🔴)
- Cards: `bg-gray-700/50 rounded-xl p-4`
- Sliders: rango 1-10 segundos
- Radio buttons: custom styled
- Botón acción: `bg-purple-600 hover:bg-purple-700`

---

## 🚫 Restricciones Importantes

### NO implementes todavía:
- ❌ Conexión real con Ollama
- ❌ Capturas de pantalla
- ❌ Detección de apps activas
- ❌ Almacenamiento persistente
- ❌ Event tracking
- ❌ IPC entre procesos

### SÍ implementa:
- ✅ UI completa y funcional
- ✅ Estados mock (datos de ejemplo)
- ✅ Navegación entre vistas
- ✅ Animaciones y transiciones
- ✅ Interacciones básicas (clicks, hover, drag)

---

## 📝 Formato de Respuestas

Cuando generes código:

1. **Siempre explica brevemente** qué hace el código
2. **Indica qué archivo crear/modificar**
3. **Muestra código completo** (no fragmentos)
4. **Incluye imports necesarios**
5. **Agrega comentarios** para partes no obvias
6. **Menciona si falta algo** por implementar

Ejemplo:
```markdown
## Archivo: src/renderer/components/FloatingBubble.jsx

Este componente crea la bolita flotante draggable.

[código aquí]

**Notas:**
- La función handleDrag está simplificada
- Falta persistir posición (lo haremos después)
```

---

## 🎯 Objetivo Actual: Integración Frontend

**FASE 1: UI** ✅ **COMPLETADA**
**FASE 2: Backend** ✅ **COMPLETADA**

Ahora estamos en la **FASE 3: Integración Frontend (Conectar UI con Backend)**

### Orden de implementación:

**Fase 1 - UI (Completada):**
1. ✅ Setup + Bolita flotante
2. ✅ Menú desplegable con toggle
3. ✅ Vista Chat
4. ✅ Panel LUCA

**Fase 2 - Backend (COMPLETADA ✅):**
5. ✅ OllamaClient - Cliente para comunicación con Ollama (llama3.2-vision)
6. ✅ CaptureManager - Sistema de capturas de pantalla automáticas
7. ✅ ContextManager - Gestión de contexto inteligente
8. ✅ Integración UI ↔ Backend vía IPC

**Fase 3 - Integración Frontend (Actual):**
9. ⏳ Conectar ChatView con backend real
10. ⏳ Conectar PanelLuca con datos en vivo
11. ⏳ Implementar controles funcionales en QuickSettings

**Fase 4 - Contexto (Próxima):**
12. ⏳ Detección de apps activas
13. ⏳ Análisis de contexto
14. ⏳ Sistema de prompts dinámicos

**Fase 5 - Automatización (Futuro):**
15. ⏳ Event tracking
16. ⏳ Almacenamiento persistente
17. ⏳ Control y automatización

---

## 🔌 Preparación para Backend

### Estructura IPC Implementada

Ya tenemos la base de comunicación IPC configurada:

**Preload Script** (`src/main/preload.js`):
```javascript
window.electron = {
  resizeWindow: (width, height) => {...},
  send: (channel, data) => {...},
  on: (channel, func) => {...}
}
```

### Canales IPC Necesarios para Backend

**Comunicación Renderer → Main:**
```javascript
// Chat
'send-message' → { text, timestamp }
'get-chat-history' → void

// Capturas
'start-capture' → { interval }
'stop-capture' → void
'pause-capture' → void
'resume-capture' → void

// Configuración
'update-settings' → { captureInterval, observerMode, excludedApps }
'get-settings' → void

// Apps
'add-excluded-app' → { appName }
'remove-excluded-app' → { appName }
```

**Comunicación Main → Renderer:**
```javascript
// Chat
'message-response' → { text, isTyping }

// Estado
'status-changed' → { status, description, activeApp }
'activity-updated' → { captures, mostUsedApp, activeTime }

// Capturas
'capture-taken' → { timestamp, path }
'capture-error' → { error }

// Settings
'settings-loaded' → { settings }
```

### Estados que Conectar al Backend

**ChatView.jsx:**
- `messages` → Conectar a historial persistente
- `handleSendMessage` → Enviar a Ollama vía IPC
- Respuestas IA → Recibir desde Main process

**PanelLuca.jsx:**
- `status` → Recibir desde CaptureManager
- `captureInterval` → Sincronizar con backend
- `observerMode` → Enviar a backend
- `excludedApps` → Persistir y sincronizar

**ActivityCard:**
- `captures` → Contador real desde CaptureManager
- `mostUsedApp` → Detectar desde active-win
- `lastQuestion` → Último mensaje enviado
- `activeTime` → Tiempo real de ejecución

### Arquitectura Backend Propuesta

```
src/main/
├── main.js              # Proceso principal (ya existe)
├── preload.js           # Bridge IPC (ya existe)
├── services/
│   ├── OllamaClient.js      # Comunicación con Ollama
│   ├── CaptureManager.js    # Capturas de pantalla
│   ├── ContextManager.js    # Gestión de contexto
│   └── SettingsManager.js   # Persistencia de configuración
└── utils/
    ├── activeWindow.js      # Detección app activa
    └── logger.js            # Sistema de logs
```

---

## 🤝 Colaboración

- Si algo no está claro, **pregunta antes de implementar**
- Si sugieres cambios, **explica el razonamiento**
- Si hay múltiples enfoques, **menciona pros/contras**
- Si falta info en las reglas, **avisa para actualizar**

---

## 🔄 Actualizaciones

Este archivo se actualizará conforme avancemos en las fases:
- ✅ Fase 1: UI completa - Componentes, estilos, animaciones
- ✅ Fase 2: Backend completo (capturas, Ollama, IPC)
- ⏳ Fase 3: Integración Frontend - **EN PROGRESO**
- ⏳ Fase 4: Reglas de contexto y prompts
- ⏳ Fase 5: Reglas de control y automatización

**Última actualización**: [19/01/2026 - 18:00]

### Changelog:
- **19/01/2026 18:00**: Completada Fase 2 (Backend). Migrado a llama3.2-vision. Sistema de capturas funcionando. Agregada sección "Estado Actual del Proyecto".
- **14/01/2026 12:30**: Completada Fase 1 (UI). Agregada sección "Componentes Implementados" y "Preparación para Backend". Actualizado roadmap de implementación.
- **14/01/2026 09:00**: Creación inicial del documento con reglas de UI.

---

## 🎯 Estado Actual del Proyecto

**Última actualización**: 19/01/2026

### ✅ Completado:
- Fase 1: UI completa con componentes React
- Fase 2: Backend funcional con IA (llama3.2-vision)
  - Sistema de capturas automáticas cada 30 segundos
  - Análisis inteligente de actividad del usuario
  - Detección de aplicación activa
  - Almacenamiento de contexto en memoria
  - IPC funcionando correctamente

### 🔄 En progreso:
- Fase 3: Conexión del frontend con datos reales del backend

### 📝 Notas técnicas:
- Modelo de IA: llama3.2-vision (cambio desde llava:7b por problemas de encoding)
- Intervalo de capturas: 30 segundos (ajustable)
- Timeout: 180 segundos (el modelo tarda ~2 min por análisis)