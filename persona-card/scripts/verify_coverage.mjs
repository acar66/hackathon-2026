// 核验 v2：网格采样(5^4=625)确认每个型都可达；并给出每签名代表结果 + 主角完整性
import { matchArchetype, ARCHETYPES, highDims } from '../src/data/archives.js'

const DIMS = ['action', 'reason', 'free', 'care']
const DIM_NAME = { action: '行动', reason: '理性', free: '自由', care: '共情' }
const LEVELS = [30, 50, 70, 85, 95]

// 网格采样
const hit = new Set()
const example = {} // 每个型记录一个命中样本
let count = 0
for (const a of LEVELS)
  for (const b of LEVELS)
    for (const c of LEVELS)
      for (const d of LEVELS) {
        const scores = { action: a, reason: b, free: c, care: d }
        const r = matchArchetype(scores)
        hit.add(r.archetype.id)
        if (!example[r.archetype.id]) example[r.archetype.id] = scores
        count++
      }

console.log(`网格采样 ${count} 组，命中的型数量 = ${hit.size} / ${ARCHETYPES.length}`)
const dead = ARCHETYPES.filter((x) => !hit.has(x.id))
console.log(dead.length === 0 ? '✅ 无死类型，11 个型均可被真实输入命中' : '⚠️ 死类型：' + dead.map((x) => x.name).join('、'))

// 每签名代表结果（高维=88 低维=38 的理想代表向量）
console.log('\n=== 每签名代表结果 ===')
for (let mask = 1; mask < 16; mask++) {
  const sub = DIMS.filter((_, i) => mask & (1 << i))
  const set = new Set(sub)
  const v = {}
  for (const dim of DIMS) v[dim] = set.has(dim) ? 88 : 38
  const r = matchArchetype(v)
  const sig = highDims(v).map((k) => DIM_NAME[k]).join('+')
  console.log(sig.padEnd(16), '→', `${r.genre}·${r.archetype.name}`)
}

// 主角完整性
console.log('\n=== 主角完整性（每型应有真实主角）===')
for (const a of ARCHETYPES) {
  const n = (a.characters || []).length
  console.log(a.name.padEnd(7), '主角数=' + String(n).padStart(2), n > 0 ? '' : '⚠️空', '| 例:', (a.characters || [])[0] || '-')
}
