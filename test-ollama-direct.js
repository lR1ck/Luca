/**
 * Script de prueba directa para Ollama + Llama 3.2 Vision
 * Toma un screenshot y lo envía directamente sin intermediarios
 */

const screenshot = require('screenshot-desktop');
const axios = require('axios');
const fs = require('fs');

async function testOllamaDirect() {
  console.log('🧪 TEST DIRECTO OLLAMA + LLAMA 3.2 VISION');
  console.log('================================\n');

  try {
    // 1. Capturar screenshot
    console.log('📸 Capturando screenshot...');
    const screenshotBuffer = await screenshot({ format: 'png' });
    console.log(`✅ Screenshot capturado: ${screenshotBuffer.length} bytes`);
    console.log(`   Tipo: ${typeof screenshotBuffer}`);
    console.log(`   Es Buffer: ${Buffer.isBuffer(screenshotBuffer)}`);

    // 2. Guardar screenshot para verificación visual
    const testImagePath = './test-screenshot.png';
    fs.writeFileSync(testImagePath, screenshotBuffer);
    console.log(`💾 Screenshot guardado en: ${testImagePath}\n`);

    // 3. Convertir a base64
    console.log('🔄 Convirtiendo a base64...');
    const base64Image = screenshotBuffer.toString('base64');
    console.log(`✅ Base64 generado: ${base64Image.length} chars`);
    console.log(`   Primeros 50: ${base64Image.substring(0, 50)}`);
    console.log(`   Últimos 50: ${base64Image.substring(base64Image.length - 50)}`);
    console.log(`   Tiene prefijo data:image? ${base64Image.includes('data:image')}`);

    // Validar que sea base64 válido
    const isValidBase64 = /^[A-Za-z0-9+/=]+$/.test(base64Image);
    console.log(`   Es base64 válido? ${isValidBase64}\n`);

    if (!isValidBase64) {
      console.error('❌ ERROR: Base64 inválido!');
      process.exit(1);
    }

    // 4. Enviar a Ollama
    console.log('🤖 Enviando a Ollama (llama3.2-vision)...');
    console.log('   URL: http://localhost:11434/api/chat');

    console.log('   Request structure:', {
      model: 'llama3.2-vision',
      messageContent: 'Describe in detail what you see in this screenshot. What is the user doing?',
      imagesCount: 1,
      imageLength: base64Image.length,
      hasOptions: true,
      temperature: 0.7,
      num_predict: 200
    });

    const startTime = Date.now();
    const response = await axios.post('http://localhost:11434/api/chat', {
      model: 'llama3.2-vision',
      messages: [
        {
          role: 'user',
          content: 'Describe in detail what you see in this screenshot. What is the user doing?',
          images: [base64Image]
        }
      ],
      stream: false,
      options: {
        temperature: 0.7,
        num_predict: 200  // Forzar al menos 200 tokens
      }
    }, {
      timeout: 180000
    });
    const endTime = Date.now();

    console.log(`\n✅ Respuesta recibida en ${(endTime - startTime) / 1000}s`);
    console.log('   Status:', response.status);
    console.log('   Response data keys:', Object.keys(response.data));

    // 5. Analizar respuesta
    console.log('\n📊 ANÁLISIS DE RESPUESTA:');
    console.log('================================');
    console.log('Response completo:', JSON.stringify(response.data, null, 2));

    let content = '';
    if (response.data?.message?.content) {
      content = response.data.message.content;
    } else if (response.data?.response) {
      content = response.data.response;
    }

    console.log('\n📝 CONTENIDO EXTRAÍDO:');
    console.log('================================');
    console.log(content);

    // Verificar si es binario/corrupto
    const hasBinaryChars = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/.test(content);
    console.log(`\n¿Contiene caracteres binarios? ${hasBinaryChars}`);

    if (hasBinaryChars) {
      console.error('❌ PROBLEMA: La respuesta contiene bytes binarios!');
      console.log('Primeros 200 bytes (hex):', Buffer.from(content.substring(0, 200)).toString('hex'));
    } else {
      console.log('✅ La respuesta es texto limpio');
    }

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
    if (error.code) {
      console.error('   Code:', error.code);
    }
    process.exit(1);
  }
}

// Ejecutar test
testOllamaDirect().catch(console.error);
