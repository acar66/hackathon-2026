import { QUESTIONS, DIMENSIONS } from '../data/quiz.js'
import { ZHIHU_QUOTES } from '../data/quotes.js'

// 根据答题计算 4 个维度分（0-100）
export function computeDimensions(answers) {
  const base = { depth: 12, playful: 12, output: 12, rational: 12 }
  answers.forEach((optIndex, i) => {
    const q = QUESTIONS[i]
    if (!q || optIndex == null) return
    const opt = q.options[optIndex]
    if (!opt) return
    for (const k of Object.keys(base)) {
      base[k] += opt.score[k] || 0
    }
  })
  const clamp = (n) => Math.max(4, Math.min(100, Math.round(n)))
  return {
    depth: clamp(base.depth),
    playful: clamp(base.playful),
    output: clamp(base.output),
    rational: clamp(base.rational),
  }
}

const ARCHETYPES = [
  { name: '硬核考据党', emoji: '🧠', tagline: '先问是不是，再问为什么。', test: (d) => d.depth >= 58 && d.rational >= 52 },
  { name: '神回复梗王', emoji: '😏', tagline: '谢邀，人在美国，刚下飞机。', test: (d) => d.playful >= 56 },
  { name: '知乎嘴替', emoji: '📣', tagline: '你不敢说的，我替你说了。', test: (d) => d.output >= 56 },
  { name: '逻辑审判官', emoji: '🧐', tagline: '你的论证，经不起我三连问。', test: (d) => d.rational >= 58 && d.output < 56 },
  { name: '深夜 emo 诗人', emoji: '🌙', tagline: '故事的开始，总是一个深夜。', test: (d) => d.depth < 46 && d.playful < 46 },
  { name: '全能盐选玩家', emoji: '✨', tagline: '硬核与玩梗，我全都要。', test: () => true },
]

export function pickArchetype(dimensions) {
  return ARCHETYPES.find((a) => a.test(dimensions)) || ARCHETYPES[ARCHETYPES.length - 1]
}

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function pickQuotes(n = 3) {
  return shuffle(ZHIHU_QUOTES).slice(0, n)
}

// 构造给 LLM 的提示词（同时被前端与 server 复用，单一事实来源）
export function buildPersonaPrompt(answers, dimensions) {
  const lines = QUESTIONS.map((q, i) => {
    const opt = q.options[answers[i]]
    return `${i + 1}. ${q.title} → ${opt ? opt.label : '(未答)'}`
  }).join('\n')
  const dims = DIMENSIONS.map((d) => `${d.label}: ${dimensions[d.key]}`).join('，')
  return `你是"知乎人格分析器"。根据用户的答题与维度分，生成一张"知乎人格卡"。
用户答题：
${lines}
维度分（0-100）：${dims}

请只输出 JSON（不要解释、不要 markdown 代码块），字段如下：
{
  "archetype": "人格原型名（中文，4-8字，有趣、有梗）",
  "emoji": "一个 emoji",
  "tagline": "一句判词（知乎风，≤20字）",
  "dimensions": {"depth": ${dimensions.depth}, "playful": ${dimensions.playful}, "output": ${dimensions.output}, "rational": ${dimensions.rational}},
  "traits": ["三个短标签，每个≤6字"],
  "quotes": ["3条用户可能会说的知乎风句子，每条≤24字，可化用梗"],
  "shareText": "一句适合发朋友圈的分享文案（≤30字）"
}`
}

// 从 LLM 文本中安全解析人格 JSON
export function parsePersona(text) {
  if (!text || typeof text !== 'string') return null
  let t = text.trim()
  t = t.replace(/^```(?:json)?/i, '').replace(/```$/i, '').trim()
  const start = t.indexOf('{')
  const end = t.lastIndexOf('}')
  if (start === -1 || end === -1) return null
  try {
    const obj = JSON.parse(t.slice(start, end + 1))
    if (!obj.archetype) return null
    obj.dimensions = obj.dimensions || {}
    return obj
  } catch {
    return null
  }
}

// 断网 / LLM 失败时的本地兜底（仍用真实维度分 + 内置语录包）
export function localFallback(answers, dimensions) {
  const arch = pickArchetype(dimensions)
  const topDims = [...DIMENSIONS]
    .map((d) => ({ label: d.label, v: dimensions[d.key] }))
    .sort((a, b) => b.v - a.v)
    .slice(0, 3)
    .map((d) => d.label)
  return {
    archetype: arch.name,
    emoji: arch.emoji,
    tagline: arch.tagline,
    dimensions,
    traits: topDims,
    quotes: pickQuotes(3),
    shareText: `我的知乎人格是「${arch.name}」${arch.emoji}，你呢？`,
    _fallback: true,
  }
}
