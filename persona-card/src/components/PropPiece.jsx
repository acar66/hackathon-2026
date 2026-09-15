// 刘看山场景小物：把 scenes.js 里每个 kind 渲染成紧凑 SVG 图标。
// 统一 viewBox 0 0 100 100，由外层按 width 缩放。颜色走扁平矢量风。

const C = {
  red: '#ff5a5f', blue: '#3b82f6', yellow: '#f5b50a', green: '#22c55e',
  ink: '#1c2230', steel: '#8a94a6', gold: '#f5b50a', white: '#ffffff',
  wood: '#b9824b', paper: '#f3ead2', pink: '#ff9bb3', fire: '#ff7a3c',
};

function Svg({ children, style, anim }) {
  return (
    <div className={`lk-prop ${anim || ''}`} style={style}>
      <svg viewBox="0 0 100 100" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        {children}
      </svg>
    </div>
  );
}

const KINDS = {
  scroll: () => (
    <Svg>{[
      <rect key="r" x="20" y="28" width="60" height="44" rx="6" fill={C.paper} stroke={C.ink} strokeWidth="3" />,
      <rect key="t" x="14" y="22" width="72" height="10" rx="5" fill={C.ink} />,
      <rect key="b" x="14" y="68" width="72" height="10" rx="5" fill={C.ink} />,
      <line key="l1" x1="32" y1="40" x2="68" y2="40" stroke={C.ink} strokeWidth="2" />,
      <line key="l2" x1="32" y1="50" x2="68" y2="50" stroke={C.ink} strokeWidth="2" />,
      <line key="l3" x1="32" y1="60" x2="58" y2="60" stroke={C.ink} strokeWidth="2" />,
    ]}</Svg>
  ),
  blood: () => (
    <Svg><path d="M50 18 C50 18 74 52 74 68 A24 24 0 0 1 26 68 C26 52 50 18 50 18 Z" fill={C.red} /></Svg>
  ),
  hourglass: () => (
    <Svg>{[
      <path key="t" d="M30 22 H70 L56 50 H44 Z" fill={C.steel} />,
      <path key="b" d="M44 50 H56 L70 78 H30 Z" fill={C.steel} />,
      <rect key="tf" x="26" y="16" width="48" height="8" rx="3" fill={C.ink} />,
      <rect key="bf" x="26" y="76" width="48" height="8" rx="3" fill={C.ink} />,
    ]}</Svg>
  ),
  fortress: () => (
    <Svg>{[
      <rect key="b" x="22" y="50" width="56" height="34" fill={C.steel} />,
      <rect key="t1" x="26" y="38" width="12" height="14" fill={C.steel} />,
      <rect key="t2" x="44" y="38" width="12" height="14" fill={C.steel} />,
      <rect key="t3" x="62" y="38" width="12" height="14" fill={C.steel} />,
      <rect key="d" x="44" y="64" width="14" height="20" fill={C.ink} />,
    ]}</Svg>
  ),
  gear: () => (
    <Svg><g fill={C.steel}>
      <circle cx="50" cy="50" r="26" />
      <circle cx="50" cy="50" r="10" fill={C.ink} />
      {[0,45,90,135,180,225,270,315].map(a => (
        <rect key={a} x="46" y="14" width="8" height="18" rx="2" transform={`rotate(${a} 50 50)`} />
      ))}
    </g></Svg>
  ),
  radar: () => (
    <Svg>{[
      <circle key="c1" cx="50" cy="50" r="40" fill="none" stroke={C.green} strokeWidth="3" />,
      <circle key="c2" cx="50" cy="50" r="26" fill="none" stroke={C.green} strokeWidth="2" opacity="0.7" />,
      <circle key="c3" cx="50" cy="50" r="12" fill="none" stroke={C.green} strokeWidth="2" opacity="0.4" />,
      <line key="l" x1="50" y1="50" x2="50" y2="12" stroke={C.green} strokeWidth="3" />,
      <circle key="d" cx="50" cy="50" r="5" fill={C.green} />,
    ]}</Svg>
  ),
  cart: () => (
    <Svg>{[
      <path key="b" d="M20 36 H72 L66 70 H26 Z" fill={C.steel} opacity="0.25" stroke={C.ink} strokeWidth="3" />,
      <rect key="c1" x="26" y="42" width="12" height="10" rx="2" fill={C.red} />,
      <rect key="c2" x="44" y="42" width="12" height="10" rx="2" fill={C.yellow} />,
      <rect key="c3" x="62" y="44" width="8" height="9" rx="2" fill={C.green} />,
      <circle key="w1" cx="34" cy="74" r="6" fill={C.ink} />,
      <circle key="w2" cx="60" cy="74" r="6" fill={C.ink} />,
      <path key="h" d="M20 36 L14 24" stroke={C.ink} strokeWidth="3" />,
    ]}</Svg>
  ),
  sunglasses: () => (
    <Svg>{[
      <rect key="l" x="14" y="40" width="32" height="22" rx="8" fill={C.ink} />,
      <rect key="r" x="54" y="40" width="32" height="22" rx="8" fill={C.ink} />,
      <rect key="b" x="44" y="46" width="12" height="6" fill={C.ink} />,
      <rect key="gl" x="20" y="44" width="10" height="6" rx="3" fill="#5fa8ff" opacity="0.8" />,
    ]}</Svg>
  ),
  noodle: () => (
    <Svg>{[
      <path key="c" d="M30 44 H70 V72 A8 8 0 0 1 62 80 H38 A8 8 0 0 1 30 72 Z" fill={C.red} />,
      <ellipse key="t" cx="50" cy="44" rx="20" ry="6" fill="#ffd9a0" />,
      <rect key="l" x="44" y="20" width="4" height="22" fill={C.wood} transform="rotate(-12 46 32)" />,
    ]}</Svg>
  ),
  sandtable: () => (
    <Svg>{[
      <ellipse key="b" cx="50" cy="64" rx="38" ry="14" fill={C.wood} />,
      <rect key="p1" x="34" y="50" width="10" height="14" fill={C.ink} />,
      <rect key="p2" x="54" y="46" width="10" height="18" fill={C.ink} />,
      <circle key="o" cx="50" cy="40" r="5" fill={C.green} />,
    ]}</Svg>
  ),
  map: () => (
    <Svg>{[
      <path key="m" d="M20 30 L40 24 L60 32 L80 26 V70 L60 76 L40 68 L20 74 Z" fill={C.paper} stroke={C.ink} strokeWidth="3" />,
      <path key="r" d="M40 24 V68 M60 32 V76" stroke={C.ink} strokeWidth="2" />,
      <circle key="x" cx="50" cy="50" r="4" fill={C.red} />,
    ]}</Svg>
  ),
  fan: () => (
    <Svg>{[
      <path key="f" d="M50 70 L22 34 A36 36 0 0 1 78 34 Z" fill="#eef3ff" stroke={C.ink} strokeWidth="3" />,
      <line key="v1" x1="50" y1="70" x2="34" y2="38" stroke={C.ink} strokeWidth="1.5" />,
      <line key="v2" x1="50" y1="70" x2="50" y2="34" stroke={C.ink} strokeWidth="1.5" />,
      <line key="v3" x1="50" y1="70" x2="66" y2="38" stroke={C.ink} strokeWidth="1.5" />,
      <circle key="p" cx="50" cy="70" r="5" fill={C.ink} />,
    ]}</Svg>
  ),
  cloud: () => (
    <Svg><path d="M24 64 A16 16 0 0 1 24 36 A18 18 0 0 1 58 34 A14 14 0 0 1 78 48 A14 14 0 0 1 74 64 Z" fill={C.white} opacity="0.9" /></Svg>
  ),
  gourd: () => (
    <Svg>{[
      <circle key="t" cx="50" cy="38" r="16" fill={C.green} />,
      <circle key="b" cx="50" cy="68" r="22" fill={C.green} />,
      <rect key="n" x="44" y="18" width="12" height="8" rx="2" fill={C.wood} />,
    ]}</Svg>
  ),
  sword: () => (
    <Svg>{[
      <rect key="b" x="46" y="14" width="8" height="56" rx="3" fill={C.steel} />,
      <path key="g" d="M38 70 L62 70 L50 84 Z" fill={C.ink} />,
      <circle key="p" cx="50" cy="12" r="4" fill={C.gold} />,
    ]}</Svg>
  ),
  milktea: () => (
    <Svg>{[
      <path key="c" d="M34 36 H66 V70 A6 6 0 0 1 60 76 H40 A6 6 0 0 1 34 70 Z" fill={C.wood} />,
      <rect key="l" x="46" y="18" width="4" height="22" fill={C.ink} transform="rotate(8 48 30)" />,
      <ellipse key="t" cx="50" cy="36" rx="16" ry="5" fill="#ffd9a0" />,
    ]}</Svg>
  ),
  heart: () => (
    <Svg><path d="M50 78 C20 56 24 28 44 28 C50 28 50 36 50 36 C50 36 50 28 56 28 C76 28 80 56 50 78 Z" fill={C.pink} /></Svg>
  ),
  note: () => (
    <Svg>{[
      <rect key="p" x="28" y="22" width="44" height="56" rx="4" fill={C.white} stroke={C.ink} strokeWidth="3" />,
      <line key="l1" x1="36" y1="34" x2="64" y2="34" stroke={C.ink} strokeWidth="2" />,
      <line key="l2" x1="36" y1="44" x2="64" y2="44" stroke={C.ink} strokeWidth="2" />,
      <line key="l3" x1="36" y1="54" x2="56" y2="54" stroke={C.ink} strokeWidth="2" />,
    ]}</Svg>
  ),
  bulb: () => (
    <Svg>{[
      <circle key="b" cx="50" cy="42" r="22" fill="#fff4c2" stroke={C.ink} strokeWidth="3" />,
      <rect key="s" x="42" y="62" width="16" height="14" rx="2" fill={C.ink} />,
      <path key="f" d="M44 68 H56 M44 72 H56" stroke="#9aa" strokeWidth="2" />,
    ]}</Svg>
  ),
  coin: () => (
    <Svg>{[
      <circle key="o" cx="50" cy="50" r="30" fill={C.gold} stroke={C.ink} strokeWidth="3" />,
      <text key="t" x="50" y="60" fontSize="30" textAnchor="middle" fill={C.ink} fontWeight="bold">¥</text>,
    ]}</Svg>
  ),
  chart: () => (
    <Svg>{[
      <rect key="b" x="20" y="24" width="60" height="52" rx="4" fill={C.white} stroke={C.ink} strokeWidth="3" />,
      <polyline key="p" points="26,66 40,48 52,56 64,34 74,40" fill="none" stroke={C.green} strokeWidth="4" />,
    ]}</Svg>
  ),
  coffee: () => (
    <Svg>{[
      <path key="c" d="M34 38 H62 V60 A8 8 0 0 1 54 68 H42 A8 8 0 0 1 34 60 Z" fill={C.ink} />,
      <path key="h" d="M62 42 q14 2 10 16 q-3 8 -12 6" fill="none" stroke={C.ink} strokeWidth="3" />,
    ]}</Svg>
  ),
  steamer: () => (
    <Svg>{[
      <rect key="b" x="26" y="50" width="48" height="28" rx="4" fill={C.steel} stroke={C.ink} strokeWidth="2" />,
      <ellipse key="t" cx="50" cy="50" rx="24" ry="8" fill={C.steel} stroke={C.ink} strokeWidth="2" />,
      <path key="s" d="M44 30 q-6 -8 0 -14 M56 30 q6 -8 0 -14" fill="none" stroke="#bbb" strokeWidth="3" />,
    ]}</Svg>
  ),
  wheat: () => (
    <Svg>{[
      <line key="s" x1="50" y1="84" x2="50" y2="36" stroke={C.wood} strokeWidth="3" />,
      ...[40,54,68,54,40].map((y,i)=>(
        <ellipse key={i} cx={i%2?58:42} cy={y} rx="7" ry="11" fill={C.yellow} transform={`rotate(${i%2?20:-20} ${i%2?58:42} ${y})`} />
      )),
    ]}</Svg>
  ),
  cat: () => (
    <Svg>{[
      <circle key="h" cx="50" cy="56" r="22" fill={C.ink} />,
      <path key="e1" d="M34 42 L30 28 L44 38 Z" fill={C.ink} />,
      <path key="e2" d="M66 42 L70 28 L56 38 Z" fill={C.ink} />,
      <circle key="o1" cx="42" cy="54" r="3" fill={C.green} />,
      <circle key="o2" cx="58" cy="54" r="3" fill={C.green} />,
    ]}</Svg>
  ),
  chainsaw: () => (
    <Svg>{[
      <rect key="b" x="20" y="44" width="34" height="20" rx="4" fill={C.ink} />,
      <rect key="h" x="24" y="64" width="10" height="14" rx="3" fill={C.ink} />,
      <path key="bl" d="M54 40 H82 V56 H54 Z" fill={C.steel} stroke={C.ink} strokeWidth="2" />,
      ...[56,64,72,80].map(x=>(
        <line key={x} x1={x} y1="38" x2={x} y2="58" stroke={C.ink} strokeWidth="2" />
      )),
    ]}</Svg>
  ),
  mask: () => (
    <Svg><path d="M30 30 Q50 20 70 30 Q74 56 50 78 Q26 56 30 30 Z" fill={C.white} stroke={C.ink} strokeWidth="3" /><path d="M50 30 V78" stroke={C.red} strokeWidth="3" /></Svg>
  ),
  flame: () => (
    <Svg><path d="M50 18 C50 18 72 46 72 64 A22 22 0 0 1 28 64 C28 46 50 18 50 18 Z" fill={C.fire} /><path d="M50 40 C50 40 62 56 62 66 A12 12 0 0 1 38 66 C38 56 50 40 50 40 Z" fill={C.yellow} /></Svg>
  ),
  starball: () => (
    <Svg>{[
      <circle key="o" cx="50" cy="50" r="30" fill="none" stroke={C.blue} strokeWidth="3" />,
      <ellipse key="e" cx="50" cy="50" rx="30" ry="12" fill="none" stroke={C.blue} strokeWidth="2" transform="rotate(60 50 50)" />,
      <ellipse key="e2" cx="50" cy="50" rx="30" ry="12" fill="none" stroke={C.blue} strokeWidth="2" transform="rotate(-60 50 50)" />,
      <circle key="d" cx="50" cy="50" r="6" fill={C.blue} />,
    ]}</Svg>
  ),
  wing: () => (
    <Svg><path d="M50 70 C20 60 14 30 22 22 C34 30 40 44 50 50 C40 30 50 20 60 22 C70 40 56 60 50 70 Z" fill={C.white} opacity="0.85" stroke={C.blue} strokeWidth="2" /></Svg>
  ),
  energy: () => (
    <Svg><circle cx="50" cy="50" r="24" fill={C.green} opacity="0.6" /><circle cx="50" cy="50" r="12" fill={C.yellow} /></Svg>
  ),
};

export default function PropPiece({ kind, style, anim }) {
  const Comp = KINDS[kind];
  if (!Comp) return null;
  return <Comp style={style} anim={anim} />;
}
