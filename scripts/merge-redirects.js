#!/usr/bin/env node
// Merge partial Netlify redirect files into the final manifest.
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const publicDir = path.join(rootDir, 'public');
const dataDir = path.join(rootDir, 'data');
const redirectsDir = path.join(dataDir, 'redirects');
const sourceFiles = ['releases', 'artists', 'old'];

async function readSection(filePath) {
  try {
    const raw = await readFile(filePath, 'utf8');
    const normalized = raw.replace(/\r\n/g, '\n').trim();
    return normalized.length > 0 ? normalized : null;
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.warn(`[merge-redirects] missing ${path.relative(rootDir, filePath)}, skipping.`);
      return null;
    }
    throw error;
  }
}

const sections = [];
for (const fileName of sourceFiles) {
  const filePath = path.join(redirectsDir, fileName);
  const section = await readSection(filePath);
  if (section) {
    sections.push(section);
  }
}

const output = sections.join('\n\n');
const outputPath = path.join(publicDir, '_redirects');

await writeFile(outputPath, output ? `${output}\n` : '', 'utf8');
console.log(`[merge-redirects] Wrote ${path.relative(rootDir, outputPath)} from ${sections.length} section${sections.length === 1 ? '' : 's'}.`);
