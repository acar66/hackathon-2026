# 知乎人格卡 · 赛博灵魂画像

知乎黑客松 2026 项目三（跨次元游乐场）MVP：用户答 8 道小题 → LLM 生成一张可分享的「知乎人格卡」（人格原型 + 维度档案 + 专属判词 + 知乎风语录）。

## 技术栈
- 前端：Vite + React + Tailwind（暗色玻璃拟态，web-beautify 设计系统）
- 后端：零依赖 Node 服务（`server/server.mjs`），复用已验证的 OpenAI Next Credits LLM 代理
- 密钥：**只存于服务端 `.env`，绝不进 git**

## 本地运行
1. 复制 `.env.example` 为 `.env`，填入 `LLM_API_KEY`（知乎黑客松的 sk- 密钥）
2. 安装依赖：`npm install`
3. 开发模式（前端 5173 + 代理 3000 同时起）：`npm run dev` → 打开 http://localhost:5173
4. 生产构建 + 单服务托管：`npm run build && npm start` → 打开 http://localhost:3000

## 接口
- `GET  /api/health`   健康检查
- `POST /api/chat`     透传 OpenAI 兼容对话（支持 stream）
- `POST /api/persona`  接收 `{ answers, dimensions }` → 返回 LLM 生成的 JSON 文本

## 降级
LLM 不可用时，前端用内置「知乎风语录包」本地兜底出卡，**断网也能演示**。

## 部署
`npm run build` 产出 `dist/`，由 `server/server.mjs` 托管（静态 + /api 同端口），
可托管到国内静态服务（阿里云 OSS / 腾讯云静态网站 / 码上掘金）。
