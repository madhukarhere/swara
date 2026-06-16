#!/usr/bin/env node
/**
 * Downloads the Noto TTF fonts used for lyrics-PDF rendering into
 * backend/assets/fonts. Run once after install (needs network). The PDF
 * generator degrades gracefully to Helvetica for any font not present.
 */
import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.resolve(__dirname, '../backend/assets/fonts');
fs.mkdirSync(OUT, { recursive: true });

const BASE = 'https://raw.githubusercontent.com/googlefonts/noto-fonts/main/hinted/ttf';
const FONTS = {
  'NotoSans-Regular.ttf': `${BASE}/NotoSans/NotoSans-Regular.ttf`,
  'NotoSansTelugu-Regular.ttf': `${BASE}/NotoSansTelugu/NotoSansTelugu-Regular.ttf`,
  'NotoSansDevanagari-Regular.ttf': `${BASE}/NotoSansDevanagari/NotoSansDevanagari-Regular.ttf`,
  'NotoSansTamil-Regular.ttf': `${BASE}/NotoSansTamil/NotoSansTamil-Regular.ttf`,
  'NotoSansKannada-Regular.ttf': `${BASE}/NotoSansKannada/NotoSansKannada-Regular.ttf`,
  'NotoSansMalayalam-Regular.ttf': `${BASE}/NotoSansMalayalam/NotoSansMalayalam-Regular.ttf`,
};

function download(url, dest, redirects = 0) {
  return new Promise((resolve, reject) => {
    https
      .get(url, { headers: { 'User-Agent': 'swara-fetch-fonts' } }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location && redirects < 5) {
          res.resume();
          resolve(download(res.headers.location, dest, redirects + 1));
          return;
        }
        if (res.statusCode !== 200) {
          res.resume();
          reject(new Error(`HTTP ${res.statusCode}`));
          return;
        }
        const file = fs.createWriteStream(dest);
        res.pipe(file);
        file.on('finish', () => file.close(() => resolve(fs.statSync(dest).size)));
      })
      .on('error', reject);
  });
}

let ok = 0;
for (const [name, url] of Object.entries(FONTS)) {
  const dest = path.join(OUT, name);
  try {
    const size = await download(url, dest);
    console.log(`  ✓ ${name} (${Math.round(size / 1024)} KB)`);
    ok += 1;
  } catch (e) {
    console.warn(`  ✗ ${name} — ${e.message} (PDF will fall back to Helvetica for this script)`);
    try {
      fs.unlinkSync(dest);
    } catch {
      /* ignore */
    }
  }
}
console.log(`\nFonts ready: ${ok}/${Object.keys(FONTS).length} downloaded to ${OUT}`);
