import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const targets = ['src', 'tests', 'docs'];
const allowedExtensions = new Set([
  '.ts',
  '.tsx',
  '.js',
  '.jsx',
  '.css',
  '.md',
  '.json',
]);

const unicodeEscapePattern = /\\u04[0-9a-fA-F]{2}/g;
const mojibakePatterns = [
  /вЂ/g,
  /в†/g,
  /Ѓ/g,
  /™/g,
  /�/g,
];

const failures = [];

function walk(dirPath) {
  for (const entry of fs.readdirSync(dirPath, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === 'dist') {
      continue;
    }

    const fullPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      walk(fullPath);
      continue;
    }

    if (!allowedExtensions.has(path.extname(entry.name))) {
      continue;
    }

    const text = fs.readFileSync(fullPath, 'utf8');
    const issues = [];

    if (unicodeEscapePattern.test(text)) {
      issues.push('contains Cyrillic unicode escapes');
    }

    unicodeEscapePattern.lastIndex = 0;

    for (const pattern of mojibakePatterns) {
      if (pattern.test(text)) {
        issues.push(`contains mojibake marker "${pattern.source}"`);
      }
      pattern.lastIndex = 0;
    }

    if (issues.length > 0) {
      failures.push(`${path.relative(root, fullPath)}: ${issues.join(', ')}`);
    }
  }
}

for (const target of targets) {
  const targetPath = path.join(root, target);
  if (fs.existsSync(targetPath)) {
    walk(targetPath);
  }
}

if (failures.length > 0) {
  console.error('Text integrity check failed:');
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log('Text integrity check passed.');
