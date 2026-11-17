import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { createTaskStore } from './tasks.mjs';

const MAX_BODY_BYTES = 16_384;
const PUBLIC_URL = new URL('../public/', import.meta.url);
const STATIC_FILES = {
  '/': ['index.html', 'text/html; charset=utf-8'],
  '/app.js': ['app.js', 'application/javascript; charset=utf-8'],
  '/styles.css': ['styles.css', 'text/css; charset=utf-8']
};

function json(res, status, data) {
  const body = JSON.stringify(data);
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'content-length': Buffer.byteLength(body),
    'cache-control': 'no-store'
  });
  res.end(body);
}

async function serveStatic(res, path) {
  const [file, type] = STATIC_FILES[path];
  const content = await readFile(new URL(file, PUBLIC_URL));
  res.writeHead(200, {
    'content-type': type,
    'content-length': content.length,
    'cache-control': 'no-cache'
  });
  res.end(content);
}

async function parseBody(req) {
  const chunks = [];
  let bytes = 0;
  for await (const chunk of req) {
    bytes += chunk.length;
    if (bytes > MAX_BODY_BYTES) {
      const error = new Error('Тіло запиту завелике');
      error.status = 413;
      error.code = 'PAYLOAD_TOO_LARGE';
      throw error;
    }
    chunks.push(chunk);
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    const error = new Error('Некоректний JSON');
    error.code = 'INVALID_JSON';
    throw error;
  }
}

export function createServer(store = createTaskStore()) {
  return http.createServer(async (req, res) => {
    const path = new URL(req.url ?? '/', 'http://localhost').pathname;
    try {
      if (path === '/health' && req.method === 'GET') {
        return json(res, 200, { status: 'ok' });
      }
      if (path === '/api/tasks' && req.method === 'GET') {
        return json(res, 200, { items: store.list() });
      }
      if (path === '/api/tasks' && req.method === 'POST') {
        const body = await parseBody(req);
        return json(res, 201, store.add(body?.title));
      }
      const taskMatch = path.match(/^\/api\/tasks\/([0-9a-f-]{36})$/i);
      if (taskMatch && req.method === 'PATCH') {
        const body = await parseBody(req);
        const task = store.update(taskMatch[1], body?.completed);
        return task ? json(res, 200, task) : json(res, 404, { error: 'NOT_FOUND' });
      }
      if (taskMatch && req.method === 'DELETE') {
        const ok = store.remove(taskMatch[1]);
        return json(res, ok ? 200 : 404, ok ? { removed: true } : { error: 'NOT_FOUND' });
      }
      if (Object.hasOwn(STATIC_FILES, path) && req.method === 'GET') {
        return await serveStatic(res, path);
      }
      return json(res, 404, { error: 'NOT_FOUND' });
    } catch (error) {
      const status = error.status ?? (error.code ? 400 : 500);
      return json(res, status, {
        error: status === 500 ? 'INTERNAL_ERROR' : error.code,
        message: status === 500 ? 'Server error' : error.message
      });
    }
  });
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  const port = Number(process.env.PORT ?? 3000);
  createServer().listen(port, '0.0.0.0', () => {
    console.log(`Task Tracker працює: http://localhost:${port}`);
  });
}
