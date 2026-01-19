const screenshot = require('screenshot-desktop');
const fs = require('fs');
const path = require('path');

async function testScreenshot() {
  console.log('📸 Tomando captura de prueba...');

  try {
    const imgBuffer = await screenshot();
    const filepath = path.join(__dirname, 'test-capture.png');

    fs.writeFileSync(filepath, imgBuffer);
    console.log(`✅ Captura guardada en: ${filepath}`);

    // También crear el base64
    const base64 = imgBuffer.toString('base64');
    const base64File = path.join(__dirname, 'test-capture-base64.txt');
    fs.writeFileSync(base64File, base64);
    console.log(`✅ Base64 guardado en: ${base64File}`);
    console.log(`📊 Tamaño base64: ${base64.length} chars`);
    console.log(`📊 Primeros 50 chars: ${base64.substring(0, 50)}`);

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testScreenshot();
