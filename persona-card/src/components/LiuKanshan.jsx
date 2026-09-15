import { SCENES } from '../data/scenes.js';
import GreenScreenImage from './GreenScreenImage.jsx';

// 刘看山舞台：
// - 狐狸本体（绿幕自动抠像）静止、居中、无浮动、无黑框、无任何覆盖物
// - 旁边的小物来自「用户单独抠出的透明 PNG」（scene.propImages），各自独立浮动
//   在用户把小物抠出来之前，propImages 为空，画面只有干净的狐狸。
//
// tint：可选的主题色（原型主色），用于给舞台加一层柔和光晕，让狐狸更有"主体感"。
export default function LiuKanshan({ archetypeId, size = 420, tint }) {
  const scene = SCENES[archetypeId] || SCENES['omni-master'];

  // 背景由「原型主色」驱动：每个类型换成不同颜色，切类型时背景明显变化。
  // 优先用主色生成彩色光晕；仅在没有任何主色时回退到场景 bg。
  const bg = tint
    ? `radial-gradient(circle at 50% 34%, ${tint}66, ${tint}1f 46%, rgba(11,14,20,0) 78%)`
    : scene.bg && scene.bg !== 'transparent'
      ? scene.bg
      : 'transparent';

  return (
    <div
      className="lk-stage"
      style={{
        background: bg,
        width: size,
        height: size,
        border: 'none',
        boxShadow: tint ? `0 0 44px ${tint}1c` : 'none',
      }}
    >
      {/* 背景微光（不抢主体），若场景不需要可设 effect: 'none' */}
      {scene.effect && scene.effect !== 'none' && <div className={`lk-effect ${scene.effect}`} />}

      {/* 狐狸本体：静止、居中、无浮动、无黑框、无覆盖物 */}
      <div className="lk-fox">
        <GreenScreenImage
          src={scene.image}
          alt="刘看山"
          className="lk-character"
          autoKey={scene.autoKey}
          tolerance={scene.tolerance}
          edge={scene.edge}
          spill={scene.spill}
        />
      </div>

      {/* 旁边的小物：用户给的绿幕小物图，经 GreenScreenImage 自动抠绿后独立浮动。
          - 左copy 偏左、右copy 偏右 → 卷轴/沙漏分别落在狐狸左右两侧
          - 仍保留 scene.propImages 的配置，由 scenes.js 决定具体位置与大小 */}
      {scene.propImages?.map((p, i) => (
        <div
          key={i}
          className={`lk-prop ${p.anim || 'float-y'}`}
          style={{
            left: p.x,
            top: p.y,
            width: p.size,
            height: p.h || 'auto',
            zIndex: p.z ?? 3,
            overflow: p.objectPosition ? 'hidden' : 'visible',
          }}
        >
          <GreenScreenImage
            src={p.src}
            alt=""
            className="lk-prop-img"
            tolerance={p.tolerance}
            edge={p.edge}
            spill={p.spill}
            autoKey={p.autoKey}
            style={{
              width: '100%',
              height: '100%',
              display: 'block',
              objectFit: p.fit || (p.objectPosition ? 'cover' : 'contain'),
              objectPosition: p.objectPosition || 'center center',
            }}
          />
        </div>
      ))}
    </div>
  );
}
