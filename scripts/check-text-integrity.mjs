import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const targets = ['src', 'tests', 'docs'];
const rootFiles = ['vite.config.ts'];
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
  /РІР‚/g,
  /РІвЂ /g,
  /Рѓ/g,
  /в„ў/g,
  /пїЅ/g,
];
const runtimeMojibakePatterns = [
  /\u0420[\u00a0-\u00bf\u0400-\u040f\u0450-\u045f\u2018-\u2026]/g,
  /\u0421[\u00a0-\u00bf\u0400-\u040f\u0450-\u045f\u2018-\u2026]/g,
  /вЂ/g,
  /В·/g,
];

const failures = [];

function isRuntimeTextPath(fullPath) {
  const relativePath = path.relative(root, fullPath);
  return relativePath === 'vite.config.ts' || relativePath.startsWith(`src${path.sep}`);
}

function inspectFile(fullPath) {
  if (!allowedExtensions.has(path.extname(fullPath))) {
    return;
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

  if (isRuntimeTextPath(fullPath)) {
    for (const pattern of runtimeMojibakePatterns) {
      if (pattern.test(text)) {
        issues.push(`contains runtime mojibake marker "${pattern.source}"`);
      }
      pattern.lastIndex = 0;
    }
  }

  if (issues.length > 0) {
    failures.push(`${path.relative(root, fullPath)}: ${issues.join(', ')}`);
  }
}

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

    inspectFile(fullPath);
  }
}

for (const target of targets) {
  const targetPath = path.join(root, target);
  if (fs.existsSync(targetPath)) {
    walk(targetPath);
  }
}

for (const rootFile of rootFiles) {
  const rootFilePath = path.join(root, rootFile);
  if (fs.existsSync(rootFilePath)) {
    inspectFile(rootFilePath);
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
