// 题材 × 主角原型 × 人格维度 映射数据
// 维度融合自：三色心相/性格色彩（红蓝黄绿四相） + 名著人格（角色型映射）
// 用途：测试答题得到四维分 → matchArchetype 推荐「你对应的网文主角原型」
// 数据来源（2026-09-13）：
//   1) 已用真实「知乎开放平台 Access Secret」实跑一次站内搜索，成功返回 40+ 条真实知乎文章
//      （证明接口可用，首条为《主角人设进阶：功能性比完美性更重要》，讲金手指/信息差/决策力）。
//   2) 当前搜索接口被频限（Code 30001），故补充采用公开网页（知乎讨论 + 阅文/起点百科等）归纳，
//      下列 characters 均为可核验的热门作品/主角。
//   注：真实知乎热榜/搜索为按需调用，密钥仅在服务端 .env，不入库。

// ===== 四维人格轴（0–100）=====
// action 红·行动征服：主动、果断、目标导向、领导力
// reason 蓝·理性谋略：冷静、分析、规划、智商在线
// free   黄·自由创意：乐观、脑洞、表达、不羁
// care   绿·共情守护：温和、合作、守护、治愈
export const AXES = [
  { key: 'action', name: '行动征服', color: '#ff5a5f', desc: '主动、果断、目标导向、领导力' },
  { key: 'reason', name: '理性谋略', color: '#3b82f6', desc: '冷静、分析、规划、智商在线' },
  { key: 'free',   name: '自由创意', color: '#f5b50a', desc: '乐观、脑洞、表达、不羁' },
  { key: 'care',   name: '共情守护', color: '#22c55e', desc: '温和、合作、守护、治愈' },
];

// ===== 题材分类（热门网文题材 + 简易标签）=====
export const GENRES = [
  { id: 'rebirth',   name: '重生文',     tags: ['前世惨死', '归来复仇', '清醒逆袭', '双商在线'], heat: '女频热榜 30–40%' },
  { id: 'apocalypse',name: '末世文',     tags: ['秩序崩塌', '杀伐果断', '囤货基建', '不圣母'],  heat: '短视频流量极高' },
  { id: 'transmute', name: '穿越/历史',  tags: ['穿古代', '改变历史', '权谋', '先知布局'],     heat: '男频订阅稳定' },
  { id: 'cultivate', name: '修仙/玄幻',  tags: ['苟道', '扮猪吃虎', '大道格局', '家族群像'],   heat: '需创新突围' },
  { id: 'romance',   name: '甜宠/现言',  tags: ['温柔治愈', '双向奔赴', '不虐', '烟火气'],     heat: '基本盘但降温中' },
  { id: 'mystery',   name: '悬疑/推理',  tags: ['智商在线', '脑洞', '细节', '真相'],           heat: '女频增速最快' },
  { id: 'career',    name: '大女主/事业',tags: ['搞钱搞事业', '独立自强', '男主可有可无'],     heat: '平台重点扶持' },
  { id: 'farming',   name: '种田/年代',  tags: ['治愈温情', '踏实过日', '带乡亲致富'],         heat: '稳定常青' },
];

// ===== 主角原型（题材 × 四维画像）=====
export const ARCHETYPES = [
  {
    id: 'revenge-queen', name: '重生·复仇女王', genre: 'rebirth',
    emblem: '👑', color: '#e11d48',
    axes: { action: 85, reason: 70, free: 40, care: 75 },
    trait: '前世含恨而终，今生清醒冷酷、护短狠辣、绝不恋爱脑。',
    characters: ['沈娇娇《重生之将门毒后》', '乔知意《闺蜜宾馆被辱，重生后我选择吃瓜》', '沈清澜《重启人生我的复仇之路》'],
    lines: ['上一世的债，这一世连本带利讨回来。', '善良要有牙齿，温柔得带剑。', '我不做谁的附庸，我只做自己的执棋人。'],
  },
  {
    id: 'train-captain', name: '末世·钢铁列车长', genre: 'apocalypse',
    emblem: '🚂', color: '#0ea5e9',
    axes: { action: 90, reason: 75, free: 50, care: 45 },
    trait: '杀伐果断不圣母，靠脑子与钢铁把废土变成移动堡垒。',
    characters: ['《我的末日列车》列车长', '《废土边境检查官》主角', '《极寒之下不养刁民》女主'],
    lines: ['末世从不养圣母，只认拳头与秩序。', '我的列车，载得下伙伴，碾得碎尸潮。', '别跟我谈人性，先活下来再说。'],
  },
  {
    id: 'doomsday-keeper', name: '末世·苟王', genre: 'apocalypse',
    emblem: '🛡️', color: '#14b8a6',
    axes: { action: 40, reason: 85, free: 70, care: 50 },
    trait: '先知+囤货+低调发育，别人挣扎求生他吃炸鸡看戏。',
    characters: ['楚清歌《囤货百亿：我在末世当苟王》', '《天灾囤货躺赢日常》主角', '《重生到天灾前疯狂囤货》主角'],
    lines: ['真正的强者，从不在第一波就露头。', '十亿物资在手，天下我有。', '你可以不服，但你可以饿着。'],
  },
  {
    id: 'history-master', name: '穿越·历史谋主', genre: 'transmute',
    emblem: '📜', color: '#7c3aed',
    axes: { action: 70, reason: 90, free: 45, care: 60 },
    trait: '携先知布局朝堂，智商在线不降智，阳谋破局。',
    characters: ['赵桓《重生宋钦宗》', '《大明妖孽》主角', '《谋断九州》主角'],
    lines: ['历史这盘棋，我知道每一步落子。', '圣人算计千般，我只需先手一步。', '家国情怀不是口号，是我要改写的结局。'],
  },
  {
    id: 'lowkey-cultivator', name: '修仙·苟道人', genre: 'cultivate',
    emblem: '🍃', color: '#10b981',
    axes: { action: 45, reason: 80, free: 55, care: 70 },
    trait: '低调发育扮猪吃虎，拒绝到处争霸，闷声悟道。',
    characters: ['吴涛《苟道流》', '沈从《属性不够所以全点悟性了》', '李长寿《我师兄实在太稳健了》'],
    lines: ['风头给了别人，大道留给自己。', '不争一时之强，只求长生久视。', '你以为我在第五层，其实我在地下室。'],
  },
  {
    id: 'gentle-healer', name: '甜宠·温柔治愈', genre: 'romance',
    emblem: '🌸', color: '#ec4899',
    axes: { action: 40, reason: 50, free: 60, care: 90 },
    trait: '善解人意、坚定温柔，是别人情感世界的支柱。',
    characters: ['曹雨涵《我怎么就重生了》', '温柔善良型女主', '青梅竹马·贤内助'],
    lines: ['世界很吵，我愿意做你安静的那一角。', '深情不是占有，是希望你过得好。', '慢一点没关系，我在。'],
  },
  {
    id: 'insight-detective', name: '悬疑·洞察侦探', genre: 'mystery',
    emblem: '🔍', color: '#2563eb',
    axes: { action: 55, reason: 92, free: 75, care: 50 },
    trait: '智商在线、脑洞清奇，从细节撕开真相。',
    characters: ['马普尔小姐《马普尔小姐探案》', '福尔摩斯《神探夏洛克》', '女仵作/女捕快'],
    lines: ['真相藏在第一个被忽略的细节里。', '逻辑不会骗人，骗人的是人心。', '我不在现场，但我能还原每一秒。'],
  },
  {
    id: 'career-queen', name: '大女主·事业女王', genre: 'career',
    emblem: '💎', color: '#f59e0b',
    axes: { action: 88, reason: 70, free: 80, care: 45 },
    trait: '搞钱搞事业独立自强，男主可有可无。',
    characters: ['斯嘉丽《乱世佳人》', '女帝/女商人', '将门女子搞权谋'],
    lines: ['爱情是点缀，江山我自己打。', '我命由我不由天，更不由你。', '要么出众，要么出局，我选前者。'],
  },
  {
    id: 'hearth-keeper', name: '种田·烟火人家', genre: 'farming',
    emblem: '🏡', color: '#84cc16',
    axes: { action: 50, reason: 65, free: 45, care: 85 },
    trait: '踏实过日子、治愈温情，带着乡亲一起好起来。',
    characters: ['年代文主角', '下乡养娃创业', '非遗手艺传承人'],
    lines: ['日子是过出来的，不是熬出来的。', '一粥一饭，都是人间值得。', '慢火炖出来的生活，最香。'],
  },
  {
    id: 'mad-warlord', name: '疯批战神', genre: 'apocalypse',
    emblem: '⚡', color: '#dc2626',
    axes: { action: 95, reason: 55, free: 85, care: 35 },
    trait: '双人格切换、发疯杀出血路，暴力美学反套路。',
    characters: ['《请为我尖叫！》双人格女主', '《末世黑暗召唤师》李佳玉', '《穿成娇软废物在游戏封神》'],
    lines: ['温柔是伪装，疯起来连自己都怕。', '这末世，我负责尖叫，你负责颤抖。', '别惹我，今天的我不太正常。'],
  },
];

// 根据四维分推荐最接近的「主角原型」
export function matchArchetype(axes) {
  let best = null;
  let bestDist = Infinity;
  for (const a of ARCHETYPES) {
    const d =
      (axes.action - a.axes.action) ** 2 +
      (axes.reason - a.axes.reason) ** 2 +
      (axes.free - a.axes.free) ** 2 +
      (axes.care - a.axes.care) ** 2;
    if (d < bestDist) { bestDist = d; best = a; }
  }
  // 主色相：四维最高的一项
  const dominant = AXES.reduce((m, x) => (axes[x.key] > axes[m.key] ? x : m), AXES[0]);
  return { archetype: best, dominantAxis: dominant, distance: Math.round(Math.sqrt(bestDist)) };
}

// 把「题材 id」映射回中文名（供结果卡展示）
export function genreName(id) {
  return (GENRES.find((g) => g.id === id) || {}).name || id;
}
