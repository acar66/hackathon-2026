import { useState } from 'react'
import { QUESTIONS } from '../data/quiz.js'

export default function Quiz({ onComplete }) {
  const [answers, setAnswers] = useState(Array(QUESTIONS.length).fill(null))

  const choose = (qIndex, optIndex) => {
    setAnswers((prev) => {
      const next = [...prev]
      next[qIndex] = optIndex
      return next
    })
  }

  const allAnswered = answers.every((a) => a !== null)

  return (
    <div className="mx-auto w-full max-w-[680px] px-4 py-6 animate-fadeup">
      <h2 className="text-xl font-bold mb-1">8 道小题，测出你的知乎人格</h2>
      <p className="text-muted text-sm mb-5">凭直觉选，没有标准答案。</p>

      <div className="space-y-5">
        {QUESTIONS.map((q, qi) => (
          <div key={q.id} className="glass rounded-2xl p-4">
            <div className="flex items-start gap-2 mb-3">
              <span className="text-primary font-bold">{qi + 1}.</span>
              <span className="font-medium">{q.title}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {q.options.map((opt, oi) => {
                const selected = answers[qi] === oi
                return (
                  <button
                    key={oi}
                    onClick={() => choose(qi, oi)}
                    className={`text-left rounded-xl px-3 py-2.5 text-sm transition-all duration-200 border ${
                      selected
                        ? 'gradient-border bg-white/10 text-white'
                        : 'border-white/10 hover:border-primary/60 hover:bg-white/5'
                    }`}
                  >
                    <span className={selected ? 'text-accent' : 'text-muted'}>{selected ? '● ' : '○ '}</span>
                    {opt.label}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      <button
        disabled={!allAnswered}
        onClick={() => onComplete(answers)}
        className={`mt-6 w-full rounded-2xl py-3.5 font-semibold text-base transition-all duration-200 ${
          allAnswered ? 'gradient-btn shadow-glow hover:translate-y-[-2px]' : 'bg-white/10 text-muted cursor-not-allowed'
        }`}
      >
        {allAnswered ? '生成我的知乎人格 ✨' : `还有 ${answers.filter((a) => a === null).length} 题未答`}
      </button>
    </div>
  )
}
