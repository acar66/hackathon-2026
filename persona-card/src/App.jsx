import { useState } from 'react'
import Quiz from './components/Quiz.jsx'
import Loading from './components/Loading.jsx'
import PersonaCard from './components/PersonaCard.jsx'
import { computeDimensions, buildPersonaPrompt, parsePersona, localFallback } from './lib/persona.js'

export default function App() {
  const [stage, setStage] = useState('intro') // intro | quiz | loading | result
  const [persona, setPersona] = useState(null)

  const handleComplete = async (answers) => {
    const dimensions = computeDimensions(answers)
    setStage('loading')
    try {
      const res = await fetch('/api/persona', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers, dimensions }),
      })
      const data = await res.json()
      const parsed = parsePersona(data?.content)
      setPersona(parsed || localFallback(answers, dimensions))
    } catch (e) {
      setPersona(localFallback(answers, dimensions))
    }
    setStage('result')
  }

  const restart = () => {
    setPersona(null)
    setStage('intro')
  }

  return (
    <div className="app-bg relative min-h-screen w-full">
      <div className="relative z-10">
        {stage === 'intro' && <Intro onStart={() => setStage('quiz')} />}
        {stage === 'quiz' && <Quiz onComplete={handleComplete} />}
        {stage === 'loading' && <Loading />}
        {stage === 'result' && persona && <PersonaCard persona={persona} onRestart={restart} />}
      </div>
    </div>
  )
}

function Intro({ onStart }) {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[680px] flex-col items-center justify-center px-4 text-center animate-fadeup">
      <div className="text-6xl mb-4 animate-floaty">🪪</div>
      <h1 className="text-3xl sm:text-4xl font-extrabold leading-tight">
        你的<span className="gradient-text">知乎人格卡</span>
      </h1>
      <p className="mt-3 text-muted max-w-md">
        8 道小题，测出你在知乎里的赛博灵魂原型——附维度档案、专属判词与你的知乎风语录。
      </p>
      <button onClick={onStart} className="mt-8 gradient-btn rounded-2xl px-8 py-3.5 font-semibold text-lg shadow-glow hover:translate-y-[-2px] transition">
        开始测试 →
      </button>
      <p className="mt-6 text-xs text-muted">知乎黑客松 2026 · 项目三 · 跨次元游乐场</p>
    </div>
  )
}
