import { useState } from 'react'
import { AXES, ARCHETYPES, matchArchetype, highDims } from './data/archives.js'
import { scoreAnswers, QUESTIONS } from './data/quiz.js'
import Quiz from './components/Quiz.jsx'
import ResultCard from './components/ResultCard.jsx'

const AXIS_ICON = { action: '🔥', reason: '🧠', free: '🎨', care: '🌿' }
const INITIAL = { action: 78, reason: 72, free: 60, care: 55 }

export default function App() {
  // intro（开始页） → quiz（20 题） → result（结果卡）
  const [stage, setStage] = useState('intro')
  const [scores, setScores] = useState(INITIAL)
  const [result, setResult] = useState(null)
  const [showDebug, setShowDebug] = useState(false)

  const set = (key, v) => setScores((s) => ({ ...s, [key]: Number(v) }))
  const randomize = () =>
    setScores({
      action: 30 + Math.round(Math.random() * 70),
      reason: 30 + Math.round(Math.random() * 70),
      free: 30 + Math.round(Math.random() * 70),
      care: 30 + Math.round(Math.random() * 70),
    })
  const show = () => {
    setResult(matchArchetype(scores))
    setStage('result')
  }

  const finishQuiz = (answers) => {
    const s = scoreAnswers(answers)
    setScores(s)
    setResult(matchArchetype(s))
    setStage('result')
  }

  const backToIntro = () => {
    setResult(null)
    setStage('intro')
  }

  return (
    <div className="app-bg relative min-h-screen w-full">
      <div className="relative z-10 mx-auto w-full max-w-[560px] px-4 py-8">
        {stage === 'intro' && (
          <>
            <div className="text-center mb-6 animate-fadeup">
              <div className="text-5xl mb-2 animate-floaty">🪪</div>
              <h1 className="text-3xl font-extrabold leading-tight">
                你的<span className="gradient-text">知乎人格卡</span>
              </h1>
              <p className="mt-3 text-sm text-muted leading-relaxed">
                {QUESTIONS.length} 道题，情境全部来自知乎真实热榜与高赞讨论。
                <br />
                测出你会掉进哪个「党」的哪个「型」。
              </p>
            </div>

            <div className="glass rounded-3xl p-6 shadow-soft animate-fadeup">
              <div className="grid grid-cols-2 gap-3 mb-5">
                {AXES.map((ax) => (
                  <div key={ax.key} className="rounded-2xl bg-white/5 px-3 py-2.5">
                    <div className="text-lg">{AXIS_ICON[ax.key]}</div>
                    <div className="text-xs font-medium" style={{ color: ax.color }}>{ax.name}</div>
                    <div className="text-[10px] text-muted leading-tight mt-0.5">{ax.desc}</div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setStage('quiz')}
                className="w-full gradient-btn rounded-2xl py-3.5 font-semibold shadow-glow hover:translate-y-[-2px] transition"
              >
                开始测试 · {QUESTIONS.length} 题 →
              </button>

              {/* 手动调试入口：不占主流程，开发者/演示用 */}
              <button
                onClick={() => setShowDebug((v) => !v)}
                className="mt-3 w-full text-xs text-muted hover:text-white/70 transition"
              >
                {showDebug ? '▴ 收起手动调试' : '▸ 手动调试四维（跳过答题直接看结果）'}
              </button>

              {showDebug && (
                <div className="mt-3 pt-4 border-t border-white/10">
                  {AXES.map((ax) => (
                    <div key={ax.key} className="mb-4 last:mb-0">
                      <div className="flex items-center justify-between mb-2">
                        <span className="flex items-center gap-2 text-sm font-medium" style={{ color: ax.color }}>
                          {AXIS_ICON[ax.key]} {ax.name}
                        </span>
                        <span className="glass rounded-lg px-2.5 py-0.5 text-sm" style={{ color: ax.color }}>{scores[ax.key]}</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={scores[ax.key]}
                        onChange={(e) => set(ax.key, e.target.value)}
                        className="dim-slider w-full"
                        style={{ '--c': ax.color }}
                      />
                    </div>
                  ))}

                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <span className="text-xs text-muted">将命中签名：</span>
                    {highDims(scores).map((k) => {
                      const ax = AXES.find((a) => a.key === k)
                      return (
                        <span key={k} className="rounded-full px-2.5 py-0.5 text-xs" style={{ background: `${ax.color}22`, color: ax.color }}>
                          {ax.name}
                        </span>
                      )
                    })}
                  </div>

                  <div className="mt-4">
                    <label className="text-xs text-muted mb-2 block">快速预览原型（自动填入对应四维值）</label>
                    <select
                      className="w-full glass rounded-xl px-3 py-2 text-sm text-white/90 outline-none"
                      onChange={(e) => {
                        const a = ARCHETYPES.find((x) => x.id === e.target.value)
                        if (a) setScores({ ...a.axes })
                      }}
                      value=""
                    >
                      <option value="" disabled>选择一个原型…</option>
                      {ARCHETYPES.map((a) => (
                        <option key={a.id} value={a.id}>{a.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <button onClick={randomize} className="glass rounded-2xl py-2.5 text-sm font-medium hover:bg-white/10 transition">🎲 随机一下</button>
                    <button onClick={show} className="gradient-btn rounded-2xl py-2.5 text-sm font-semibold shadow-glow hover:translate-y-[-2px] transition">显示结果 →</button>
                  </div>
                </div>
              )}
            </div>
            <p className="mt-5 text-center text-xs text-muted">知乎黑客松 2026 · 项目三 · 跨次元游乐场</p>
          </>
        )}

        {stage === 'quiz' && <Quiz onComplete={finishQuiz} onExit={backToIntro} />}

        {stage === 'result' && result && (
          <ResultCard
            result={result}
            scores={scores}
            signature={highDims(scores)}
            onBack={backToIntro}
          />
        )}
      </div>
    </div>
  )
}
