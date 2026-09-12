import { test } from 'node:test';
import assert from 'node:assert/strict';
import { MODELS, getAccessSecret, chatCompletion } from '../lib/zhihu-client.mjs';

test('MODELS 包含三个档位', () => {
  assert.deepEqual(
    Object.values(MODELS).sort(),
    ['zhida-agent', 'zhida-fast-1p5', 'zhida-thinking-1p5'].sort(),
  );
});

test('未配置密钥时 getAccessSecret 返回 null', () => {
  const prev = process.env.ZHIHU_ACCESS_SECRET;
  delete process.env.ZHIHU_ACCESS_SECRET;
  assert.equal(getAccessSecret(), null);
  if (prev !== undefined) process.env.ZHIHU_ACCESS_SECRET = prev;
});

test('未配置密钥时 chatCompletion 抛 MISSING_SECRET', async () => {
  const prev = process.env.ZHIHU_ACCESS_SECRET;
  delete process.env.ZHIHU_ACCESS_SECRET;
  try {
    await assert.rejects(
      () => chatCompletion({ messages: [{ role: 'user', content: 'hi' }] }),
      /ZHIHU_ACCESS_SECRET/,
    );
  } finally {
    if (prev !== undefined) process.env.ZHIHU_ACCESS_SECRET = prev;
  }
});
