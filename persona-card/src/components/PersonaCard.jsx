import { useRef, useState } from 'react'
import { DIMENSIONS } from '../data/quiz.js'
import { toPng } from 'html-to-image'

export default function PersonaCard({ persona, onRestart }) {
  const cardRef = useRef(null)
  const [copied, setCopied] = useState(false)

  const download = async () => {
    if (!cardRef.current) return
    try {
      const dataUrl = await toPng(cardRef.current, { pixelRatio: 2, backgroundColor: '#0b0e14' })
      const a = document.createElement('a')
      a.href = dataUrl
      a.download = `知乎人格卡-${persona.archetype}.png`
      a.click()
    } catch (e) {
      console.error(e)
    }
  }

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(persona.shareText)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      /* 忽略：部分环境无剪贴板权限 */
    }
  }

  const dims = persona.dimensions || {}

  return (
    <div className="mx-auto w-full max-w-[560px] px-4 py-6 animate-fadeup">
      <div ref={cardRef} className="gradient-border rounded-3xl p-6 shadow-soft">
        <div className="flex items-center justify-between text-xs text-muted">
          <span>知乎人格卡</span>
          <span>zhihu-hackathon-2026</span>
        </div>

        <div className="mt-4 flex items-center gap-4">
          <div className="h-20 w-20 rounded-2xl gradient-btn flex items-center justify-center text-5xl shadow-glow">{persona.emoji}</div>
          <div>
            <div className="text-2xl font-extrabold gradient-text">{persona.archetype}</div>
            <div className="mt-1 text-sm text-muted">{persona.tagline}</div>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          {DIMENSIONS.map((d) => {
            const v = dims[d.key] ?? 0
            return (
              <div key={d.key}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="flex items-center gap-1.5">{d.icon} {d.label}</span>
                  <span className="text-muted">{v}</span>
                </div>
                <div className="h-2.5 rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full rounded-full gradient-btn transition-all duration-700" style={{ width: `${v}%` }} />
                </div>
              </div>
            )
          })}
        </div>

        {persona.traits?.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-2">
            {persona.traits.map((t, i) => (
              <span key={i} className="glass rounded-full px-3 py-1 text-xs text-accent">#{t}</span>
            ))}
          </div>
        )}

        <div className="mt-5 space-y-2">
          {persona.quotes?.map((q, i) => (
            <div key={i} className="glass rounded-xl px-3 py-2 text-sm">“{q}”</div>
          ))}
        </div>

        {persona._fallback && (
          <div className="mt-4 text-center text-[11px] text-muted">⚠️ 当前为离线兜底结果（LLM 暂不可用）</div>
        )}
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <button onClick={onRestart} className="glass rounded-2xl py-3 font-medium hover:bg-white/10 transition">重新测一次</button>
        <button onClick={download} className="gradient-btn rounded-2xl py-3 font-semibold shadow-glow hover:translate-y-[-2px] transition">下载卡片</button>
      </div>
      <button onClick={copy} className="mt-3 w-full text-center text-sm text-muted hover:text-accent transition break-all">
        {copied ? '✓ 已复制分享文案' : `复制分享文案：${persona.shareText}`}
      </button>
    </div>
  )
}
