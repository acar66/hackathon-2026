import { useState } from 'react'
import { AXES, matchArchetype, highDims } from './data/archives.js'
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
