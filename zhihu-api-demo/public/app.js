// 浏览器端：调用本地 /api/chat（流式 SSE），把知乎直答的回复渲染成对话。
const $chat = document.getElementById('chat');
const $input = document.getElementById('input');
const $send = document.getElementById('send');
const $model = document.getElementById('model');
const $status = document.getElementById('status');

const messages = [
  { role: 'system', content: '你是「跨次元游乐场」里的一位知乎虚拟角色 NPC，性格鲜明、带点知乎社区梗，用中文亲切地和玩家互动，偶尔引用知乎上的高赞观点。' },
];

function setStatus(text) {
  if (!text) { $status.hidden = true; return; }
  $status.hidden = false;
  $status.textContent = text;
}

function addBubble(role) {
  const el = document.createElement('div');
  el.className = `bubble ${role}`;
  $chat.appendChild(el);
  $chat.scrollTop = $chat.scrollHeight;
  return el;
}

function appendTo(el, text) {
  el.textContent += text;
  $chat.scrollTop = $chat.scrollHeight;
}

async function send() {
  const text = $input.value.trim();
  if (!text) return;
  $input.value = '';

  // 玩家气泡
  const userEl = addBubble('user');
  appendTo(userEl, text);
  messages.push({ role: 'user', content: text });

  // NPC 气泡 + 思考区
  const npcEl = addBubble('npc');
  const think = document.createElement('div');
  think.className = 'think';
  npcEl.appendChild(think);
  const answer = document.createElement('div');
  answer.className = 'answer';
  npcEl.appendChild(answer);

  $send.disabled = true;
  setStatus('正在调用知乎直答…');

  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: $model.value, messages, stream: true }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
      appendTo(answer, `⚠️ ${err.error || '请求失败'}`);
      setStatus('');
      $send.disabled = false;
      return;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buf = '';
    let answerStarted = false;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += decoder.decode(value, { stream: true });
      let idx;
      while ((idx = buf.indexOf('\n')) >= 0) {
        const line = buf.slice(0, idx).trim();
        buf = buf.slice(idx + 1);
        if (!line.startsWith('data:')) continue;
        const data = line.slice(5).trim();
        if (data === '[DONE]') continue;
        let j;
        try { j = JSON.parse(data); } catch { continue; }
        const delta = j.choices?.[0]?.delta || {};
        if (delta.reasoning_content) {
          think.hidden = false;
          think.textContent += delta.reasoning_content;
        }
        if (delta.content) {
          if (!answerStarted) { think.hidden = true; answerStarted = true; }
          appendTo(answer, delta.content);
        }
      }
    }
    messages.push({ role: 'assistant', content: answer.textContent });
    setStatus('');
  } catch (e) {
    appendTo(answer, `⚠️ ${e.message}`);
    setStatus('');
  } finally {
    $send.disabled = false;
  }
}

$send.addEventListener('click', send);
$input.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    send();
  }
});
