import { useRef, useState } from 'react'
import { toPng } from 'html-to-image'
import { AXES } from '../data/archives.js'
import LiuKanshan from './LiuKanshan.jsx'

const AXIS_ICON = { action: '🔥', reason: '🧠', free: '🎨', care: '🌿' }

export default function ResultCard({ result, scores, signature, onBack }) {
  const cardRef = useRef(null)
  const [copied, setCopied] = useState(false)
  const [showHighlight, setShowHighlight] = useState(false)
  const { archetype, dominantAxis, genre } = result

  const highSet = new Set(signature)

  const download = async () => {
    if (!cardRef.current) return
    try {
      const dataUrl = await toPng(cardRef.current, { pixelRatio: 2, backgroundColor: '#0b0e14' })
      const a = document.createElement('a')
      a.href = dataUrl
      a.download = `知乎人格卡-${genre}-${archetype.name}.png`
      a.click()
    } catch (e) {
      console.error(e)
    }
  }

  const shareText = `我的知乎人格是「${genre}·${archetype.name}」${archetype.emblem}，你呢？`
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(shareText)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      /* 忽略：部分环境无剪贴板权限 */
    }
  }

  return (
    <div className="mx-auto w-full max-w-[560px] px-1 py-2 animate-fadeup">
      <div
        ref={cardRef}
        className="gradient-border rounded-3xl p-6 shadow-soft"
        style={{ background: `linear-gradient(165deg, ${archetype.color}33 0%, ${archetype.color}12 45%, rgba(11,14,20,0.55) 100%)` }}
      >
        <div className="flex items-center justify-between text-xs text-muted">
          <span>知乎人格卡</span>
          <span>zhihu-hackathon-2026</span>
        </div>

        {/* 主标题：归处（结果）居中放大、派系（党）紧随其后，让用户首屏先看到结果 */}
        <div className="mt-5 text-center">
          <div className="text-xs text-muted tracking-[0.35em] mb-2">你 的 知 乎 人 格 归 处</div>
          <button
            type="button"
            onClick={() => setShowHighlight((v) => !v)}
            className="group inline-block focus:outline-none"
            aria-label="点击查看高光片段"
          >
            <h1 className="text-4xl sm:text-[2.85rem] font-black gradient-text leading-tight drop-shadow-[0_2px_12px_rgba(0,0,0,0.35)]">
              {archetype.name}
            </h1>
            <div className="mt-1 text-xs text-muted font-normal opacity-70 group-hover:opacity-100 transition">
              {showHighlight ? '▴ 收起高光片段' : '▾ 点击看高光片段'}
            </div>
          </button>
          <div className="mt-3 flex items-center justify-center gap-2">
            <span
              className="rounded-full px-4 py-1 text-sm font-bold tracking-wide"
              style={{ background: `${archetype.color}26`, border: `1px solid ${archetype.color}`, color: archetype.color }}
            >
              {genre}
            </span>
            <span className="text-xs text-muted">· 你的派系归属</span>
          </div>
        </div>

        {/* 刘看山分类型场景（角色图就位后自动显示） */}
        <div className="mt-4 flex justify-center">
          <LiuKanshan archetypeId={archetype.id} size={420} tint={archetype.color} />
        </div>

        {/* 高光片段（点击主角名展开） */}
        {showHighlight && (
          <div
            className="mt-4 rounded-xl px-4 py-3 text-sm leading-relaxed animate-fadeup"
            style={{ background: `${archetype.color}1a`, border: `1px solid ${archetype.color}55` }}
          >
            <div className="mb-1 text-xs font-medium" style={{ color: archetype.color }}>
              ⚡ {archetype.name} · 高光片段
            </div>
            {archetype.highlight}
          </div>
        )}

        {/* 主色相 + 维度签名 */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span
            className="glass rounded-full px-3 py-1 text-xs"
            style={{ color: dominantAxis.color, borderColor: `${dominantAxis.color}66` }}
          >
            主色相 · {dominantAxis.name} {AXIS_ICON[dominantAxis.key]}
          </span>
          <span className="text-xs text-muted">维度签名：</span>
          {signature.map((k) => {
            const ax = AXES.find((a) => a.key === k)
            return (
              <span
                key={k}
                className="rounded-full px-2.5 py-0.5 text-xs"
                style={{ background: `${ax.color}22`, color: ax.color }}
              >
                {ax.name}
              </span>
            )
          })}
        </div>

        {/* 四维条 */}
        <div className="mt-5 space-y-3">
          {AXES.map((ax) => {
            const v = scores[ax.key] ?? 0
            const isHigh = highSet.has(ax.key)
            return (
              <div key={ax.key}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="flex items-center gap-1.5">
                    {AXIS_ICON[ax.key]} {ax.name}
                    {isHigh && (
                      <span className="text-[10px] px-1.5 rounded" style={{ background: `${ax.color}22`, color: ax.color }}>
                        高
                      </span>
                    )}
                  </span>
                  <span className="text-muted">{v}</span>
                </div>
                <div className="h-2.5 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${v}%`, background: ax.color, boxShadow: `0 0 10px ${ax.color}` }}
                  />
                </div>
              </div>
            )
          })}
        </div>

        {/* 原型特质 */}
        <div className="mt-5 glass rounded-xl px-4 py-3 text-sm leading-relaxed">{archetype.trait}</div>

        {/* 代表主角 */}
        {archetype.characters?.length > 0 && (
          <div className="mt-4">
            <div className="text-xs text-muted mb-2">你的本命主角原型</div>
            <div className="flex flex-wrap gap-2">
              {archetype.characters.map((c, i) => (
                <span key={i} className="glass rounded-lg px-3 py-1 text-xs">{c}</span>
              ))}
            </div>
          </div>
        )}

        {/* 经典台词 */}
        {archetype.lines?.length > 0 && (
          <div className="mt-4 space-y-2">
            {archetype.lines.map((q, i) => (
              <div key={i} className="glass rounded-xl px-3 py-2 text-sm">“{q}”</div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <button onClick={onBack} className="glass rounded-2xl py-3 font-medium hover:bg-white/10 transition">重新输入</button>
        <button onClick={download} className="gradient-btn rounded-2xl py-3 font-semibold shadow-glow hover:translate-y-[-2px] transition">下载卡片</button>
      </div>
      <button onClick={copy} className="mt-3 w-full text-center text-sm text-muted hover:text-accent transition break-all">
        {copied ? '✓ 已复制分享文案' : `复制分享文案：${shareText}`}
      </button>
    </div>
  )
}
