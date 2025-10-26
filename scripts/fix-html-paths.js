#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distDir = path.resolve(__dirname, '../dist-frontend');

function fixHtmlPaths(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');

  // Remove leading slashes from src and href attributes
  content = content.replace(/src="\/([^"]+)"/g, 'src="$1"');
  content = content.replace(/href="\/([^"]+)"/g, 'href="$1"');

  fs.writeFileSync(filePath, content, 'utf-8');
  console.log(`✓ Fixed paths in ${path.basename(filePath)}`);
}

// Fix popup.html and options.html
const filesToFix = [
  path.join(distDir, 'popup.html'),
  path.join(distDir, 'options.html')
];

console.log('Fixing HTML paths for Chrome extension...');
filesToFix.forEach(fixHtmlPaths);
console.log('✓ All paths fixed!');
