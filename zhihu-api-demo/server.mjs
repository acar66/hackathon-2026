// 知乎开放平台 API 接入 Demo 服务端（零依赖，Node 18+）
// 职责：托管 public/ 静态页 + 把浏览器请求代理到知乎开放平台 API。
// 关键点：Access Secret 只存在于服务端环境变量，绝不下发到浏览器。
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { chatCompletion, MODELS } from './lib/llm-client.mjs';
import { zhihuSearch, hotList } from './lib/zhihu-client.mjs';

// 零依赖加载 .env（若存在），仅补充缺失的环境变量，不覆盖已设置的值。
// 这样 `node server.mjs` 即可按 README 直接读取 .env，无需 --env-file。
try {
  const envPath = path.join(path.dirname(fileURLToPath(import.meta.url)), '.env');
  if (existsSync(envPath)) {
    for (const raw of readFileSync(envPath, 'utf8').split('\n')) {
      const m = raw.match(/^\s*([\w.-]+)\s*=\s*(.*)\s*$/);
      if (m && !(m[1] in process.env)) {
        process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
      }
    }
  }
} catch { /* .env 解析失败时忽略，运行时会在缺密钥时给出清晰报错 */ }

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.join(__dirname, 'public');
const PORT = process.env.PORT || 3000;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
};

function sendJson(res, status, obj) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(obj));
}

function readBody(req, limit = 1_000_000) {
  return new Promise((resolve, reject) => {
    let data = '';
    let size = 0;
    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > limit) {
        reject(new Error('请求体过大'));
        req.destroy();
        return;
      }
      data += chunk;
    });
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });
}

async function serveStatic(req, res) {
  let rel = decodeURIComponent(req.url.split('?')[0]);
  if (rel === '/' || rel === '') rel = '/index.html';
  const safe = path.normalize(rel).replace(/^(\.\.[/\\])+/, '');
  const filePath = path.join(PUBLIC_DIR, safe);
  if (!filePath.startsWith(PUBLIC_DIR)) return sendJson(res, 403, { error: 'forbidden' });
  try {
    const buf = await readFile(filePath);
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    res.end(buf);
  } catch {
    sendJson(res, 404, { error: 'not found' });
  }
}

async function handleChat(req, res) {
  let payload;
  try {
    payload = JSON.parse((await readBody(req)) || '{}');
  } catch {
    return sendJson(res, 400, { error: '请求体不是合法 JSON' });
  }
  const allowed = new Set(Object.values(MODELS));
  const model = payload.model || MODELS.FAST;
  if (!allowed.has(model)) return sendJson(res, 400, { error: '不支持的 model', allowed: [...allowed] });
  const messages = Array.isArray(payload.messages) ? payload.messages : null;
  if (!messages) return sendJson(res, 400, { error: 'messages 必填（数组）' });
  const stream = Boolean(payload.stream);

  let upstream;
  try {
    upstream = await chatCompletion({ model, messages, stream });
  } catch (err) {
    // 在写入 SSE 头之前抛出，可安全返回 JSON 错误
    return sendJson(res, err.status || 502, { error: err.message || 'upstream error' });
  }

  if (!stream) {
    const data = await upstream.json();
    return sendJson(res, 200, data);
  }

  // 流式：把知乎的 text/event-stream 透传给浏览器
  res.writeHead(200, {
    'Content-Type': 'text/event-stream; charset=utf-8',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  });
  res.write(': keep-alive\n\n');
  try {
    const reader = upstream.body.getReader();
    const decoder = new TextDecoder();
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      res.write(decoder.decode(value, { stream: true }));
    }
  } catch (err) {
    res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
  }
  res.write('data: [DONE]\n\n');
  res.end();
}

async function handleSearch(req, res, url) {
  try {
    const data = await zhihuSearch({ query: url.searchParams.get('q') || '', count: url.searchParams.get('count') || 5 });
    return sendJson(res, 200, data);
  } catch (e) {
    return sendJson(res, e.status || 502, { error: e.message });
  }
}

async function handleHot(req, res, url) {
  try {
    const data = await hotList({ limit: url.searchParams.get('limit') || 30 });
    return sendJson(res, 200, data);
  } catch (e) {
    return sendJson(res, e.status || 502, { error: e.message });
  }
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    if (req.method === 'POST' && url.pathname === '/api/chat') return await handleChat(req, res);
    if (req.method === 'GET' && url.pathname === '/api/search') return await handleSearch(req, res, url);
    if (req.method === 'GET' && url.pathname === '/api/hot') return await handleHot(req, res, url);
    if (req.method === 'GET' && url.pathname === '/api/health') return sendJson(res, 200, { ok: true });
    if (req.method === 'GET') return await serveStatic(req, res);
    sendJson(res, 405, { error: 'method not allowed' });
  } catch (e) {
    sendJson(res, 500, { error: e.message || 'internal error' });
  }
});

server.listen(PORT, () => {
  console.log(`知乎 API Demo 已启动: http://localhost:${PORT}`);
  console.log(`模型档位: ${Object.values(MODELS).join(', ')}`);
});
