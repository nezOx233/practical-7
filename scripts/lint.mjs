import { execFileSync } from 'node:child_process';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const folders = ['src', 'scripts', 'tests', 'public'];
function scan(folder) {
  return readdirSync(folder, { withFileTypes: true }).flatMap((entry) => {
    const path = join(folder, entry.name);
    return entry.isDirectory() ? scan(path) : /\.(mjs|js)$/.test(entry.name) ? [path] : [];
  });
}
const files = folders.flatMap(scan);
for (const file of files) {
  execFileSync(process.execPath, ['--check', file], { stdio: 'inherit' });
  const source = readFileSync(file, 'utf8');
  if (/\r/.test(source)) throw new Error(`${file}: використовуй LF замість CRLF`);
  if (/ +(?=\n|$)/m.test(source)) throw new Error(`${file}: пробіли в кінці рядка`);
}
console.log(`Lint: перевірка синтаксису/стилю пройшла для ${files.length} файлів.`);
