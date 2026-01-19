const axios = require('axios');

/**
 * Cliente para comunicación con Ollama (LLaVA)
 * Maneja análisis de imágenes y chat mediante la API de Ollama
 */
class OllamaClient {
  /**
   * Constructor del cliente Ollama
   * @param {string} baseURL - URL base de Ollama (default: http://localhost:11434)
   * @param {string} model - Nombre del modelo a usar (default: llama3.2-vision)
   */
  constructor(baseURL = 'http://localhost:11434', model = 'llama3.2-vision') {
    this.baseURL = baseURL;
    this.model = model;

    // Configurar cliente axios con timeout de 180 segundos (llama3.2-vision es más lento)
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 180000, // 180 segundos (3 minutos)
      headers: {
        'Content-Type': 'application/json'
      },
      // CRÍTICO: Asegurar que la respuesta se trate como texto UTF-8, no como buffer binario
      responseType: 'json',
      responseEncoding: 'utf8'
    });

    console.log(`[OllamaClient] Inicializado con URL: ${this.baseURL}, Modelo: ${this.model}`);
  }

  /**
   * Verificar si Ollama está corriendo y disponible
   * @returns {Promise<{connected: boolean, error: string|null}>}
   */
  async checkConnection() {
    try {
      console.log('[OllamaClient] Verificando conexión con Ollama...');

      // Intentar obtener la lista de modelos disponibles
      const response = await this.client.get('/api/tags');

      if (response.status === 200) {
        console.log('[OllamaClient] ✅ Conexión exitosa');

        // Verificar si el modelo está disponible
        const models = response.data.models || [];
        const modelExists = models.some(m => m.name.includes(this.model));

        if (!modelExists) {
          console.warn(`[OllamaClient] ⚠️ Modelo '${this.model}' no encontrado. Modelos disponibles:`, models.map(m => m.name));
        }

        return {
          connected: true,
          error: null,
          models: models.map(m => m.name)
        };
      }

      return {
        connected: false,
        error: 'Respuesta inesperada del servidor'
      };

    } catch (error) {
      console.error('[OllamaClient] ❌ Error de conexión:', error.message);

      if (error.code === 'ECONNREFUSED') {
        return {
          connected: false,
          error: 'No se pudo conectar con Ollama. ¿Está corriendo en ' + this.baseURL + '?'
        };
      }

      if (error.code === 'ETIMEDOUT' || error.code === 'ECONNABORTED') {
        return {
          connected: false,
          error: 'Timeout al conectar con Ollama'
        };
      }

      return {
        connected: false,
        error: error.message
      };
    }
  }

  /**
   * Analizar una imagen con LLaVA
   * @param {string} base64Image - Imagen en formato base64 (sin prefijo data:image/...)
   * @param {string} prompt - Pregunta o instrucción sobre la imagen
   * @returns {Promise<{success: boolean, response: string|null, error: string|null}>}
   */
  async analyzeImage(base64Image, prompt) {
    try {
      // Validar que la imagen no esté vacía
      if (!base64Image || base64Image.trim() === '') {
        console.error('[OllamaClient] ❌ Imagen base64 vacía');
        return {
          success: false,
          response: '',
          error: 'La imagen base64 está vacía'
        };
      }

      // Validar que el prompt no esté vacío
      if (!prompt || prompt.trim() === '') {
        console.error('[OllamaClient] ❌ Prompt vacío');
        return {
          success: false,
          response: '',
          error: 'El prompt está vacío'
        };
      }

      console.log(`[OllamaClient] Analizando imagen con prompt: "${prompt.substring(0, 50)}..."`);

      // Validaciones adicionales de la imagen antes de enviar
      console.log('[OllamaClient] 🔍 Validando imagen antes de enviar:');
      console.log(`  - Base64 length: ${base64Image.length}`);
      console.log(`  - Primeros 20 chars: ${base64Image.substring(0, 20)}`);
      console.log(`  - Últimos 20 chars: ${base64Image.substring(base64Image.length - 20)}`);
      console.log(`  - Contiene data:image prefix? ${base64Image.includes('data:image')}`);

      // Validar que sea base64 válido
      if (!/^[A-Za-z0-9+/=]+$/.test(base64Image.substring(0, 100))) {
        console.error('[OllamaClient] ⚠️ Base64 parece inválido! Primeros 100 chars:', base64Image.substring(0, 100));
        return {
          success: false,
          response: '',
          error: 'Imagen base64 inválida (contiene caracteres no permitidos)'
        };
      }

      // Preparar request body
      const requestBody = {
        model: this.model,
        messages: [
          {
            role: 'user',
            content: prompt,
            images: [base64Image]  // Array con base64 puro, sin prefijos
          }
        ],
        stream: false,
        options: {
          temperature: 0.7,
          num_predict: 200  // Generar al menos 200 tokens
        }
      };

      // Log de la estructura del request
      console.log('[OllamaClient] 📤 Request body structure:', {
        model: requestBody.model,
        messagesLength: requestBody.messages.length,
        firstMessageKeys: Object.keys(requestBody.messages[0]),
        imagesCount: requestBody.messages[0].images.length,
        firstImageLength: requestBody.messages[0].images[0].length,
        contentPreview: requestBody.messages[0].content.substring(0, 50),
        hasOptions: true,
        temperature: requestBody.options.temperature,
        num_predict: requestBody.options.num_predict
      });

      // Usar endpoint de chat en lugar de generate
      const response = await this.client.post('/api/chat', requestBody);

      // ===== LOGS DE DEBUG =====
      console.log('[OllamaClient] 🔍 DEBUG - Response completo:', {
        status: response.status,
        statusText: response.statusText,
        contentType: response.headers['content-type'],
        dataType: typeof response.data,
        dataKeys: response.data ? Object.keys(response.data) : 'null',
        dataPreview: JSON.stringify(response.data).substring(0, 300)
      });
      // ===== FIN LOGS DE DEBUG =====

      // Extraer el contenido del mensaje
      let analysisText = '';

      if (response.data?.message?.content) {
        analysisText = response.data.message.content;
      } else if (response.data?.response) {
        analysisText = response.data.response;
      } else {
        console.log('[OllamaClient] ⚠️ Formato de respuesta desconocido:', response.data);
        analysisText = '';
      }

      // Verificar si el contenido es texto o binario ANTES de limpiar
      const isBinary = typeof analysisText === 'string' && /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\xFF]/.test(analysisText);

      if (isBinary) {
        console.error('[OllamaClient] ⚠️ ALERTA: Response contiene bytes binarios!');
        console.error('  Tipo de analysisText:', typeof analysisText);
        console.error('  Length:', analysisText.length);
        console.error('  Primeros 100 chars (raw):', analysisText.substring(0, 100));
        console.error('  Primeros 100 bytes (hex):', Buffer.from(analysisText.substring(0, 100)).toString('hex'));

        // Intentar forzar conversión UTF-8
        try {
          const buffer = Buffer.from(analysisText, 'binary');
          analysisText = buffer.toString('utf8');
          console.log('[OllamaClient] ℹ️ Intentando re-decodificar como UTF-8...');
        } catch (e) {
          console.error('[OllamaClient] ❌ No se pudo re-decodificar:', e.message);
        }
      }

      // Limpiar texto solo de tokens especiales del modelo
      analysisText = analysisText
        .replace(/<s>/g, '')           // Token inicio
        .replace(/<\/s>/g, '')         // Token fin
        .replace(/<unk>/g, '')         // Token unknown
        .replace(/[\x00-\x1F\x7F-\x9F]/g, '')  // Caracteres de control
        .trim();

      console.log(`[OllamaClient] ✅ Análisis completado (${analysisText.length} chars): ${analysisText.substring(0, 100)}...`);

      return {
        success: true,
        response: analysisText
      };

    } catch (error) {
      console.error('[OllamaClient] ❌ Error al analizar imagen:', error.message);

      if (error.code === 'ECONNREFUSED') {
        return {
          success: false,
          response: '',
          error: 'Ollama no está disponible'
        };
      }

      if (error.code === 'ETIMEDOUT' || error.code === 'ECONNABORTED') {
        return {
          success: false,
          response: '',
          error: 'Timeout al analizar imagen (>180s)'
        };
      }

      if (error.response?.status === 404) {
        return {
          success: false,
          response: '',
          error: `Modelo '${this.model}' no encontrado. ¿Lo has descargado con 'ollama pull llava'?`
        };
      }

      return {
        success: false,
        response: '',
        error: error.message
      };
    }
  }

  /**
   * Enviar mensaje de chat con contexto opcional
   * @param {string} message - Mensaje del usuario
   * @param {Array<{role: string, content: string}>} context - Contexto de conversación previa (opcional)
   * @returns {Promise<{success: boolean, response: string|null, error: string|null}>}
   */
  async chat(message, context = []) {
    try {
      // Validar que el mensaje no esté vacío
      if (!message || message.trim() === '') {
        console.error('[OllamaClient] ❌ Mensaje vacío');
        return {
          success: false,
          response: null,
          error: 'El mensaje está vacío'
        };
      }

      console.log(`[OllamaClient] Enviando mensaje: "${message.substring(0, 50)}..."`);

      // Construir prompt con contexto si existe
      let fullPrompt = message;

      if (context && context.length > 0) {
        console.log(`[OllamaClient] Usando contexto de ${context.length} mensajes previos`);

        // Formatear contexto como conversación
        const contextText = context.map(msg => {
          const role = msg.role === 'user' ? 'Usuario' : 'Asistente';
          return `${role}: ${msg.content}`;
        }).join('\n');

        fullPrompt = `${contextText}\nUsuario: ${message}\nAsistente:`;
      }

      // Preparar payload para Ollama
      const payload = {
        model: this.model,
        prompt: fullPrompt,
        stream: false
      };

      // Enviar request a Ollama
      const response = await this.client.post('/api/generate', payload);

      if (response.status === 200 && response.data) {
        // Extraer el texto correctamente
        let chatResponse = '';

        // Ollama puede devolver la respuesta en diferentes formatos
        if (typeof response.data === 'string') {
          chatResponse = response.data;
        } else if (response.data.response) {
          chatResponse = response.data.response;
        } else if (response.data.message) {
          chatResponse = response.data.message.content || response.data.message;
        }

        // Limpiar caracteres de control y tokens especiales
        chatResponse = chatResponse
          .replace(/<s>/g, '')           // Remover token de inicio
          .replace(/<\/s>/g, '')         // Remover token de fin
          .replace(/<unk>/g, '')         // Remover token unknown
          .replace(/[\x00-\x1F\x7F-\x9F]/g, '') // Remover caracteres de control
          .trim();

        console.log(`[OllamaClient] ✅ Respuesta recibida (${chatResponse.length} chars): ${chatResponse.substring(0, 100)}...`);

        return {
          success: true,
          response: chatResponse,
          error: null
        };
      }

      return {
        success: false,
        response: null,
        error: 'Respuesta inválida de Ollama'
      };

    } catch (error) {
      console.error('[OllamaClient] ❌ Error en chat:', error.message);

      if (error.code === 'ECONNREFUSED') {
        return {
          success: false,
          response: null,
          error: 'Ollama no está disponible'
        };
      }

      if (error.code === 'ETIMEDOUT' || error.code === 'ECONNABORTED') {
        return {
          success: false,
          response: null,
          error: 'Timeout al procesar mensaje (>180s)'
        };
      }

      if (error.response?.status === 404) {
        return {
          success: false,
          response: null,
          error: `Modelo '${this.model}' no encontrado`
        };
      }

      return {
        success: false,
        response: null,
        error: error.message
      };
    }
  }
}

module.exports = OllamaClient;
