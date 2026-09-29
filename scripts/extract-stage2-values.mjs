import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptsDir = dirname(fileURLToPath(import.meta.url));
const localesDir = join(scriptsDir, '..', 'src', 'i18n', 'locales');
const enPath = join(localesDir, 'stage2-en.ts');
const outPath = join(scriptsDir, 'stage2-unique-values.json');

function loadConstExport(tsPath, exportName) {
  const source = readFileSync(tsPath, 'utf8');
  return Function(
    `"use strict"; ${source.replace(`export const ${exportName} =`, 'return').replace(/\s+as const;\s*$/, '')}`,
  )();
}

function loadStage2En() {
  const crewJobsEn = loadConstExport(join(localesDir, 'crew-jobs', 'en.ts'), 'crewJobsEn');
  const enSource = readFileSync(enPath, 'utf8').replace(/^import\s+.*?;\s*\n/m, '');
  return Function(
    `"use strict"; const crewJobsEn = ${JSON.stringify(crewJobsEn)}; ${enSource.replace('export const stage2En =', 'return').replace(/\s+as const;\s*$/, '')}`,
  )();
}

/** @param {unknown} node @param {Set<string>} values */
function collectStringValues(node, values) {
  if (typeof node === 'string') {
    values.add(node);
    return;
  }
  if (typeof node !== 'object' || node === null) {
    return;
  }
  for (const entry of Object.values(node)) {
    collectStringValues(entry, values);
  }
}

const stage2En = loadStage2En();
const unique = new Set();
collectStringValues(stage2En, unique);
const values = [...unique].sort((a, b) => a.localeCompare(b, 'en'));

writeFileSync(outPath, `${JSON.stringify(values, null, 2)}\n`);
console.log(`Wrote ${values.length} unique values to ${outPath}`);
