const EventEmitter = require('events');
const screenshot = require('screenshot-desktop');
const activeWin = require('active-win');

/**
 * Gestor de capturas de pantalla periódicas con análisis mediante Ollama
 * Extiende EventEmitter para comunicar eventos al proceso principal
 */
class CaptureManager extends EventEmitter {
  /**
   * Constructor del gestor de capturas
   * @param {OllamaClient} ollamaClient - Instancia del cliente Ollama para análisis
   * @param {Object} config - Configuración inicial
   * @param {number} config.interval - Intervalo entre capturas en segundos (1-60)
   * @param {Array<string>} config.excludedApps - Lista de apps a ignorar
   * @param {boolean} config.enabled - Estado inicial (activo/pausado)
   */
  constructor(ollamaClient, config = {}) {
    super();

    // Validar que ollamaClient no sea null
    if (!ollamaClient) {
      throw new Error('[CaptureManager] OllamaClient es requerido');
    }

    this.ollamaClient = ollamaClient;

    // Configuración con valores por defecto
    this.config = {
      interval: config.interval || 3, // segundos
      excludedApps: config.excludedApps || [],
      enabled: config.enabled !== undefined ? config.enabled : true
    };

    // Validar intervalo (1-60 segundos)
    if (this.config.interval < 1 || this.config.interval > 60) {
      console.warn('[CaptureManager] ⚠️ Intervalo fuera de rango (1-60s), usando 3s por defecto');
      this.config.interval = 3;
    }

    this.intervalId = null;
    this.status = 'stopped'; // 'stopped', 'active', 'paused'
    this.captureCount = 0;

    console.log(`[CaptureManager] Inicializado con intervalo: ${this.config.interval}s, enabled: ${this.config.enabled}`);
  }

  /**
   * Iniciar capturas periódicas
   */
  start() {
    if (this.intervalId) {
      console.warn('[CaptureManager] ⚠️ Ya hay capturas en progreso');
      return;
    }

    console.log(`[CaptureManager] 🚀 Iniciando capturas cada ${this.config.interval}s`);

    this.status = this.config.enabled ? 'active' : 'paused';
    this.emit('status-change', { status: this.status });

    // Configurar intervalo de capturas
    const intervalMs = this.config.interval * 1000;

    this.intervalId = setInterval(async () => {
      // Solo capturar si está habilitado
      if (this.config.enabled) {
        await this._captureAndAnalyze();
      }
    }, intervalMs);

    // Realizar primera captura inmediatamente si está habilitado
    if (this.config.enabled) {
      this._captureAndAnalyze();
    }
  }

  /**
   * Detener todas las capturas
   */
  stop() {
    if (!this.intervalId) {
      console.warn('[CaptureManager] ⚠️ No hay capturas activas para detener');
      return;
    }

    console.log('[CaptureManager] 🛑 Deteniendo capturas');

    clearInterval(this.intervalId);
    this.intervalId = null;
    this.status = 'stopped';

    this.emit('status-change', { status: this.status });
  }

  /**
   * Pausar capturas sin detener el intervalo
   */
  pause() {
    if (!this.intervalId) {
      console.warn('[CaptureManager] ⚠️ No hay capturas activas para pausar');
      return;
    }

    console.log('[CaptureManager] ⏸️ Pausando capturas');

    this.config.enabled = false;
    this.status = 'paused';

    this.emit('status-change', { status: this.status });
  }

  /**
   * Reanudar capturas pausadas
   */
  resume() {
    if (!this.intervalId) {
      console.warn('[CaptureManager] ⚠️ No hay capturas activas para reanudar');
      return;
    }

    if (this.config.enabled) {
      console.warn('[CaptureManager] ⚠️ Las capturas ya están activas');
      return;
    }

    console.log('[CaptureManager] ▶️ Reanudando capturas');

    this.config.enabled = true;
    this.status = 'active';

    this.emit('status-change', { status: this.status });

    // Realizar captura inmediata al reanudar
    this._captureAndAnalyze();
  }

  /**
   * Actualizar configuración en caliente
   * @param {Object} newConfig - Nueva configuración parcial
   */
  updateConfig(newConfig) {
    console.log('[CaptureManager] 🔧 Actualizando configuración:', newConfig);

    const wasRunning = this.intervalId !== null;
    const intervalChanged = newConfig.interval && newConfig.interval !== this.config.interval;

    // Actualizar configuración
    if (newConfig.interval !== undefined) {
      // Validar intervalo (1-60 segundos)
      if (newConfig.interval < 1 || newConfig.interval > 60) {
        console.warn('[CaptureManager] ⚠️ Intervalo fuera de rango (1-60s), ignorando cambio');
      } else {
        this.config.interval = newConfig.interval;
      }
    }

    if (newConfig.excludedApps !== undefined) {
      this.config.excludedApps = newConfig.excludedApps;
    }

    if (newConfig.enabled !== undefined) {
      const wasEnabled = this.config.enabled;
      this.config.enabled = newConfig.enabled;

      // Si está corriendo y cambió el estado enabled
      if (wasRunning && wasEnabled !== newConfig.enabled) {
        this.status = newConfig.enabled ? 'active' : 'paused';
        this.emit('status-change', { status: this.status });
      }
    }

    // Si cambió el intervalo y está corriendo, reiniciar con nuevo intervalo
    if (intervalChanged && wasRunning) {
      console.log(`[CaptureManager] 🔄 Reiniciando con nuevo intervalo: ${this.config.interval}s`);
      this.stop();
      this.start();
    }
  }

  /**
   * Capturar pantalla y analizar con Ollama (método privado)
   * @private
   */
  async _captureAndAnalyze() {
    const timestamp = new Date().toISOString();

    try {
      this.emit('capture-start');
      console.log('[CaptureManager] 📸 Iniciando captura...');

      // 1. Obtener ventana activa
      let activeWindow = null;
      try {
        activeWindow = await activeWin();
      } catch (error) {
        console.warn('[CaptureManager] ⚠️ No se pudo obtener ventana activa:', error.message);
      }

      const appName = activeWindow?.owner?.name || 'Desconocido';
      console.log(`[CaptureManager] Ventana activa: ${appName}`);

      // 2. Verificar si la app está en excludedApps
      if (this.config.excludedApps.includes(appName)) {
        console.log(`[CaptureManager] ⏭️ App "${appName}" excluida, omitiendo captura`);
        return;
      }

      // 3. Tomar screenshot
      let screenshotBuffer = null;
      try {
        screenshotBuffer = await screenshot({ format: 'png' });
      } catch (error) {
        throw new Error(`Error al capturar pantalla: ${error.message}`);
      }

      if (!screenshotBuffer) {
        throw new Error('Screenshot buffer vacío');
      }

      console.log(`[CaptureManager] Screenshot capturado: ${screenshotBuffer.length} bytes`);

      // 4. Convertir a base64 - Validación mejorada
      // Asegurarnos de que screenshot sea un Buffer
      let validBuffer;
      if (Buffer.isBuffer(screenshotBuffer)) {
        validBuffer = screenshotBuffer;
      } else if (typeof screenshotBuffer === 'string') {
        console.warn('[CaptureManager] ⚠️ Screenshot es string, convirtiendo a Buffer...');
        validBuffer = Buffer.from(screenshotBuffer, 'binary');
      } else {
        throw new Error('Screenshot no es un Buffer válido');
      }

      // Convertir a base64 PURO (sin prefijo data:image)
      const base64Image = validBuffer.toString('base64');

      // Validaciones de base64
      console.log(`[CaptureManager] 📊 Base64 generado: ${base64Image.length} chars`);
      console.log(`[CaptureManager] 📊 Primeros 50 chars: ${base64Image.substring(0, 50)}`);
      console.log(`[CaptureManager] 📊 Últimos 50 chars: ${base64Image.substring(base64Image.length - 50)}`);

      // Validar que sea base64 válido (verificar primeros 100 chars)
      if (!/^[A-Za-z0-9+/=]+$/.test(base64Image.substring(0, 100))) {
        console.error('[CaptureManager] ⚠️ Base64 parece inválido! Primeros 100 chars:', base64Image.substring(0, 100));
      }

      // 5. Enviar a Ollama para análisis
      const prompt = 'Describe what the user is doing on this screen in one sentence.';

      console.log('[CaptureManager] 🤖 Enviando a Ollama para análisis...');

      const analysisResult = await this.ollamaClient.analyzeImage(base64Image, prompt);

      if (!analysisResult.success) {
        throw new Error(`Error en análisis Ollama: ${analysisResult.error}`);
      }

      // 6. Incrementar contador
      this.captureCount++;

      // 7. Emitir evento de captura completa
      const captureData = {
        timestamp,
        appName,
        analysis: analysisResult.response,
        screenshot: base64Image,
        captureNumber: this.captureCount
      };

      this.emit('capture-complete', captureData);

      console.log(`[CaptureManager] ✅ Captura #${this.captureCount} completada (${appName})`);

    } catch (error) {
      console.error('[CaptureManager] ❌ Error en captura:', error.message);

      this.emit('capture-error', {
        error: error.message,
        timestamp
      });
    }
  }

  /**
   * Obtener estadísticas del CaptureManager
   * @returns {Object} Estadísticas actuales
   */
  getStats() {
    return {
      status: this.status,
      captureCount: this.captureCount,
      config: { ...this.config },
      isRunning: this.intervalId !== null
    };
  }
}

module.exports = CaptureManager;
