// 知乎开放平台 HTTP API 客户端（仅服务端使用）
// 密钥只从环境变量 ZHIHU_ACCESS_SECRET 读取，绝不进入前端或日志。
// 协议来源：知乎开放平台 http-api.md（直答 / 搜索 / 热榜）
const BASE = 'https://developer.zhihu.com';
const CHAT_URL = `${BASE}/v1/chat/completions`;
const SEARCH_URL = `${BASE}/api/v1/content/zhihu_search`;
const HOT_URL = `${BASE}/api/v1/content/hot_list`;
const GLOBAL_SEARCH_URL = `${BASE}/api/v1/content/global_search`;

export const MODELS = {
  FAST: 'zhida-fast-1p5',
  THINKING: 'zhida-thinking-1p5',
  AGENT: 'zhida-agent',
};

export function getAccessSecret() {
  const s = process.env.ZHIHU_ACCESS_SECRET;
  return s && String(s).trim() ? String(s).trim() : null;
}

function authHeaders() {
  const secret = getAccessSecret();
  if (!secret) {
    const err = new Error('缺少 ZHIHU_ACCESS_SECRET：请在 .env 或部署平台环境变量中配置知乎开放平台 Access Secret');
    err.code = 'MISSING_SECRET';
    throw err;
  }
  return {
    Authorization: `Bearer ${secret}`,
    // 服务端会校验 Authorization 与 X-Request-Timestamp（秒级 Unix）
    'X-Request-Timestamp': String(Math.floor(Date.now() / 1000)),
    'Content-Type': 'application/json',
  };
}

function zhihuError(status, bodyText) {
  let message = `HTTP ${status}`;
  try {
    const j = JSON.parse(bodyText);
    if (j?.error?.message) message = j.error.message;
    else if (j?.Message) message = j.Message;
  } catch {
    if (bodyText) message = bodyText.slice(0, 200);
  }
  const err = new Error(message);
  err.status = status;
  return err;
}

// 直答（Chat Completions，OpenAI 兼容）。
// stream=true 时返回原始 fetch Response，由调用方读取 SSE（text/event-stream）。
export async function chatCompletion({ model = MODELS.FAST, messages, stream = false, signal } = {}) {
  if (!Array.isArray(messages) || messages.length === 0) {
    throw new Error('messages 不能为空');
  }
  const res = await fetch(CHAT_URL, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ model, messages, stream }),
    signal,
  });
  if (!res.ok) {
    throw zhihuError(res.status, await res.text());
  }
  return res;
}

// 知乎站内搜索（GET）
export async function zhihuSearch({ query, count = 5, signal } = {}) {
  if (!query) throw new Error('query 不能为空');
  const url = new URL(SEARCH_URL);
  url.searchParams.set('Query', query);
  url.searchParams.set('Count', String(Math.min(Math.max(parseInt(count, 10) || 5, 1), 10)));
  const res = await fetch(url, { headers: authHeaders(), signal });
  if (!res.ok) throw zhihuError(res.status, await res.text());
  return res.json();
}

// 知乎热榜（GET）
export async function hotList({ limit = 30, signal } = {}) {
  const url = new URL(HOT_URL);
  url.searchParams.set('Limit', String(Math.min(Math.max(parseInt(limit, 10) || 30, 1), 30)));
  const res = await fetch(url, { headers: authHeaders(), signal });
  if (!res.ok) throw zhihuError(res.status, await res.text());
  return res.json();
}

// 全网搜索（GET），支持 Filter / SearchDB
export async function globalSearch({ query, count = 10, filter = '', searchDB = 'all', signal } = {}) {
  if (!query) throw new Error('query 不能为空');
  const url = new URL(GLOBAL_SEARCH_URL);
  url.searchParams.set('Query', query);
  url.searchParams.set('Count', String(Math.min(Math.max(parseInt(count, 10) || 10, 1), 20)));
  if (filter) url.searchParams.set('Filter', filter);
  if (searchDB) url.searchParams.set('SearchDB', searchDB);
  const res = await fetch(url, { headers: authHeaders(), signal });
  if (!res.ok) throw zhihuError(res.status, await res.text());
  return res.json();
}
