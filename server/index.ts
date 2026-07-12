import './load-env.js'
import express from 'express'
import cors from 'cors'
import { randomUUID } from 'node:crypto'
import type { Request } from 'express'
import { interpretTarot, streamInterpretTarot, type InterpretRequestBody } from './ai.js'
import { getConfiguredProviders, PROVIDERS } from './providers.js'
import { extractInterpretMeta, extractAiResultLog, logger } from './logger.js'
import { mountLogsViewer, isLogsViewerPath } from './logs-viewer.js'

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

/** 获取客户端 IP（兼容 Nginx 反代） */
function getClientIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for']
  if (typeof forwarded === 'string' && forwarded.length > 0) {
    return forwarded.split(',')[0]?.trim() ?? 'unknown'
  }
  return req.socket.remoteAddress ?? 'unknown'
}

/** HTTP 请求日志中间件 */
app.use((req, res, next) => {
  const start = Date.now()
  const requestId = randomUUID()

  res.on('finish', () => {
    // 健康检查与日志页访问不记录，避免刷屏
    if (req.path === '/api/health' && res.statusCode < 400) return
    if (isLogsViewerPath(req.path) && res.statusCode < 400) return

    logger.info('http', `${req.method} ${req.path}`, {
      requestId,
      method: req.method,
      path: req.path,
      status: res.statusCode,
      durationMs: Date.now() - start,
      clientIp: getClientIp(req),
      userAgent: req.headers['user-agent'],
    })
  })

  next()
})

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
  const requestId = randomUUID()
  const start = Date.now()
  const body = req.body as InterpretRequestBody
  const meta = extractInterpretMeta(body)

  logger.info('interpret', '收到解读请求', {
    requestId,
    mode: 'sync',
    clientIp: getClientIp(req),
    ...meta,
  })

  try {
    const result = await interpretTarot(body, { requestId })
    logger.info('interpret', '解读成功', {
      requestId,
      mode: 'sync',
      model: result.model,
      tokens: result.tokens,
      durationMs: Date.now() - start,
      mock: result.mock,
      aiResult: extractAiResultLog(result.interpretation),
    })
    res.json({ success: true, ...result })
  } catch (err) {
    const message = err instanceof Error ? err.message : '解读失败'
    logger.error('interpret', '解读失败', {
      requestId,
      mode: 'sync',
      durationMs: Date.now() - start,
      error: message,
      ...meta,
    })
    res.status(500).json({ success: false, error: message })
  }
})

/** 流式 AI 解读（SSE） */
app.post('/api/tarot/interpret/stream', async (req, res) => {
  const requestId = randomUUID()
  const start = Date.now()
  const body = req.body as InterpretRequestBody
  const meta = extractInterpretMeta(body)

  logger.info('interpret', '收到解读请求', {
    requestId,
    mode: 'stream',
    clientIp: getClientIp(req),
    ...meta,
  })

  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')

  try {
    const result = await streamInterpretTarot(body, res, { requestId })
    logger.info('interpret', '解读成功', {
      requestId,
      mode: 'stream',
      model: result.model,
      tokens: result.tokens,
      durationMs: Date.now() - start,
      mock: result.mock,
      aiResult: extractAiResultLog(result.interpretation),
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : '解读失败'
    logger.error('interpret', '解读失败', {
      requestId,
      mode: 'stream',
      durationMs: Date.now() - start,
      error: message,
      ...meta,
    })
    res.write(`data: ${JSON.stringify({ type: 'error', error: message })}\n\n`)
    res.end()
  }
})

// 独立日志查看页（无前端入口，仅地址栏访问）
mountLogsViewer(app)

app.listen(PORT, () => {
  const logDir = logger.getLogDir()
  logger.info('system', 'Tarot API 服务已启动', {
    port: PORT,
    cwd: process.cwd(),
    logDir,
    nodeEnv: process.env.NODE_ENV ?? 'development',
  })
})
