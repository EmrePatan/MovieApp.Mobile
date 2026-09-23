import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'i18n', 'locales');
const enPath = join(root, 'stage2-en.ts');
const itPath = join(root, 'stage2-it.ts');
const valueItPath = join(dirname(fileURLToPath(import.meta.url)), 'stage2-value-it.json');

const enSource = readFileSync(enPath, 'utf8');
const stage2En = Function(
  `"use strict"; ${enSource.replace('export const stage2En =', 'return').replace(/\s+as const;\s*$/, '')}`,
)();
const valueTranslations = JSON.parse(readFileSync(valueItPath, 'utf8'));

function translateValue(value) {
  return valueTranslations[value] ?? value;
}

function translateTree(node) {
  if (typeof node === 'string') {
    return translateValue(node);
  }

  const output = Array.isArray(node) ? [] : {};
  for (const [key, entry] of Object.entries(node)) {
    output[key] = translateTree(entry);
  }
  return output;
}

function serialize(obj, indent = 0) {
  const pad = '  '.repeat(indent);
  const padIn = '  '.repeat(indent + 1);
  if (typeof obj === 'string') {
    return `'${obj.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
  }
  if (typeof obj !== 'object' || obj === null) {
    return String(obj);
  }
  const entries = Object.entries(obj);
  const lines = entries.map(([key, value]) => {
    const renderedKey = /^[A-Za-z_$][\w$]*$/.test(key) ? key : JSON.stringify(key);
    return `${padIn}${renderedKey}: ${serialize(value, indent + 1)},`;
  });
  return `{\n${lines.join('\n')}\n${pad}}`;
}

const stage2It = translateTree(stage2En);
writeFileSync(itPath, `export const stage2It = ${serialize(stage2It)} as const;\n`);
console.log(`Wrote ${itPath}`);
