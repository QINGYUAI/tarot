import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

/** 规范化 base 路径（需以 / 结尾） */
function normalizeBase(base: string) {
  if (base === './' || base === '.') return './'
  return base.endsWith('/') ? base : `${base}/`
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  // 静态资源公共路径，Hash 模式推荐 ./ 相对路径
  const base = normalizeBase(env.VITE_BASE_PATH || './')
  // 打包输出目录
  const outDir = env.VITE_OUT_DIR || 'tarot'

  return {
    base,
    build: {
      outDir,
      emptyOutDir: true,
      assetsDir: 'assets',
    },
    plugins: [vue()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: 'http://localhost:3001',
          changeOrigin: true,
        },
      },
    },
  }
})
