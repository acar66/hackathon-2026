// 知乎热门网文题材爬取脚本（仅本地运行，密钥来自 .env 的 ZHIHU_ACCESS_SECRET）
// 增量合并：已成功的 query 不会因后续限流而被空结果覆盖。
// 用法：node --env-file=.env scripts/crawl_zhihu.mjs
import { zhihuSearch, hotList } from '../../zhihu-api-demo/lib/zhihu-client.mjs';
import { writeFile, mkdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.resolve(__dirname, '../src/data');
const OUT_FILE = path.join(OUT_DIR, 'zhihu_crawl.json');

// 8 大热门题材（核心）+ 2 个综合主角人设查询
const QUERIES = [
  '重生文 主角人设',
  '末世文 主角 苟王',
  '穿越历史文 主角 谋略',
  '修仙文 苟道 主角',
  '甜宠 女主 人设',
  '悬疑推理文 主角 侦探',
  '大女主文 事业 主角',
  '种田文 年代 主角',
  '网络小说 主角类型 爽文',
  '网文主角 人设 盘点',
];

const DELAY = 6000; // 每次请求间隔，避免触发限流

function cleanText(t = '') {
  return String(t).replace(/\s+/g, ' ').trim().slice(0, 600);
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function loadPrev() {
  try {
    const raw = await readFile(OUT_FILE, 'utf8');
    return JSON.parse(raw);
  } catch {
    return { crawledAt: null, genres: {}, hotList: [] };
  }
}

async function main() {
  const out = await loadPrev();
  out.genres = out.genres || {};
  out.crawledAt = new Date().toISOString();

  for (const q of QUERIES) {
    const prev = out.genres[q];
    const prevOk = prev && !prev.error && (prev.count || 0) > 0;
    if (prevOk) {
      console.log(`· 跳过（已有 ${prev.count} 条）: ${q}`);
      continue;
    }
    try {
      const r = await zhihuSearch({ query: q, count: 5 });
      if (r.Code === 30001) {
        console.log(`⏸ ${q} -> 频率限制(30001)，按官方指引停止本轮重试`);
        out.genres[q] = { code: r.Code, message: r.Message, count: 0, items: [] };
        break; // 立即停止，避免续接惩罚窗口
      }
      const items = (r.Data?.Items || []).map((it) => ({
        title: it.Title || '',
        type: it.ContentType || '',
        author: it.AuthorSignature || '',
        text: cleanText(it.ContentText),
        id: it.ContentID || '',
      }));
      out.genres[q] = { code: r.Code, message: r.Message, count: items.length, items };
      console.log(`✓ ${q} -> ${items.length} 条`);
    } catch (e) {
      out.genres[q] = { error: e.message, status: e.status };
      console.log(`✗ ${q} -> ${e.message}`);
    }
    await sleep(DELAY);
  }

  if (!out.hotList || out.hotList.length === 0) {
    try {
      await sleep(2000);
      const h = await hotList({ limit: 20 });
      out.hotList = (h.Data?.List || []).map((it) => ({
        title: it.Title || it.target?.title || '',
        heat: it.Heat || it.detail?.heatNum || '',
      }));
      console.log(`✓ 热榜 -> ${out.hotList.length} 条`);
    } catch (e) {
      out.hotListError = e.message;
      console.log(`✗ 热榜 -> ${e.message}`);
    }
  } else {
    console.log(`· 热榜已有 ${out.hotList.length} 条，跳过`);
  }

  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(OUT_FILE, JSON.stringify(out, null, 2), 'utf8');
  const total = Object.values(out.genres).reduce((s, g) => s + (g.count || 0), 0);
  console.log(`\n完成：当前共 ${total} 条文章，已写入 ${OUT_FILE}`);
}

main().catch((e) => {
  console.error('FATAL', e);
  process.exit(1);
});
