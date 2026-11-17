import { cpSync, mkdirSync, rmSync, readFileSync, writeFileSync } from 'node:fs';
import { readFile } from 'node:fs/promises';

const target = 'dist';
rmSync(target, { recursive: true, force: true });
mkdirSync(target, { recursive: true });
cpSync('src', `${target}/src`, { recursive: true });
cpSync('public', `${target}/public`, { recursive: true });
const html = readFileSync(`${target}/public/index.html`, 'utf8');
if (!html.includes('app.js')) throw new Error('Фронтенд: index.html не містить app.js');
const pkg = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'));
writeFileSync(`${target}/build-info.json`, JSON.stringify({ name: pkg.name, version: pkg.version }, null, 2));
console.log(`Build готовий: ${target}/`);
