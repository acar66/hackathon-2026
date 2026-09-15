import { useMemo, useState } from 'react'
import { QUESTIONS, GROUPS } from '../data/quiz.js'

// 基于题目 id 的确定性打乱：同一题选项顺序稳定（返回上一题不会变），
// 但每题顺序不同，避免「每次都选第一个」的位置偏差影响结果。
function shuffleBySeed(arr, seed) {
  const a = [...arr]
  let s = 0
  for (let i = 0; i < seed.length; i++) s = (s * 31 + seed.charCodeAt(i)) >>> 0
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 1103515245 + 12345) >>> 0
    const j = s % (i + 1)
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function Quiz({ onComplete, onExit }) {
  const [idx, setIdx] = useState(0)
  const [answers, setAnswers] = useState(() => Array(QUESTIONS.length).fill(null))

  const orders = useMemo(
    () => QUESTIONS.map((q) => shuffleBySeed(q.options.map((_, i) => i), q.id)),
    []
  )

  const total = QUESTIONS.length
  const q = QUESTIONS[idx]
  const group = GROUPS.find((g) => g.key === q.group)
  const answeredCount = answers.filter((a) => a !== null).length
  const progress = (answeredCount / total) * 100
  const isLast = idx === total - 1

  const choose = (dim) => {
    const next = [...answers]
    next[idx] = dim
    setAnswers(next)
    if (!isLast) {
      setTimeout(() => setIdx((i) => i + 1), 240)
    } else {
      setTimeout(() => onComplete(next), 300)
    }
  }

  const prev = () => setIdx((i) => Math.max(0, i - 1))

  return (
    <div className="mx-auto w-full max-w-[560px] px-4 py-6 animate-fadeup">
      {/* 顶部：进度 */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={idx === 0 ? onExit : prev}
            className="text-sm text-muted hover:text-white transition"
          >
            {idx === 0 ? '✕ 退出' : '← 上一题'}
          </button>
          <span className="text-sm text-muted">
            <span className="text-white font-semibold">{idx + 1}</span> / {total}
          </span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        {group && (
          <div className="mt-2 text-xs text-muted">
            {group.name} · <span className="text-white/60">{group.desc}</span>
          </div>
        )}
      </div>

      {/* 题目 */}
      <div key={q.id} className="glass rounded-3xl p-6 shadow-soft animate-fadeup">
        <h2 className="text-lg font-bold leading-relaxed mb-1">{q.title}</h2>
        {q.note && <p className="text-xs text-muted mb-4 leading-relaxed">题源：{q.note}</p>}
        {!q.note && <div className="mb-4" />}

        <div className="space-y-2.5">
          {orders[idx].map((oi) => {
            const opt = q.options[oi]
            const selected = answers[idx] === opt.dim
            return (
              <button
                key={oi}
                onClick={() => choose(opt.dim)}
                className={`w-full text-left rounded-2xl px-4 py-3.5 text-sm transition-all duration-200 border ${
                  selected
                    ? 'border-primary bg-primary/15 text-white shadow-glow'
                    : 'border-white/10 hover:border-primary/60 hover:bg-white/5 text-white/85'
                }`}
              >
                <span className={selected ? 'text-primary' : 'text-muted'}>{selected ? '● ' : '○ '}</span>
                {opt.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* 底部：题号点阵，可跳回已答题 */}
      <div className="mt-5 flex flex-wrap justify-center gap-1.5">
        {QUESTIONS.map((item, i) => (
          <button
            key={item.id}
            onClick={() => answers[i] !== null || i <= answeredCount ? setIdx(i) : null}
            className={`h-1.5 w-4 rounded-full transition ${
              i === idx ? 'bg-primary' : answers[i] !== null ? 'bg-white/40' : 'bg-white/12'
            }`}
          />
        ))}
      </div>

      <p className="mt-5 text-center text-xs text-muted">凭直觉选，没有标准答案</p>
    </div>
  )
}
