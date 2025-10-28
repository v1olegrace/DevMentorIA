#!/usr/bin/env node
/* eslint-disable no-console */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.resolve(__dirname, '../dist-frontend');

/**
 * Resolve a file inside the dist folder while preventing directory traversal.
 * @param {string} relativePath - Path relative to dist-frontend.
 * @returns {string} Absolute path inside dist-frontend.
 */
function resolveDistPath (relativePath) {
  const absolutePath = path.resolve(distDir, relativePath);
  if (!absolutePath.startsWith(distDir)) {
    throw new Error(`Blocked path outside dist directory: ${relativePath}`);
  }
  return absolutePath;
}

/**
 * Replace leading slashes from src/href attributes to keep bundle assets relative.
 * @param {string} relativePath - HTML file path relative to dist-frontend.
 */
function fixHtmlPaths (relativePath) {
  const targetPath = resolveDistPath(relativePath);
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  let content = fs.readFileSync(targetPath, 'utf8');

  content = content.replace(/src="\/([^"]+)"/g, 'src="$1"');
  content = content.replace(/href="\/([^"]+)"/g, 'href="$1"');

  // eslint-disable-next-line security/detect-non-literal-fs-filename
  fs.writeFileSync(targetPath, content, 'utf8');
  console.log(`Fixed asset paths in ${relativePath}`);
}

const filesToFix = ['popup.html', 'options.html'];

console.log('Normalizing HTML paths for Chrome extension build...');
filesToFix.forEach(file => fixHtmlPaths(file));
console.log('HTML path normalization complete.');
