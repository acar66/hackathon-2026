// 刘看山分类型场景配置（v4 · 狐狸静止居中 + 旁边小物为「用户抠出的透明 PNG」独立浮动）
//
// 现状说明：
//   - 角色图（狐狸本体）放在 public/liukanshan/{archetypeId}.jpg，已做绿幕抠像，静止居中。
//   - 小物不再是手画 SVG（会盖住狐狸），而是你从原图里抠出来的「独立透明 PNG」。
//
// 等你把小物抠出来后，按下面的格式填 propImages 即可，画面会自动让它们浮起来：
//   propImages: [
//     { src: '/liukanshan/props/revenge-queen-1.png', x: '7%',  y: '10%', size: '18%', anim: 'float-y' },
//     { src: '/liukanshan/props/revenge-queen-2.png', x: '80%', y: '14%', size: '12%', anim: 'rise' },
//   ]
//   - src: 放在 public/liukanshan/props/ 下
//   - x/y: 相对舞台的位置（百分比，左上角原点）
//   - size: 宽度百分比；高度按图片原始比例自适应
//   - anim: index.css 里的动效类，可选 float-y / float-slow / rise / spin-slow / scan / sway / pulse / blink / bounce / flicker
//
// 当前 propImages 全部为空 —— 画面里只有干净的狐狸，等你给图再浮。

export const SCENES = {
  // 1 重生复盘党 · 前世清算型
  'revenge-queen': {
    image: '/liukanshan/revenge-queen.jpg',
    bg: 'transparent',
    effect: 'gold-glow',
    propImages: [
      // 用户给的绿幕小物图：左侧卷轴 + 右侧沙漏+血珠，都在原图底部。
      // 只放一份，底部居中、整体缩到 84% 宽，让卷轴/沙漏坐在狐狸脚边且卷轴不要过大。
      { src: '/liukanshan/props/revenge-queen.png', x: '8%', y: '54%', size: '84%', h: '44%', objectPosition: 'center bottom', anim: 'float-y', z: 3 },
    ],
  },
  // 2 末世硬核党 · 硬核秩序型
  'train-captain': {
    image: '/liukanshan/steel-captain.jpg',
    bg: 'radial-gradient(circle at 50% 30%, #2a3340, #12161c)',
    effect: 'steel',
    propImages: [
      // 用户给的小物图：左下角堡垒 + 右下角齿轮/雷达，放在狐狸脚边、单份。
      { src: '/liukanshan/props/steel-captain.png', x: '8%', y: '54%', size: '84%', h: '44%', objectPosition: 'center bottom', anim: 'float-y', z: 3 },
    ],
  },
  // 3 末世硬核党 · 苟王本苟型
  'doomsday-keeper': {
    image: '/liukanshan/doom-hoarder.jpg',
    bg: 'radial-gradient(circle at 50% 30%, #2b3340, #161a20)',
    effect: 'none',
    propImages: [
      // 主体图（doom-hoarder.jpg）已经推着购物车，不要再叠购物车小物，否则车车重复。
      // 此位置留空，等用户给非购物车类小物（如堡垒、货架、物资箱）。
    ],
  },
  // 4 穿越谋主党 · 历史操盘型
  'history-master': {
    image: '/liukanshan/history-mastermind.jpg',
    bg: 'radial-gradient(circle at 50% 30%, #3a4a6a, #1a2333)',
    effect: 'ink',
    propImages: [
      // 地图卷轴 + 棋盘：谋士布局小物，放在狐狸脚边，不与手持羽扇重叠。
      // 开启 autoKey 自动抠纯色背景；容器放大上移，让卷轴/棋盘完整且显眼。
      { src: '/liukanshan/props/history-master.png', x: '2%', y: '40%', size: '108%', h: '62%', fit: 'contain', objectPosition: 'center bottom', autoKey: true, tolerance: 0.32, anim: 'float-y', z: 3 },
    ],
  },
  // 5 苟道飞升流 · 稳健苟道型
  'lowkey-cultivator': {
    image: '/liukanshan/lowkey-cultivator.jpg',
    bg: 'radial-gradient(circle at 50% 30%, #4a9b8e, #2a5c54)',
    effect: 'mist',
    autoKey: true,
    propImages: [
      // 祥云+剑：仙侠小物；新图为青绿纯色背景，开启 autoKey 自动检测背景色抠像
      { src: '/liukanshan/props/lowkey-cultivator.png', x: '8%', y: '54%', size: '84%', h: '44%', objectPosition: 'center bottom', anim: 'float-y', z: 3, autoKey: true, tolerance: 0.28 },
    ],
  },
  // 6 甜宠守护党 · 温柔兜底型
  'gentle-healer': {
    image: '/liukanshan/sweet-healer.jpg',
    bg: 'radial-gradient(circle at 50% 30%, #fdf6e3, #f3e5c5)',
    effect: 'soft',
    propImages: [
      // 爱心+毯子：温柔治愈小物。毯子/围巾要放在狐狸身后，所以 z:1（狐狸 z:2），避免遮住狐狸身体。
      { src: '/liukanshan/props/gentle-healer.png', x: '11%', y: '70%', size: '78%', h: '30%', objectPosition: 'center bottom', anim: 'float-y', z: 1 },
    ],
  },
  // 7 真相解构党 · 真相解构型
  'insight-detective': {
    image: '/liukanshan/detective.jpg',
    bg: 'radial-gradient(circle at 50% 30%, #2a3a4a, #121820)',
    effect: 'blue-glow',
    autoKey: true,
    propImages: [
      // 灯泡 + 剪贴板 + 便签：侦探灵感小物，放脚边，不与手持放大镜重叠。
      // 小物图为青绿色纯色背景，开启 autoKey 自动检测背景色并抠像，避免绿底方块残留。
      { src: '/liukanshan/props/insight-detective.png', x: '8%', y: '58%', size: '84%', h: '42%', fit: 'contain', objectPosition: 'center bottom', autoKey: true, tolerance: 0.32, anim: 'float-y', z: 3 },
    ],
  },
  // 8 独立搞钱党 · 搞钱女王型
  'career-queen': {
    image: '/liukanshan/career-queen.jpg',
    bg: 'radial-gradient(circle at 50% 30%, #5a1a1a, #2a0e0e)',
    effect: 'gold-glow',
    propImages: [
      // 金币 + 股票图 + 公文包 + 咖啡：搞钱女王小物，放脚边，不与手托金币重叠
      { src: '/liukanshan/props/career-queen.png', x: '8%', y: '54%', size: '84%', h: '44%', objectPosition: 'center bottom', anim: 'float-y', z: 3 },
    ],
  },
  // 9 烟火守艺党 · 烟火守艺型
  'hearth-keeper': {
    image: '/liukanshan/hearth-keeper.jpg',
    bg: 'radial-gradient(circle at 50% 30%, #e8f5d6, #c4dea0)',
    effect: 'warm',
    // v5 洪水填充后：只抠与画面边缘连通的背景，狐狸身上的绿丝巾/绿袖口/绿鞋不再被误抠。
    // 因此 tolerance 可以回升，保证带渐变的绿色背景被完整抠掉。
    autoKey: true,
    tolerance: 0.24,
    edge: 0.12,
    spill: 0.5,
    propImages: [
      // 蒸笼厨具：烟火气小物，放在狐狸身后（z:1），让狐狸主体站在道具前面。
      // 小物图同为绿色背景，v5 洪水填充后内部绿色灶台把手等不再误伤，阈值回升保证背景抠净。
      { src: '/liukanshan/props/hearth-keeper.png', x: '8%', y: '54%', size: '84%', h: '44%', objectPosition: 'center bottom', anim: 'float-y', z: 1, autoKey: true, tolerance: 0.24, edge: 0.12, spill: 0.5 },
    ],
  },
  // 10 末世硬核党 · 疯批爆裂型
  'mad-warlord': {
    image: '/liukanshan/mad-warrior.jpg',
    bg: 'radial-gradient(circle at 50% 30%, #3a1d1d, #1a0e0e)',
    effect: 'spark',
    propImages: [
      // 电锯骷髅火焰：原图被裁得只剩骷髅+火焰，现在容器放大、contain 显示完整小物（电锯在上方）。
      // 用户要求斧头/电锯放在刘看山身后，所以 z:1（狐狸 z:2）。
      { src: '/liukanshan/props/mad-warlord.png', x: '5%', y: '22%', size: '90%', h: '78%', fit: 'contain', objectPosition: 'center bottom', anim: 'float-y', z: 1 },
    ],
  },
  // 11 独立搞钱党 · 全能操盘型
  'omni-master': {
    image: '/liukanshan/omni-master.jpg',
    bg: 'radial-gradient(circle at 50% 30%, #232a40, #0e1220)',
    effect: 'aura',
    propImages: [
      // 魔法阵/星轨：背景小物，铺满舞台、放在狐狸身后只做上下浮动，不旋转
      { src: '/liukanshan/props/omni-master.png', x: '0%', y: '0%', size: '100%', h: '100%', fit: 'contain', objectPosition: 'center center', anim: 'float-y', z: 1 },
    ],
  },
};
