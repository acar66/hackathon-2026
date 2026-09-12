import http from 'node:http';
import { readFileSync } from 'node:fs';
import { readFile, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { chatCompletion, MODELS } from './lib/llm-client.mjs';
import { buildPersonaPrompt } from '../src/lib/persona.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.resolve(__dirname, '../dist');
const PORT = Number(process.env.PORT) || 3000;
console.log('[persona-card] DIST =', DIST);

// 轻量 .env 加载器（零依赖）：让 `node server.mjs` 直接读取 .env，无需 --env-file
function loadEnv() {
  try {
    const envPath = path.resolve(__dirname, '../.env');
    const raw = readFileSync(envPath, 'utf8');
    for (const line of raw.split('\n')) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m && !process.env[m[1]]) {
        process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
      }
    }
  } catch {
    /* 无 .env 也可运行（用环境变量注入） */
  }
}
loadEnv();

function sendJSON(res, status, obj) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(obj));
}

function readBody(req, limit = 1 << 20) {
  return new Promise((resolve, reject) => {
    let data = '';
    let size = 0;
    req.on('data', (c) => {
      size += c.length;
      if (size > limit) { reject(new Error('body too large')); req.destroy(); }
      else data += c;
    });
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });
}

const CONTENT_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
};

async function serveStatic(req, res) {
  let urlPath = decodeURIComponent(req.url.split('?')[0]);
  if (urlPath === '/') urlPath = '/index.html';
  const filePath = path.join(DIST, urlPath);
  if (!filePath.startsWith(DIST)) { res.writeHead(403); res.end('forbidden'); return; }
  try {
    const s = await stat(filePath);
    if (s.isDirectory()) throw new Error('dir');
    const body = await readFile(filePath);
    const ext = path.extname(filePath);
    res.writeHead(200, { 'Content-Type': CONTENT_TYPES[ext] || 'application/octet-stream' });
    res.end(body);
  } catch {
    // SPA 兜底：回 index.html
    try {
      const body = await readFile(path.join(DIST, 'index.html'));
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(body);
    } catch (e) {
      console.error('[serveStatic] fallback err:', e.message);
      res.writeHead(404);
      res.end('Not found. 请先运行 npm run build 生成 dist/。');
    }
  }
}

const server = http.createServer(async (req, res) => {
  const { pathname } = new URL(req.url, `http://${req.headers.host}`);

  if (req.method === 'GET' && pathname === '/api/health') {
    return sendJSON(res, 200, { ok: true, time: new Date().toISOString() });
  }

  if (req.method === 'POST' && pathname === '/api/chat') {
    try {
      const body = JSON.parse(await readBody(req));
      const model = body.model || MODELS.FAST;
      const upstream = await chatCompletion({
        model,
        messages: body.messages,
        stream: Boolean(body.stream),
      });
      if (body.stream) {
        res.writeHead(200, {
          'Content-Type': 'text/event-stream; charset=utf-8',
          'Cache-Control': 'no-cache',
          Connection: 'keep-alive',
        });
        for await (const chunk of upstream.body) res.write(chunk);
        res.end();
      } else {
        const j = await upstream.json();
        sendJSON(res, 200, j);
      }
    } catch (e) {
      sendJSON(res, 502, { ok: false, error: e.message || 'chat failed' });
    }
    return;
  }

  if (req.method === 'POST' && pathname === '/api/persona') {
    try {
      const body = JSON.parse(await readBody(req));
      const prompt = buildPersonaPrompt(body.answers || [], body.dimensions || {});
      const upstream = await chatCompletion({
        model: MODELS.FAST,
        messages: [
          { role: 'system', content: '你是一个严谨的 JSON 生成器，只输出 JSON，不做任何解释。' },
          { role: 'user', content: prompt },
        ],
        stream: false,
      });
      const j = await upstream.json();
      const content = j?.choices?.[0]?.message?.content || '';
      sendJSON(res, 200, { ok: true, content });
    } catch (e) {
      sendJSON(res, 502, { ok: false, error: e.message || 'persona failed' });
    }
    return;
  }

  if (req.method === 'GET') {
    return serveStatic(req, res);
  }

  res.writeHead(404);
  res.end('Not found');
});

server.listen(PORT, () => {
  console.log(`[persona-card] server on http://localhost:${PORT}`);
});
