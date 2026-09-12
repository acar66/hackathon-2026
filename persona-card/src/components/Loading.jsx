const PHRASES = [
  '正在检索你的知乎灵魂……',
  '正在解析你的收藏夹……',
  '正在匹配你的赛博人格……',
  '正在生成你的知乎梗图鉴……',
]

export default function Loading() {
  const [i] = useState(() => Math.floor(Math.random() * PHRASES.length))
  return (
    <div className="mx-auto w-full max-w-[680px] px-4 py-10 animate-fadeup text-center">
      <div className="glass rounded-3xl p-8">
        <div className="mx-auto mb-6 h-16 w-16 rounded-2xl gradient-btn animate-floaty flex items-center justify-center text-3xl">🧬</div>
        <div className="space-y-3 max-w-xs mx-auto">
          <div className="skeleton h-3 rounded-full" />
          <div className="skeleton h-3 rounded-full w-5/6 mx-auto" />
          <div className="skeleton h-3 rounded-full w-2/3 mx-auto" />
        </div>
        <p className="mt-6 text-muted text-sm">{PHRASES[i]}</p>
      </div>
    </div>
  )
}
