import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// 前端开发服务器把 /api 代理到本地 Node LLM 代理（端口 3000），
// 生产环境由 server/server.mjs 同时托管静态站与 /api，无需代理。
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:3000',
    },
  },
  build: {
    outDir: 'dist',
  },
})
