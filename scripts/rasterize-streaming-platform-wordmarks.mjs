import { readdir } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const root = path.resolve(import.meta.dirname, '..');
const sourceDir = path.join(root, 'assets', 'streaming-platforms', 'source');
const outDir = path.join(root, 'assets', 'streaming-platforms');

/** Target raster width per source basename (px). */
const WIDTH_BY_BASENAME = {
  'netflix.svg': 360,
  'prime-video.svg': 360,
  'disney-plus.svg': 380,
  'apple-tv-plus.svg': 220,
  'max.svg': 300,
  'paramount-plus.svg': 360,
  'crunchyroll.svg': 300,
};

const files = (await readdir(sourceDir)).filter((name) => name.endsWith('.svg'));

for (const file of files) {
  const input = path.join(sourceDir, file);
  const output = path.join(outDir, file.replace(/\.svg$/, '.png'));
  const width = WIDTH_BY_BASENAME[file] ?? 320;
  await sharp(input, { density: 300 })
    .resize({ width })
    .trim()
    .png()
    .toFile(output);
  console.log(`Wrote ${path.relative(root, output)} (${width}px wide)`);
}
