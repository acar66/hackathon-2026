// 临时校验：模拟典型作答，检查 20 题计分 → matchArchetype 的落点是否合理
import { scoreAnswers, QUESTIONS } from '../src/data/quiz.js'
import { matchArchetype, highDims, ARCHETYPES } from '../src/data/archives.js'

const N = QUESTIONS.length

function make(pattern) {
  // pattern: [dim, count] 列表，按比例铺满 20 题
  const arr = []
  for (const [dim, count] of pattern) for (let i = 0; i < count; i++) arr.push(dim)
  while (arr.length < N) arr.push(pattern[0][0])
  return arr.slice(0, N)
}

const half = Math.round(N / 2)
const third = Math.round(N / 3)

const patterns = {
  '全行动': [['action', N]],
  '全理性': [['reason', N]],
  '全自由': [['free', N]],
  '全共情': [['care', N]],
  '行动+理性': [['action', half], ['reason', N - half]],
  '理性+自由': [['reason', half], ['free', N - half]],
  '行动+自由': [['action', half], ['free', N - half]],
  '理性+共情': [['reason', half], ['care', N - half]],
  '自由+共情': [['free', half], ['care', N - half]],
  '行动+共情': [['action', half], ['care', N - half]],
  '行动+理性+共情': [['action', third], ['reason', third], ['care', N - third * 2]],
  '行动+理性+自由': [['action', third], ['reason', third], ['free', N - third * 2]],
  '四维均衡': [['action', 5], ['reason', 5], ['free', 5], ['care', 5]],
  '随机混合': Array.from({ length: N }, (_, i) => ['action', 'reason', 'free', 'care'][i % 4]),
}

const fmt = (s) => AXES_FMT(s)

function AXES_FMT(s) {
  return `行动${String(s.action).padStart(2)} 理性${String(s.reason).padStart(2)} 自由${String(s.free).padStart(2)} 共情${String(s.care).padStart(2)}`
}

for (const [name, pat] of Object.entries(patterns)) {
  const answers = Array.isArray(pat) && typeof pat[0] === 'string' ? pat : make(pat)
  const scores = scoreAnswers(answers)
  const high = highDims(scores).join('+')
  const r = matchArchetype(scores)
  console.log(
    `${name.padEnd(16)} ${fmt(scores)} | 签名:${high.padEnd(28)} → ${r.genre} · ${r.archetype.name}`
  )
}

// ===== 覆盖验证 1：答题真实空间 =====
// 20 题每题选一个维度 → 四维命中次数 (a,r,f,c) 满足 a+r+f+c=20，共 C(23,3)=1771 种
const hit = {}
let combos = 0
for (let a = 0; a <= 20; a++) {
  for (let r = 0; r <= 20 - a; r++) {
    for (let f = 0; f <= 20 - a - r; f++) {
      const c = 20 - a - r - f
      const answers = [
        ...Array(a).fill('action'),
        ...Array(r).fill('reason'),
        ...Array(f).fill('free'),
        ...Array(c).fill('care'),
      ]
      const res = matchArchetype(scoreAnswers(answers))
      hit[res.archetype.id] = (hit[res.archetype.id] || 0) + 1
      combos++
    }
  }
}

console.log(`\n—— 答题空间覆盖（${combos} 种作答组合）——`)
const missing = []
for (const arch of ARCHETYPES) {
  const n = hit[arch.id] || 0
  if (!n) missing.push(arch.name)
  const pct = ((n / combos) * 100).toFixed(1)
  console.log(`${arch.name.padEnd(8)} ${String(n).padStart(5)} 次 (${pct}%)`)
}
console.log(`可达原型：${ARCHETYPES.length - missing.length} / ${ARCHETYPES.length}`)
if (missing.length) console.log('⚠️ 无法命中：', missing.join('、'))

// ===== 覆盖验证 2：连续四维空间（滑块调试模式）=====
const grid = [0, 25, 50, 75, 100]
const hit2 = {}
let g = 0
for (const a of grid)
  for (const r of grid)
    for (const f of grid)
      for (const c of grid) {
        const res = matchArchetype({ action: a, reason: r, free: f, care: c })
        hit2[res.archetype.id] = (hit2[res.archetype.id] || 0) + 1
        g++
      }
const missing2 = ARCHETYPES.filter((x) => !hit2[x.id]).map((x) => x.name)
console.log(`\n—— 连续空间覆盖（${g} 网格）—— 可达原型：${ARCHETYPES.length - missing2.length} / ${ARCHETYPES.length}`)
if (missing2.length) console.log('⚠️ 无法命中：', missing2.join('、'))
