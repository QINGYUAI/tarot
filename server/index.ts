import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { interpretTarot, streamInterpretTarot } from './ai.js'
import { getConfiguredProviders, PROVIDERS } from './providers.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

/** 健康检查 */
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' })
})

/** 获取已配置 Key 的 AI 模型列表 */
app.get('/api/tarot/models', (_req, res) => {
  res.json({
    success: true,
    models: PROVIDERS.map((p) => ({
      id: p.id,
      name: p.name,
      configured: getConfiguredProviders().some((c) => c.id === p.id),
    })),
    configured: getConfiguredProviders(),
  })
})

/** 非流式 AI 解读 */
app.post('/api/tarot/interpret', async (req, res) => {
  try {
    const result = await interpretTarot(req.body)
    res.json({ success: true, ...result })
  } catch (err) {
    const message = err instanceof Error ? err.message : '解读失败'
    res.status(500).json({ success: false, error: message })
  }
})

/** 流式 AI 解读（SSE） */
app.post('/api/tarot/interpret/stream', async (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')

  try {
    await streamInterpretTarot(req.body, res)
  } catch (err) {
    const message = err instanceof Error ? err.message : '解读失败'
    res.write(`data: ${JSON.stringify({ type: 'error', error: message })}\n\n`)
    res.end()
  }
})

app.listen(PORT, () => {
  console.log(`🔮 Tarot API server running on http://localhost:${PORT}`)
})
