import fs from 'fs';
import path from 'path';

const iccDir = './src/assets/icc';
const outputFile = './src/assets/icc/profiles.json';

try {
  const files = fs.readdirSync(iccDir);
  const profiles = files
    .filter(file => file.endsWith('.icc') && file !== 'sRGB.icc')
    .map(file => file.replace('.icc', ''));

  fs.writeFileSync(outputFile, JSON.stringify(profiles, null, 2));
  console.log(`Generated ${outputFile} with ${profiles.length} profiles.`);
} catch (err) {
  console.error('Error generating ICC profile list:', err);
  process.exit(1);
}
