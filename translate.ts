import fs from 'fs';
import https from 'https';

const storeContent = fs.readFileSync('src/store.tsx', 'utf-8');

const regex = /"([^"]+)"/g;
const stringsToTranslate = new Set<string>();

let match;
while ((match = regex.exec(storeContent)) !== null) {
  if (match[1].length > 5 && match[1].includes(' ')) {
    stringsToTranslate.add(match[1]);
  }
}

const stringsArray = Array.from(stringsToTranslate);
console.log(`Found ${stringsArray.length} strings to translate.`);

async function translateText(text: string): Promise<string> {
  return new Promise((resolve) => {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=id&dt=t&q=${encodeURIComponent(text)}`;
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve(parsed[0][0][0]);
        } catch (e) {
          resolve(text);
        }
      });
    }).on('error', () => resolve(text));
  });
}

async function run() {
  const translations: Record<string, string> = {};
  for (let i = 0; i < stringsArray.length; i++) {
    const text = stringsArray[i];
    const translated = await translateText(text);
    translations[text] = translated;
    if (i % 10 === 0) console.log(`Progress: ${i}/${stringsArray.length}`);
    // sleep to avoid rate limit
    await new Promise(r => setTimeout(r, 100));
  }

  const fileContent = `export const missionTranslations: Record<string, string> = ${JSON.stringify(translations, null, 2)};\n`;
  fs.writeFileSync('src/utils/missionTranslations.ts', fileContent);
  console.log('Done!');
}

run();
