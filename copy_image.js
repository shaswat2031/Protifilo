const fs = require('fs');
try {
  fs.copyFileSync(
    'C:\\Users\\prasa\\.gemini\\antigravity-ide\\brain\\4f73e833-102d-44f1-b290-9f86734a0bfa\\philosophy_image_1780041728800.png',
    'e:\\protiflo\\public\\philosophy_image.png'
  );
  console.log('Successfully copied!');
} catch (e) {
  console.error('Failed to copy:', e);
}
