// 答题题库：8 道轻量题，每题 4 个选项。每个选项对 4 个维度有加权贡献。
// 维度：depth(硬核度) / playful(玩梗力) / output(表达欲) / rational(理性值)
export const DIMENSIONS = [
  { key: 'depth', label: '硬核度', icon: '🧠', desc: '钻研硬知识的劲头' },
  { key: 'playful', label: '玩梗力', icon: '😏', desc: '整活与造梗的天赋' },
  { key: 'output', label: '表达欲', icon: '📣', desc: '写回答/评论的冲动' },
  { key: 'rational', label: '理性值', icon: '🧐', desc: '先问是不是再问为什么' },
]

export const QUESTIONS = [
  {
    id: 'q1',
    title: '你刷知乎时最常做的事是？',
    options: [
      { label: '潜水看干货，默默收藏', score: { depth: 14, rational: 8, output: -6, playful: 0 } },
      { label: '怒答技术问题，纠错第一线', score: { depth: 10, rational: 16, output: 16, playful: -2 } },
      { label: '围观神回复，笑到打鸣', score: { playful: 18, output: 4, depth: -4, rational: -4 } },
      { label: '追热榜吃瓜，一键三连', score: { playful: 10, output: 6, depth: -2, rational: -2 } },
    ],
  },
  {
    id: 'q2',
    title: '遇到一个专业问题，你通常？',
    options: [
      { label: '搜关键词找高赞回答对照', score: { depth: 14, rational: 10, output: 0, playful: 0 } },
      { label: '直接甩给 AI 让它总结', score: { depth: 6, rational: 4, output: 0, playful: 4 } },
      { label: '收藏进"以后看"文件夹吃灰', score: { depth: 2, rational: 0, output: -8, playful: 0 } },
      { label: '自己查资料/论文推理', score: { depth: 18, rational: 14, output: -2, playful: 0 } },
    ],
  },
  {
    id: 'q3',
    title: '你最偏爱的知乎内容？',
    options: [
      { label: '硬核科普 / 工程技术', score: { depth: 16, rational: 8, output: 0, playful: -2 } },
      { label: '职场吐槽 / 人间观察', score: { depth: 0, rational: 2, output: 6, playful: 8 } },
      { label: '情感故事 / 深夜 emo', score: { depth: -2, rational: -4, output: 4, playful: 6 } },
      { label: '沙雕段子 / 神回复', score: { depth: -4, rational: -6, output: 2, playful: 18 } },
    ],
  },
  {
    id: 'q4',
    title: '你写回答的风格？',
    options: [
      { label: '严谨论证，附参考文献', score: { depth: 14, rational: 16, output: 8, playful: -2 } },
      { label: '段子手，先抖机灵', score: { depth: 0, rational: 0, output: 10, playful: 16 } },
      { label: '情绪共鸣，走心长文', score: { depth: 0, rational: -4, output: 12, playful: 6 } },
      { label: '一句话暴击，点到为止', score: { depth: 2, rational: 4, output: 10, playful: 8 } },
    ],
  },
  {
    id: 'q5',
    title: '深夜刷知乎你一般是？',
    options: [
      { label: '学习提升，卷死自己', score: { depth: 16, rational: 8, output: 0, playful: 0 } },
      { label: '放松摸鱼，快乐就好', score: { depth: 0, rational: -2, output: 0, playful: 14 } },
      { label: '找共鸣，看别人故事', score: { depth: 0, rational: -4, output: 4, playful: 6 } },
      { label: '看推理悬疑 / 未解之谜', score: { depth: 10, rational: 8, output: 0, playful: 4 } },
    ],
  },
  {
    id: 'q6',
    title: '看到好内容你会？',
    options: [
      { label: '点赞但不关注', score: { depth: 2, rational: 2, output: -4, playful: 0 } },
      { label: '关注并收藏，离线反复看', score: { depth: 12, rational: 6, output: -2, playful: 0 } },
      { label: '评论区 Battle / 补充', score: { depth: 6, rational: 8, output: 16, playful: 0 } },
      { label: '转发朋友圈安利', score: { depth: 0, rational: 0, output: 14, playful: 6 } },
    ],
  },
  {
    id: 'q7',
    title: '你眼中的知乎是？',
    options: [
      { label: '知识海洋，终身学习场', score: { depth: 14, rational: 10, output: 0, playful: 0 } },
      { label: '大型吐槽现场', score: { depth: 0, rational: 0, output: 4, playful: 14 } },
      { label: '故事会 / 情感树洞', score: { depth: -2, rational: -6, output: 4, playful: 10 } },
      { label: '赛博相亲角 / 职场图鉴', score: { depth: 0, rational: 2, output: 6, playful: 10 } },
    ],
  },
  {
    id: 'q8',
    title: '你的网名 / ID 风格？',
    options: [
      { label: '真名派，坦荡做人', score: { depth: 0, rational: 10, output: 4, playful: 0 } },
      { label: '昵称派，有点个性', score: { depth: 0, rational: 2, output: 4, playful: 8 } },
      { label: '匿名吃瓜，深藏功与名', score: { depth: 0, rational: 0, output: -8, playful: 6 } },
      { label: '中二 ID，自带剧情', score: { depth: 4, rational: 0, output: 4, playful: 14 } },
    ],
  },
]
