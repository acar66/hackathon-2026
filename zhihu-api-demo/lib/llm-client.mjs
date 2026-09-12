// OpenAI 兼容 LLM 客户端（知乎黑客松提供的 OpenAI Next Credits 入口）
// 知乎黑客松的 LLM 额度通过 OpenAI Next Credits 发放，接口为 OpenAI 兼容的
// /v1/chat/completions，鉴权方式为 Authorization: Bearer <API Key>。
// 注意：这与知乎开放平台的「直答」API 不同——黑客松给的 sk- 开头密钥是
// OpenAI Next Credits 的密钥，不是 developer.zhihu.com 的 Access Secret。
const DEFAULT_BASE = 'https://api.openai-next.com/v1';

// 注：OpenAI Next Credits 网关对 OpenAI 系模型（gpt-4o-mini / gpt-4o / gpt-5）流式支持良好；
// DeepSeek 系（deepseek-r1 / deepseek-chat）流式当前返回 400，故默认只用 OpenAI 系。
export const MODELS = {
  FAST: 'gpt-4o-mini',
  THINKING: 'gpt-4o',
  PRO: 'gpt-5',
};

export function getApiKey() {
  const s = process.env.LLM_API_KEY || process.env.ZHIHU_ACCESS_SECRET;
  return s && String(s).trim() ? String(s).trim() : null;
}

export function getBaseUrl() {
  return (process.env.LLM_BASE_URL || DEFAULT_BASE).replace(/\/+$/, '');
}

function authHeaders() {
  const key = getApiKey();
  if (!key) {
    const err = new Error(
      '缺少 LLM_API_KEY / ZHIHU_ACCESS_SECRET：请在 .env 配置 OpenAI Next Credits 的 API Key'
    );
    err.code = 'MISSING_SECRET';
    throw err;
  }
  return {
    Authorization: `Bearer ${key}`,
    'Content-Type': 'application/json',
  };
}

function llmError(status, bodyText) {
  let message = `HTTP ${status}`;
  try {
    const j = JSON.parse(bodyText);
    if (j?.error?.message) message = j.error.message;
  } catch {
    if (bodyText) message = bodyText.slice(0, 200);
  }
  const err = new Error(message);
  err.status = status;
  return err;
}

// 对话补全（OpenAI 兼容）。stream=true 时返回原始 fetch Response，由调用方透传 SSE。
// 响应格式与知乎直答一致：choices[0].message.content；部分推理模型会在
// delta 中带 reasoning_content（思考过程），前端可直接渲染。
export async function chatCompletion({ model = MODELS.FAST, messages, stream = false, signal } = {}) {
  if (!Array.isArray(messages) || messages.length === 0) {
    throw new Error('messages 不能为空');
  }
  const res = await fetch(`${getBaseUrl()}/chat/completions`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ model, messages, stream }),
    signal,
  });
  if (!res.ok) {
    throw llmError(res.status, await res.text());
  }
  return res;
}
