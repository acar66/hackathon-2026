// 答题题库 V2 · 知乎内容版（20 题）
// 来源：题库设计-v2-知乎内容版.md（情境锚点来自 zhihu-cli 真实拉取的热榜/高赞内容）
// 设计原则：
//   ① 客观行为类为主（8 题）——真实发生过的选择，最好选、最显准
//   ② 四体验各覆盖（个人偏好 3 / 情绪感受 3 / 观念认知 3 / 想象倾向 3）
//   ③ 调动感受、联系生活、制造代入感（题源来自知乎真实内容，玩家一看就有熟悉感）
//
// 计分：每题 4 选 1，选哪项该维 +1；20 题做完四维合计恒为 20。
//       再由 scoreAnswers 映射到 0–100，喂给 matchArchetype(scores) 出「【党】的【型】」。

import { AXES } from './archives.js';

// 四维沿用 archives.js 的唯一真源（action 红 / reason 蓝 / free 黄 / care 绿）
export const DIMENSIONS = AXES;

// 分组：用于 UI 显示进度与「这一组在测什么」
export const GROUPS = [
  { key: 'behavior', name: '客观行为', desc: '你真实会怎么做' },
  { key: 'prefer', name: '个人偏好', desc: '你天然被什么吸引' },
  { key: 'emotion', name: '情绪感受', desc: '什么会真的戳到你' },
  { key: 'belief', name: '观念认知', desc: '你相信什么' },
  { key: 'imagine', name: '想象倾向', desc: '你的本能会往哪走' },
];

export const QUESTIONS = [
  // ===== A. 客观行为类（8 题）=====
  {
    id: 'q1',
    group: 'behavior',
    title: '朋友临时在群里喊「出来聚」，你的第一反应是',
    options: [
      { dim: 'action', label: '立刻收拾出门，到了再想干嘛' },
      { dim: 'reason', label: '先问清时间地点、看路线和都有谁，再决定' },
      { dim: 'free', label: '看心情，临时换个地方也无所谓' },
      { dim: 'care', label: '先问谁去，有没有人会落单需要我陪' },
    ],
  },
  {
    id: 'q2',
    group: 'behavior',
    title: '刷知乎热榜时，你更常',
    options: [
      { dim: 'action', label: '直奔结论和高赞，划得飞快' },
      { dim: 'reason', label: '点进问题，把几个高赞回答交叉比对' },
      { dim: 'free', label: '被脑洞标题勾进去，一路逛到忘了时间' },
      { dim: 'care', label: '顺手给认同的回答点个赞，留句鼓励' },
    ],
  },
  {
    id: 'q3',
    group: 'behavior',
    title: '接到一个完全陌生的新任务，你的第一步是',
    options: [
      { dim: 'action', label: '撸起袖子先干，边做边学' },
      { dim: 'reason', label: '列清单、查资料，把步骤拆清楚' },
      { dim: 'free', label: '先想有没有更骚的解法、能不能换个路子' },
      { dim: 'care', label: '先想这活儿牵动谁，要不要拉人一起' },
    ],
  },
  {
    id: 'q4',
    group: 'behavior',
    title: '热榜上「程序员删库跑路 89TB 获刑」，你的第一反应是',
    note: '改编自知乎热议：程序员为干私活删光 89TB 数据，获刑五年十个月',
    options: [
      { dim: 'action', label: '这人真敢干，就是太莽了' },
      { dim: 'reason', label: '流程漏洞才是根因，不该只怪一个人' },
      { dim: 'free', label: '这剧情，小说都不敢这么写' },
      { dim: 'care', label: '他家里人怎么办，挺唏嘘的' },
    ],
  },
  {
    id: 'q5',
    group: 'behavior',
    title: '大促（双十一之类）时，你的真实画像是',
    options: [
      { dim: 'action', label: '看中就下单，爽就完了' },
      { dim: 'reason', label: '提前比价、算满减、列清单' },
      { dim: 'free', label: '买点没用但开心的小玩意儿取悦自己' },
      { dim: 'care', label: '帮家人朋友一起凑单，省一点是一点' },
    ],
  },
  {
    id: 'q6',
    group: 'behavior',
    title: '一场热闹的聚会结束，你更可能是',
    options: [
      { dim: 'action', label: '意犹未尽，还想续个摊' },
      { dim: 'reason', label: '挺好但有点累，回去复盘今天认识了谁' },
      { dim: 'free', label: '中途溜去角落玩手机，也挺自在' },
      { dim: 'care', label: '临走还在帮主人收拾、送喝醉的人' },
    ],
  },
  {
    id: 'q7',
    group: 'behavior',
    title: '你在知乎或朋友圈发东西，通常是',
    options: [
      { dim: 'action', label: '有感就发，不纠结' },
      { dim: 'reason', label: '写之前先想清楚逻辑和立场' },
      { dim: 'free', label: '怎么有意思怎么来，最好带点梗' },
      { dim: 'care', label: '会先想有没有人看了会不舒服' },
    ],
  },
  {
    id: 'q8',
    group: 'behavior',
    title: '遇到「独居者离世、房产归国家」这类现实麻烦，你的习惯是',
    note: '来自知乎热议：北京独居者离世无继承人，房产收归国有',
    options: [
      { dim: 'action', label: '先动起来，找人问、跑流程' },
      { dim: 'reason', label: '先查规定、找类似案例，想清路径' },
      { dim: 'free', label: '看看有没有偏门但可行的奇招' },
      { dim: 'care', label: '先安抚被这件事影响的人的情绪' },
    ],
  },

  // ===== B. 个人偏好（3 题）=====
  {
    id: 'q9',
    group: 'prefer',
    title: '知乎上「末日重生爽文成当代白领安眠药」很火，如果真有这种文，你最想看主角走哪条线',
    note: '知乎高赞：重生文/末世文是白领的安眠药——过去可重写、仇人被清算',
    options: [
      { dim: 'action', label: '杀伐果断，把仇人一个个清算干净' },
      { dim: 'reason', label: '靠信息和布局逆天改命，不靠拳头' },
      { dim: 'free', label: '脑洞大开，玩转重生后的所有规则' },
      { dim: 'care', label: '护住身边人，大家一起活下去' },
    ],
  },
  {
    id: 'q10',
    group: 'prefer',
    title: '如果可以拥有一个超能力，你最想要',
    options: [
      { dim: 'action', label: '绝对执行力，想到就能做到' },
      { dim: 'reason', label: '过目不忘，且能推演万物' },
      { dim: 'free', label: '随时能去任何想去的平行世界' },
      { dim: 'care', label: '能直接感知到别人的情绪' },
    ],
  },
  {
    id: 'q11',
    group: 'prefer',
    title: '你的收藏夹里，大概率囤得最多的是',
    note: '知乎特色：干货、沙雕、治愈分门别类的收藏夹文化',
    options: [
      { dim: 'action', label: '实用技能／教程，学了就能用' },
      { dim: 'reason', label: '干货方法论／思维模型' },
      { dim: 'free', label: '脑洞／沙雕／灵感图' },
      { dim: 'care', label: '治愈／心理／人际关系' },
    ],
  },

  // ===== C. 情绪感受（3 题）=====
  {
    id: 'q12',
    group: 'emotion',
    title: '知乎有句话：「你测出来的人格，其实是你希望成为的自己，不是真实的你。」看到这话你第一感觉是',
    note: '来自知乎 MBTI 2026 讨论：「薛定谔的人格」',
    options: [
      { dim: 'action', label: '管他呢，能爽就行' },
      { dim: 'reason', label: '有点道理，测试本就只能看到片面' },
      { dim: 'free', label: '哈哈好会总结，薛定谔的人格' },
      { dim: 'care', label: '那……真实的我，会有人懂吗' },
    ],
  },
  {
    id: 'q13',
    group: 'emotion',
    title: '什么时刻你会由衷觉得「活着真好」',
    options: [
      { dim: 'action', label: '搞定一件难事、大汗淋漓的那一刻' },
      { dim: 'reason', label: '想通了一个困扰很久的难题' },
      { dim: 'free', label: '脑子里突然冒出一个绝妙点子' },
      { dim: 'care', label: '被人毫无保留地接住、理解' },
    ],
  },
  {
    id: 'q14',
    group: 'emotion',
    title: '深夜 emo 刷到一条戳心的回答，你通常会',
    options: [
      { dim: 'action', label: '去评论区怼两句，或发个动态宣泄' },
      { dim: 'reason', label: '截图存下，第二天再理性分析为什么 emo' },
      { dim: 'free', label: '顺着推荐一路逛到天亮' },
      { dim: 'care', label: '转给懂的人，或默默给同类回答点个赞' },
    ],
  },

  // ===== D. 观念认知（3 题）=====
  {
    id: 'q15',
    group: 'belief',
    title: '知乎高赞说：「末世的核心是秩序崩塌后活着，重点是苟住。」你对「苟」的态度是',
    note: '知乎高赞：囤积流/种田流走红，本质是对确定性的渴望',
    options: [
      { dim: 'action', label: '苟是暂时的，时机到了迟早掀桌' },
      { dim: 'reason', label: '苟是最高级的生存智慧，蓄力待发' },
      { dim: 'free', label: '苟也要苟得快乐、苟得自由' },
      { dim: 'care', label: '要苟，也得拉上身边人一起苟' },
    ],
  },
  {
    id: 'q16',
    group: 'belief',
    title: '关于「公平」，你更认同哪一句',
    options: [
      { dim: 'action', label: '公平是打出来的，不是等来的' },
      { dim: 'reason', label: '公平得靠制度和规则来保障' },
      { dim: 'free', label: '世上本就没绝对公平，活出自己就好' },
      { dim: 'care', label: '弱者的公平，更值得被看见' },
    ],
  },
  {
    id: 'q17',
    group: 'belief',
    title: '知乎常辩「I 人 E 人」——你觉得「了解自己」主要靠',
    note: '知乎热议：I/E 人聚会后需要恢复空间的讨论',
    options: [
      { dim: 'action', label: '在事上练，做着做着就知道了' },
      { dim: 'reason', label: '观察和反思自己的行为数据' },
      { dim: 'free', label: '跟着感觉走，不被任何标签定义' },
      { dim: 'care', label: '从别人怎么对待我、需要我中认识自己' },
    ],
  },

  // ===== E. 想象倾向（3 题）=====
  {
    id: 'q18',
    group: 'imagine',
    title: '想象你重生回三年前，手里还多了一份「未来剧本」，你的第一件事是',
    note: '知乎经典体：「如果给你一次重生机会，你最想改掉哪件事」',
    options: [
      { dim: 'action', label: '立刻去拦下那个错误决定，追回那个人' },
      { dim: 'reason', label: '先验证剧本真假，再布局三步' },
      { dim: 'free', label: '拿剧本去搞点疯狂又好玩的事' },
      { dim: 'care', label: '先去抱抱那时还好好在的家人朋友' },
    ],
  },
  {
    id: 'q19',
    group: 'imagine',
    title: '末日降临，你醒来身边只有一辆改装车和三天物资，你的本能是',
    options: [
      { dim: 'action', label: '马上出发，抢占高地建立据点' },
      { dim: 'reason', label: '先清点物资、画地图、定路线' },
      { dim: 'free', label: '顺路捡奇怪装备，把它改成移动城堡' },
      { dim: 'care', label: '先找有没有落单的孩子或老人，一起走' },
    ],
  },
  {
    id: 'q20',
    group: 'imagine',
    title: '闭上眼想象十年后的你，画面里最清晰的是',
    options: [
      { dim: 'action', label: '我正在做成一件大事，或带着一支队伍' },
      { dim: 'reason', label: '我把生活和工作都理得明明白白' },
      { dim: 'free', label: '我在某个自由的地方，做着喜欢的事' },
      { dim: 'care', label: '身边围绕着我关心、也关心我的人' },
    ],
  },
];

// 计分：answers 为长度 = QUESTIONS.length 的数组，每项为选中的 dim（'action'|'reason'|'free'|'care'|null）
// 原始分 n ∈ [0, 20] → 映射到 0–100：20 + (n/20)*75，即 20（全不选）～95（全选）
//   这样均衡型（各 5 题）落在 ~39，明显偏向型可到 70–95，与原型 axes（35–95）可比。
export function scoreAnswers(answers = []) {
  const raw = { action: 0, reason: 0, free: 0, care: 0 };
  answers.forEach((dim) => {
    if (dim && raw[dim] !== undefined) raw[dim] += 1;
  });
  const total = QUESTIONS.length || 1;
  const scores = {};
  for (const ax of AXES) {
    scores[ax.key] = Math.round(20 + (raw[ax.key] / total) * 75);
  }
  return scores;
}

// 各维度命中的题数（用于结果页展示「你在哪一维度最高」的百分比条）
export function rawCounts(answers = []) {
  const raw = { action: 0, reason: 0, free: 0, care: 0 };
  answers.forEach((dim) => {
    if (dim && raw[dim] !== undefined) raw[dim] += 1;
  });
  return raw;
}
