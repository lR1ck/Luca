/**
 * Gestor de contexto inteligente para LUCA
 * Mantiene historial de capturas y mensajes para enriquecer conversaciones
 */
class ContextManager {
  /**
   * Constructor del gestor de contexto
   * @param {Object} config - Configuración de límites
   * @param {number} config.captureLimit - Máximo de capturas en memoria (default: 10)
   * @param {number} config.chatLimit - Máximo de mensajes en memoria (default: 20)
   */
  constructor(config = {}) {
    this.captureHistory = [];
    this.chatHistory = [];
    this.captureLimit = config.captureLimit || 10;
    this.chatLimit = config.chatLimit || 20;

    console.log(`[ContextManager] Inicializado - Límites: ${this.captureLimit} capturas, ${this.chatLimit} mensajes`);
  }

  /**
   * Agregar nueva captura al historial
   * @param {Object} captureData - Datos de la captura
   * @param {number} captureData.timestamp - Timestamp de la captura
   * @param {string} captureData.appName - Nombre de la aplicación activa
   * @param {string} captureData.analysis - Análisis de Ollama
   * @param {string} [captureData.screenshot] - Screenshot en base64 (opcional)
   * @returns {Array} Historial actualizado de capturas
   */
  addCapture(captureData) {
    // Validar datos mínimos
    if (!captureData || !captureData.appName || !captureData.analysis) {
      console.warn('[ContextManager] ⚠️ Captura inválida, faltan datos requeridos');
      return this.captureHistory;
    }

    // Crear objeto de captura normalizado
    const capture = {
      timestamp: captureData.timestamp || Date.now(),
      appName: captureData.appName,
      analysis: captureData.analysis,
      screenshot: captureData.screenshot || null
    };

    // Agregar al inicio del array (más reciente primero)
    this.captureHistory.unshift(capture);

    // Mantener límite (eliminar las más antiguas)
    if (this.captureHistory.length > this.captureLimit) {
      const removed = this.captureHistory.splice(this.captureLimit);
      console.log(`[ContextManager] 🗑️ Eliminadas ${removed.length} capturas antiguas`);
    }

    console.log(`[ContextManager] 📸 Captura agregada (${capture.appName}), total: ${this.captureHistory.length}`);

    return this.captureHistory;
  }

  /**
   * Agregar mensaje al historial de chat
   * @param {string} role - Rol del mensaje ('user' | 'assistant')
   * @param {string} content - Contenido del mensaje
   * @returns {Object} Mensaje agregado
   */
  addMessage(role, content) {
    // Validar parámetros
    if (!role || !content) {
      console.warn('[ContextManager] ⚠️ Mensaje inválido, faltan datos');
      return null;
    }

    if (role !== 'user' && role !== 'assistant') {
      console.warn('[ContextManager] ⚠️ Rol inválido, debe ser "user" o "assistant"');
      return null;
    }

    // Crear objeto de mensaje
    const message = {
      role,
      content,
      timestamp: Date.now()
    };

    // Agregar al final del array (orden cronológico)
    this.chatHistory.push(message);

    // Mantener límite (eliminar los más antiguos)
    if (this.chatHistory.length > this.chatLimit) {
      const removed = this.chatHistory.shift();
      console.log(`[ContextManager] 🗑️ Mensaje antiguo eliminado (${removed.role})`);
    }

    console.log(`[ContextManager] 💬 Mensaje agregado (${role}), total: ${this.chatHistory.length}`);

    return message;
  }

  /**
   * Obtener capturas relevantes para una query
   * Busca keywords en los análisis de capturas
   * @param {string} query - Query del usuario
   * @returns {Array} Array de capturas relevantes (máximo 3)
   */
  getRelevantContext(query) {
    if (!query || this.captureHistory.length === 0) {
      // Si no hay query o no hay capturas, retornar las 3 más recientes
      return this.captureHistory.slice(0, 3);
    }

    console.log(`[ContextManager] 🔍 Buscando contexto relevante para: "${query}"`);

    // Extraer keywords de la query (palabras de 3+ caracteres)
    const keywords = query
      .toLowerCase()
      .split(/\s+/)
      .filter(word => word.length >= 3);

    if (keywords.length === 0) {
      // Sin keywords válidas, retornar las 3 más recientes
      return this.captureHistory.slice(0, 3);
    }

    console.log(`[ContextManager] Keywords extraídas: ${keywords.join(', ')}`);

    // Buscar capturas que contengan keywords en el análisis
    const relevantCaptures = this.captureHistory
      .map(capture => {
        const analysisLower = capture.analysis.toLowerCase();
        const appNameLower = capture.appName.toLowerCase();

        // Contar cuántas keywords coinciden
        const matchCount = keywords.filter(keyword =>
          analysisLower.includes(keyword) || appNameLower.includes(keyword)
        ).length;

        return {
          capture,
          matchCount,
          timestamp: capture.timestamp
        };
      })
      .filter(item => item.matchCount > 0) // Solo las que tienen matches
      .sort((a, b) => {
        // Ordenar por match count (descendente), luego por timestamp (más reciente primero)
        if (b.matchCount !== a.matchCount) {
          return b.matchCount - a.matchCount;
        }
        return b.timestamp - a.timestamp;
      })
      .slice(0, 3) // Tomar las 3 más relevantes
      .map(item => item.capture);

    // Si no hay matches, retornar las 3 más recientes
    if (relevantCaptures.length === 0) {
      console.log('[ContextManager] Sin matches, usando capturas más recientes');
      return this.captureHistory.slice(0, 3);
    }

    console.log(`[ContextManager] ✅ Encontradas ${relevantCaptures.length} capturas relevantes`);
    return relevantCaptures;
  }

  /**
   * Construir prompt completo con contexto para Ollama
   * @param {string} userMessage - Mensaje del usuario
   * @returns {string} Prompt formateado con contexto
   */
  buildPromptWithContext(userMessage) {
    console.log('[ContextManager] 🔨 Construyendo prompt con contexto');

    let prompt = '';

    // 1. Agregar contexto de capturas recientes (si existen)
    const relevantCaptures = this.getRelevantContext(userMessage);

    if (relevantCaptures.length > 0) {
      prompt += 'Contexto de actividad reciente del usuario:\n';

      relevantCaptures.forEach((capture, index) => {
        const timeAgo = this._formatTimeAgo(capture.timestamp);
        prompt += `\n[${index + 1}] ${timeAgo} - ${capture.appName}:\n`;
        prompt += `   ${capture.analysis}\n`;
      });

      prompt += '\n---\n\n';
    }

    // 2. Agregar historial de conversación (últimos 5 mensajes)
    const recentChat = this.chatHistory.slice(-5);

    if (recentChat.length > 0) {
      prompt += 'Historial de conversación reciente:\n';

      recentChat.forEach(msg => {
        const speaker = msg.role === 'user' ? 'Usuario' : 'Asistente';
        prompt += `${speaker}: ${msg.content}\n`;
      });

      prompt += '\n---\n\n';
    }

    // 3. Agregar mensaje actual del usuario
    prompt += `Usuario: ${userMessage}\n\n`;
    prompt += 'Asistente:';

    console.log(`[ContextManager] ✅ Prompt construido (${prompt.length} chars)`);

    return prompt;
  }

  /**
   * Obtener historial de capturas
   * @param {number} limit - Número máximo de capturas a retornar
   * @returns {Array} Array de capturas (más recientes primero)
   */
  getCaptureHistory(limit = 10) {
    const actualLimit = Math.min(limit, this.captureHistory.length);
    return this.captureHistory.slice(0, actualLimit);
  }

  /**
   * Obtener historial de chat
   * @param {number} limit - Número máximo de mensajes a retornar
   * @returns {Array} Array de mensajes (orden cronológico)
   */
  getChatHistory(limit = 20) {
    const actualLimit = Math.min(limit, this.chatHistory.length);

    // Retornar los últimos N mensajes (orden cronológico)
    return this.chatHistory.slice(-actualLimit);
  }

  /**
   * Limpiar todo el historial
   */
  clear() {
    const capturesRemoved = this.captureHistory.length;
    const messagesRemoved = this.chatHistory.length;

    this.captureHistory = [];
    this.chatHistory = [];

    console.log(`[ContextManager] 🗑️ Historial limpiado: ${capturesRemoved} capturas, ${messagesRemoved} mensajes`);
  }

  /**
   * Generar resumen de actividad basado en capturas
   * @returns {Object} Resumen de actividad
   */
  summarizeActivity() {
    if (this.captureHistory.length === 0) {
      return {
        totalCaptures: 0,
        appsUsed: [],
        mostUsedApp: null,
        timeRange: { start: null, end: null }
      };
    }

    // Contar apps usadas
    const appCounts = {};

    this.captureHistory.forEach(capture => {
      const app = capture.appName;
      appCounts[app] = (appCounts[app] || 0) + 1;
    });

    // Obtener apps únicas
    const appsUsed = Object.keys(appCounts);

    // Encontrar la app más usada
    let mostUsedApp = null;
    let maxCount = 0;

    for (const [app, count] of Object.entries(appCounts)) {
      if (count > maxCount) {
        maxCount = count;
        mostUsedApp = app;
      }
    }

    // Rango de tiempo (primera a última captura)
    const timestamps = this.captureHistory.map(c => c.timestamp);
    const start = Math.min(...timestamps);
    const end = Math.max(...timestamps);

    const summary = {
      totalCaptures: this.captureHistory.length,
      appsUsed,
      mostUsedApp,
      timeRange: { start, end }
    };

    console.log('[ContextManager] 📊 Resumen generado:', summary);

    return summary;
  }

  /**
   * Formatear timestamp como "hace X minutos/horas"
   * @private
   * @param {number} timestamp - Timestamp en milisegundos
   * @returns {string} Tiempo formateado
   */
  _formatTimeAgo(timestamp) {
    const now = Date.now();
    const diffMs = now - timestamp;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);

    if (diffMins < 1) {
      return 'Hace unos segundos';
    } else if (diffMins === 1) {
      return 'Hace 1 minuto';
    } else if (diffMins < 60) {
      return `Hace ${diffMins} minutos`;
    } else if (diffHours === 1) {
      return 'Hace 1 hora';
    } else {
      return `Hace ${diffHours} horas`;
    }
  }

  /**
   * Obtener estadísticas del ContextManager
   * @returns {Object} Estadísticas actuales
   */
  getStats() {
    return {
      captures: {
        count: this.captureHistory.length,
        limit: this.captureLimit
      },
      chat: {
        count: this.chatHistory.length,
        limit: this.chatLimit
      },
      activity: this.summarizeActivity()
    };
  }
}

module.exports = ContextManager;
