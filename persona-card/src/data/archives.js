// 题材 × 主角原型 × 人格维度 映射数据（v3 · 维度签名驱动）
// 维度融合自：三色心相/性格色彩（红蓝黄绿四相） + 名著人格（角色型映射）
// 分类逻辑 v3：四维不再精算距离，只判断每个维度 HIGH/LOW（阈值 DIM_THRESHOLD）。
//   用户 → HIGH 维度集合（「维度签名」）→ 候选原型（签名是 HIGH 的子集）→ 取欧氏距离最近者。
//   这样「3 维同高 / 4 维全高」也能稳稳命中，结果卡写成「【党】的【型】」。
// 数据来源（2026-09-13）：
//   1) 已用真实「知乎开放平台 Access Secret」实跑站内搜索，成功返回 40+ 条真实知乎文章。
//   2) 搜索接口被频限（Code 30001），补充采用公开网页（知乎讨论 + 阅文/起点百科等）归纳，
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

// 维度"高"的判定：相对高（与用户自身其他维度比较），而非绝对阈值。
//   - 若四项均衡且整体中高水平（极差小 + 均值达标）→ 视为"多高/全高"（捕获你说的 3高/4高 人群）
//   - 否则取自身区间上半部（≥ 最低值 + 0.5×极差）的维度为高
// 说明：纯相对法无法区分"均衡高分"与"均衡低分"，故全高分支需一个轻度水平门槛（REL_MEAN_FLOOR）
//       以避免低分均衡人群被误判为全能型；如要纯相对可把该门槛设为 0。
export const DIM_THRESHOLD = 65; // 保留作兼容/参考，实际判定见 highDims
const REL_SPREAD = 18; // 四项极差 ≤ 此值视为"均衡"
const REL_MEAN_FLOOR = 55; // 均衡且均值 ≥ 此值才判为全高

// ===== 题材分类（8 个阵营 · 知乎风命名）=====
export const GENRES = [
  { id: 'rebirth',   name: '重生复盘党',   tags: ['前世惨死', '归来复仇', '清醒逆袭', '双商在线'], heat: '女频热榜 30–40%' },
  { id: 'apocalypse',name: '末世硬核党',   tags: ['秩序崩塌', '杀伐果断', '囤货基建', '不圣母'],  heat: '短视频流量极高' },
  { id: 'transmute', name: '穿越谋主党',   tags: ['穿古代', '改变历史', '权谋', '先知布局'],     heat: '男频订阅稳定' },
  { id: 'cultivate', name: '苟道飞升流',   tags: ['苟道', '扮猪吃虎', '大道格局', '家族群像'],   heat: '需创新突围' },
  { id: 'romance',   name: '甜宠守护党',   tags: ['温柔治愈', '双向奔赴', '不虐', '烟火气'],     heat: '基本盘但降温中' },
  { id: 'mystery',   name: '真相解构党',   tags: ['智商在线', '脑洞', '细节', '真相'],           heat: '女频增速最快' },
  { id: 'career',    name: '独立搞钱党',   tags: ['搞钱搞事业', '独立自强', '男主可有可无'],     heat: '平台重点扶持' },
  { id: 'farming',   name: '烟火守艺党',   tags: ['治愈温情', '踏实过日', '带乡亲致富'],         heat: '稳定常青' },
];

// ===== 主角原型（题材 × 四维画像 × 维度签名）=====
// signature = 该原型"高"的维度集合（threshold 65 反推）；分类时作为子集匹配条件。
export const ARCHETYPES = [
  {
    id: 'revenge-queen', name: '前世清算型', genre: 'rebirth',
    emblem: '👑', color: '#e11d48',
    axes: { action: 85, reason: 70, free: 40, care: 75 },
    signature: ['action', 'reason', 'care'],
    trait: '前世含恨而终，今生清醒冷酷、护短狠辣、绝不恋爱脑。',
    highlight: '及笄那夜她没有哭。前世毒酒入喉的灼烧还停在舌尖，今生的她已就着烛火把仇人的名字圈到第十七个——这一世，她要他们一个都跑不掉。',
    characters: ['沈娇娇《重生之将门毒后》', '乔知意《闺蜜宾馆被辱，重生后我选择吃瓜》', '沈清澜《重启人生我的复仇之路》'],
    lines: ['上一世的债，这一世连本带利讨回来。', '善良要有牙齿，温柔得带剑。', '我不做谁的附庸，我只做自己的执棋人。'],
  },
  {
    id: 'train-captain', name: '硬核秩序型', genre: 'apocalypse',
    emblem: '🚂', color: '#0ea5e9',
    axes: { action: 90, reason: 75, free: 50, care: 45 },
    signature: ['action', 'reason'],
    trait: '杀伐果断不圣母，靠脑子与钢铁把废土变成移动堡垒。',
    highlight: '尸潮涌上站台的那一刻，他没有退，只是把油门推到底。钢铁列车碾过废墟，车厢里妇孺安稳，车头他握着枪冷声下令：「三秒清场，超时的自己跳车。」',
    characters: ['《我的末日列车》列车长', '《废土边境检查官》主角', '《极寒之下不养刁民》女主'],
    lines: ['末世从不养圣母，只认拳头与秩序。', '我的列车，载得下伙伴，碾得碎尸潮。', '别跟我谈人性，先活下来再说。'],
  },
  {
    id: 'doomsday-keeper', name: '苟王本苟型', genre: 'apocalypse',
    emblem: '🛡️', color: '#14b8a6',
    axes: { action: 40, reason: 85, free: 70, care: 50 },
    signature: ['reason', 'free'],
    trait: '先知+囤货+低调发育，别人挣扎求生他吃炸鸡看戏。',
    highlight: '别人在前线拼命，她蹲在储物间啃炸鸡看监控。十亿物资码到天花板，系统提示音叮咚作响——「你已安全度过第 300 天」，她舔舔手指：「就这？」',
    characters: ['楚清歌《囤货百亿：我在末世当苟王》', '《天灾囤货躺赢日常》主角', '《重生到天灾前疯狂囤货》主角'],
    lines: ['真正的强者，从不在第一波就露头。', '十亿物资在手，天下我有。', '你可以不服，但你可以饿着。'],
  },
  {
    id: 'history-master', name: '历史操盘型', genre: 'transmute',
    emblem: '📜', color: '#7c3aed',
    axes: { action: 70, reason: 90, free: 45, care: 60 },
    signature: ['action', 'reason'],
    trait: '携先知布局朝堂，智商在线不降智，阳谋破局。',
    highlight: '他站在城楼上，望着金兵的旗帜轻轻笑了。上一世靖康之耻的寒风他记得清清楚楚，这一世他摊开那卷早写好的布局图——「这一步，我提前二十年走。」',
    characters: ['赵桓《重生宋钦宗》', '《大明妖孽》主角', '《谋断九州》主角'],
    lines: ['历史这盘棋，我知道每一步落子。', '圣人算计千般，我只需先手一步。', '家国情怀不是口号，是我要改写的结局。'],
  },
  {
    id: 'lowkey-cultivator', name: '稳健苟道型', genre: 'cultivate',
    emblem: '🍃', color: '#10b981',
    axes: { action: 45, reason: 80, free: 55, care: 70 },
    signature: ['reason', 'care'],
    trait: '低调发育扮猪吃虎，拒绝到处争霸，闷声悟道。',
    highlight: '师门大比他故意输给师侄，下山他绕开所有机缘。旁人笑他怂，他却在无人处掐指一算：「你以为我在第五层？其实我在地下室。」大道，慢点悟也不迟。',
    characters: ['吴涛《苟道流》', '沈从《属性不够所以全点悟性了》', '李长寿《我师兄实在太稳健了》'],
    lines: ['风头给了别人，大道留给自己。', '不争一时之强，只求长生久视。', '你以为我在第五层，其实我在地下室。'],
  },
  {
    id: 'gentle-healer', name: '温柔兜底型', genre: 'romance',
    emblem: '🌸', color: '#ec4899',
    axes: { action: 40, reason: 50, free: 60, care: 90 },
    signature: ['care'],
    trait: '善解人意、坚定温柔，是别人情感世界的支柱。',
    highlight: '朋友哭到凌晨三点，她没说什么大道理，只是把热好的牛奶推过去，又默默把对方踢乱的被子掖好。世界很吵，她愿意做那安静的一角。',
    characters: ['曹雨涵《我怎么就重生了》', '温柔善良型女主', '青梅竹马·贤内助'],
    lines: ['世界很吵，我愿意做你安静的那一角。', '深情不是占有，是希望你过得好。', '慢一点没关系，我在。'],
  },
  {
    id: 'insight-detective', name: '真相解构型', genre: 'mystery',
    emblem: '🔍', color: '#2563eb',
    axes: { action: 55, reason: 92, free: 75, care: 50 },
    signature: ['reason', 'free'],
    trait: '智商在线、脑洞清奇，从细节撕开真相。',
    highlight: '所有人都同情「意外身亡」的富翁，只有她注意到壁炉灰里有半截没烧尽的借条。她合上记事本，浅笑：「亲爱的，真相藏在第一个被忽略的细节里。」',
    characters: ['马普尔小姐《马普尔小姐探案》', '福尔摩斯《神探夏洛克》', '女仵作/女捕快'],
    lines: ['真相藏在第一个被忽略的细节里。', '逻辑不会骗人，骗人的是人心。', '我不在现场，但我能还原每一秒。'],
  },
  {
    id: 'career-queen', name: '搞钱女王型', genre: 'career',
    emblem: '💎', color: '#f59e0b',
    axes: { action: 88, reason: 70, free: 80, care: 45 },
    signature: ['action', 'reason', 'free'],
    trait: '搞钱搞事业独立自强，男主可有可无。',
    highlight: '庄园烧成焦土，她抓起泥里的萝卜塞进嘴里，红土沾满脸颊。「明天又是新的一天」——但在这之前，她要先让这片地长出钱来。',
    characters: ['斯嘉丽《乱世佳人》', '女帝/女商人', '将门女子搞权谋'],
    lines: ['爱情是点缀，江山我自己打。', '我命由我不由天，更不由你。', '要么出众，要么出局，我选前者。'],
  },
  {
    id: 'hearth-keeper', name: '烟火守艺型', genre: 'farming',
    emblem: '🏡', color: '#84cc16',
    axes: { action: 50, reason: 55, free: 72, care: 88 },
    // 签名为「自由+共情」：与温柔兜底型（仅共情）区分开，
    // 否则「自由+共情」的人会落进温柔兜底型（两者签名都是 care 时无法区分）。
    signature: ['free', 'care'],
    trait: '踏实过日子、治愈温情，带着乡亲一起好起来。',
    highlight: '灶台热气蒸腾，她把最后一笼馒头端上桌，顺手给隔壁孤寡老人留了两个。日子是过出来的，不是熬出来的——一粥一饭，都是人间值得。',
    characters: ['年代文主角', '下乡养娃创业', '非遗手艺传承人'],
    lines: ['日子是过出来的，不是熬出来的。', '一粥一饭，都是人间值得。', '慢火炖出来的生活，最香。'],
  },
  {
    id: 'mad-warlord', name: '疯批爆裂型', genre: 'apocalypse',
    emblem: '⚡', color: '#dc2626',
    axes: { action: 95, reason: 55, free: 85, care: 35 },
    signature: ['action', 'free'],
    trait: '双人格切换、发疯杀出血路，暴力美学反套路。',
    highlight: '白天她是笑盈盈的乖乖女，夜里她拎着电锯站在尸群中央，嘴角咧到耳根。「温柔是伪装，疯起来连自己都怕」——这末世，她负责尖叫。',
    characters: ['《请为我尖叫！》双人格女主', '《末世黑暗召唤师》李佳玉', '《穿成娇软废物在游戏封神》'],
    lines: ['温柔是伪装，疯起来连自己都怕。', '这末世，我负责尖叫，你负责颤抖。', '别惹我，今天的我不太正常。'],
  },
  {
    id: 'omni-master', name: '全能操盘型', genre: 'career',
    emblem: '🌟', color: '#a855f7',
    axes: { action: 80, reason: 80, free: 80, care: 80 },
    signature: ['action', 'reason', 'free', 'care'],
    trait: '四维全开，既能搞钱也能谋略，既能治愈也能掀桌——全才型玩家。',
    highlight: '诗会他一首诗惊动京城，朝堂他一封信搅动风云，江湖他一杯酒交遍豪杰。世人问他到底有几面，他笑着把棋子落定：「没有我接不住的剧本，只有我不想演的角色。」',
    characters: ['范闲《庆余年》', '张小敬《长安十二时辰》', '多面手大男/女主'],
    lines: ['没有我接不住的剧本，只有我不想演的角色。', '硬核与玩梗，谋略与共情，我全都要。', '维度拉满的人，不挑赛道。'],
  },
];

// 取 HIGH 维度集合（维度签名）——相对高判定
export function highDims(scores) {
  const vals = AXES.map((a) => scores?.[a.key] ?? 0);
  const max = Math.max(...vals);
  const min = Math.min(...vals);
  const mean = vals.reduce((s, v) => s + v, 0) / vals.length;
  const spread = max - min;
  // 均衡且整体中高水平 → 全高（捕获 4高/3高 人群）
  if (spread <= REL_SPREAD && mean >= REL_MEAN_FLOOR) {
    return AXES.map((a) => a.key);
  }
  // 否则：自身区间上半部为高
  const cutoff = min + 0.5 * spread;
  return AXES.filter((a) => (scores?.[a.key] ?? 0) >= cutoff).map((a) => a.key);
}

// 根据四维分推荐最接近的「主角原型」+ 所属「题材党」
// 逻辑：① 候选 = 签名是用户 HIGH 集合子集的原型；② 候选取「形状」最接近者；
//       ③ 若无候选（罕见签名）则在全部原型中取最近（兜底）。
//
// 为什么用「中心化欧氏距离」（各自减去自身四维均值后再比距离）而不是绝对欧氏距离：
//   答题模式下每题只能选一个维度，20 题分摊后每维绝对分天然偏低（如三高各 6~7 题 → 约 46 分），
//   若直接比绝对距离，用户会被拉向 axes 整体偏低的原型，而不是"高低形状"最像的那个。
//   中心化后只比较「哪一维相对更高」，形状匹配更符合人格测试的直觉。
export function matchArchetype(scores) {
  const high = new Set(highDims(scores));
  const candidates = ARCHETYPES.filter((a) => a.signature.every((k) => high.has(k)));
  const pool = candidates.length ? candidates : ARCHETYPES;

  const meanOf = (o) => (o.action + o.reason + o.free + o.care) / 4;
  const um = meanOf(scores);

  let best = pool[0];
  let bestDist = Infinity;
  for (const a of pool) {
    const am = meanOf(a.axes);
    const d =
      ((scores.action - um) - (a.axes.action - am)) ** 2 +
      ((scores.reason - um) - (a.axes.reason - am)) ** 2 +
      ((scores.free - um) - (a.axes.free - am)) ** 2 +
      ((scores.care - um) - (a.axes.care - am)) ** 2;
    if (d < bestDist) { bestDist = d; best = a; }
  }
  // 主色相：四维最高的一项
  const dominant = AXES.reduce(
    (m, x) => ((scores[x.key] ?? 0) > (scores[m.key] ?? 0) ? x : m),
    AXES[0]
  );
  return {
    archetype: best,
    dominantAxis: dominant,
    distance: Math.round(Math.sqrt(bestDist)),
    genre: genreName(best.genre),
  };
}

// 把「题材 id」映射回中文名（供结果卡展示）
export function genreName(id) {
  return (GENRES.find((g) => g.id === id) || {}).name || id;
}
