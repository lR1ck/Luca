# Reglas del Proyecto: LUCA - Asistente IA con Visión

## 🎯 Contexto del Proyecto

Estamos construyendo un asistente de IA que ve la pantalla del usuario y lo asiste en tiempo real.
- **Stack**: Electron + React + Vite + Ollama (LLaVA)
- **Fase actual**: UI (Frontend React)
- **Próximas fases**: Backend (capturas + Ollama), Contexto inteligente

---

## 📁 Estructura del Proyecto
```
LUCA/
├── src/
│   ├── main/              # Backend Electron (NO TOCAR POR AHORA)
│   ├── renderer/          # Frontend React (TRABAJAMOS AQUÍ)
│   │   ├── components/    # Componentes React
│   │   ├── App.jsx        # Componente raíz
│   │   ├── main.jsx       # Entry point
│   │   └── styles.css     # Estilos globales (opcional)
│   └── shared/            # Código compartido (NO TOCAR POR AHORA)
├── public/
│   └── index.html         # HTML base
├── .env                   # Variables de entorno
└── package.json
```

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

## 🎯 Objetivo Actual: UI Completa

Estamos en la **FASE 1: UI**

Orden de implementación:
1. ✅ Setup + Bolita flotante
2. ⏳ Menú desplegable con toggle
3. ⏳ Vista Chat
4. ⏳ Panel LUCA

Cada paso debe:
- Funcionar independientemente
- Tener datos mock
- Verse pulido (no placeholder gris)
- Ser responsive dentro del panel (400px fijo)

---

## 🤝 Colaboración

- Si algo no está claro, **pregunta antes de implementar**
- Si sugieres cambios, **explica el razonamiento**
- Si hay múltiples enfoques, **menciona pros/contras**
- Si falta info en las reglas, **avisa para actualizar**

---

## 🔄 Actualizaciones

Este archivo se actualizará conforme avancemos en las fases:
- Fase 2: Reglas de backend (capturas, Ollama)
- Fase 3: Reglas de contexto y prompts
- Fase 4: Reglas de control y automatización

**Última actualización**: [14/01/2026]