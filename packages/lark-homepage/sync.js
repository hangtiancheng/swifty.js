// @ts-check

import { execSync } from 'child_process';
import { existsSync, rmSync, cpSync } from 'fs';
import { resolve, join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename);

const REPO = 'git@github.com:hangtiancheng/h.git';
const TEMP_DIR = resolve(__dirname, 'h');
const DOCS_DIR = resolve(__dirname, 'docs');
if (existsSync(DOCS_DIR)) {
  rmSync(DOCS_DIR, { recursive: true, force: true });
}
execSync(`git clone --depth 1 ${REPO} ${TEMP_DIR}`, { stdio: 'inherit' });
cpSync(join(TEMP_DIR, 'docs'), DOCS_DIR, { recursive: true });
rmSync(TEMP_DIR, { recursive: true, force: true });
console.log('Sync OK');
