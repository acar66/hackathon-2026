# 知乎开放平台 API 接入 Demo（项目三 · 跨次元游乐场）

把 `https://developer.zhihu.com/v1/chat/completions`（知乎直答）接入成一个**可运行、可演示、带降级**的最小网页应用。
零第三方依赖，仅用 Node 内置能力；Access Secret 只存于服务端环境变量，前端永远拿不到。

## 接口要点（来自知乎开放平台 http-api.md）

- 直答：`POST https://developer.zhihu.com/v1/chat/completions`
  - 请求头：`Authorization: Bearer <Access Secret>`、`X-Request-Timestamp: <秒级时间戳>`、`Content-Type: application/json`
  - 请求体：`{ model, messages:[{role,content}], stream? }`
  - 模型：`zhida-fast-1p5` / `zhida-thinking-1p5` / `zhida-agent`
  - 响应（OpenAI 兼容）：`choices[0].message.content`；流式为 SSE，`reasoning_content` 是思考过程
- 同文档还有内容接口（GET，同样 Bearer 鉴权），适合给项目三做「真实知乎素材」：
  - 站内搜索 `GET /api/v1/content/zhihu_search?Query=...&Count=`
  - 热榜 `GET /api/v1/content/hot_list?Limit=`
  - 全网搜索 `GET /api/v1/content/global_search`

## 目录

```
zhihu-api-demo/
├─ lib/zhihu-client.mjs   # 服务端 API 客户端（鉴权/错误/流式）
├─ server.mjs             # 代理服务：托管页面 + /api/chat|/api/search|/api/hot
├─ public/                # 浏览器端 Demo（AI NPC 对话）
├─ tests/client.test.mjs  # 客户端单测（无密钥也可跑）
└─ .env.example
```

## 运行

```bash
cd zhihu-api-demo
cp .env.example .env        # 填入 ZHIHU_ACCESS_SECRET（developer.zhihu.com/profile 获取）
node server.mjs             # 打开 http://localhost:3000
```

不填密钥也能启动页面；调用接口时会返回清晰错误提示（方便先看 UI、后接真值）。

## 本地接口

| 方法 | 路径 | 说明 |
| - | - | - |
| POST | `/api/chat` | 代理直答，body `{model, messages, stream}`，支持 SSE 流式 |
| GET | `/api/search?q=` | 知乎站内搜索 |
| GET | `/api/hot?limit=` | 知乎热榜 |
| GET | `/api/health` | 健康检查 |

> 这些接口把密钥留在服务端，浏览器只和本地服务通信，避免密钥泄露、也绕过浏览器 CORS。

## 测试

```bash
node --test
```

## 接入你们自己的项目三

- **直接复用 `lib/zhihu-client.mjs`**：把它拷进你的项目，任何 Node 服务里 `import { chatCompletion } from './lib/zhihu-client.mjs'` 即可。
- **NPC / 文字冒险 / 推理解谜**：把 `messages` 的 `system` 设成角色人设或剧情设定，`user` 设为玩家输入，返回 `content` 即 NPC 台词 / 下一幕剧情。
- **真实感素材**：用 `/api/search` 或 `/api/hot` 拉知乎高赞回答，作为 NPC 的「引用」或谜题线索，呼应评审对「真实场景」的偏好。
- **部署**：静态页 + Node 服务可整体部署到 Cloudflare / Sealos 等；把 `ZHIHU_ACCESS_SECRET` 设为平台 Secret，不要写进代码。
- **降级**：比赛现场断网/限流时，先准备一份本地示例回复（mock），保证 Demo 仍可演示核心玩法。
