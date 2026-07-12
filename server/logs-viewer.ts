import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { randomUUID } from 'node:crypto'
import type { Express, Request, Response, NextFunction } from 'express'
import { logger, type LogEntry, type LogLevel } from './logger.js'

/** 日志查看页访问密码（通过 .env 配置） */
const LOG_VIEWER_PASSWORD = process.env.LOG_VIEWER_PASSWORD || 'qingyuai'

/** 隐藏入口路径（仅地址栏访问，不在前端暴露） */
export const LOG_VIEWER_PATH = process.env.LOG_VIEWER_PATH || '/api/internal/logs/panel'

const SESSION_COOKIE = 'tarot_log_session'
const SESSION_TTL_MS = 8 * 60 * 60 * 1000

/** 内存会话（重启后失效） */
const sessions = new Map<string, number>()

/** 校验会话是否有效 */
function isValidSession(token: string | undefined): boolean {
  if (!token) return false
  const expires = sessions.get(token)
  if (!expires) return false
  if (Date.now() > expires) {
    sessions.delete(token)
    return false
  }
  return true
}

/** 解析 Cookie 中的 session */
function getSessionToken(req: Request): string | undefined {
  const cookie = req.headers.cookie ?? ''
  const match = cookie.match(new RegExp(`${SESSION_COOKIE}=([^;]+)`))
  return match?.[1]
}

/** 鉴权中间件 */
function requireLogAuth(req: Request, res: Response, next: NextFunction): void {
  if (isValidSession(getSessionToken(req))) {
    next()
    return
  }
  res.status(401).json({ success: false, error: '未登录或会话已过期' })
}

/** 安全读取日志文件名（防止路径穿越） */
function resolveLogFile(logDir: string, filename: string): string | null {
  if (!/^app-\d{4}-\d{2}-\d{2}\.log$/.test(filename)) return null
  const full = path.join(logDir, filename)
  if (!full.startsWith(logDir)) return null
  return full
}

/** 列出可用日志文件（按日期倒序） */
function listLogFiles(logDir: string): string[] {
  if (!fs.existsSync(logDir)) return []
  return fs
    .readdirSync(logDir)
    .filter((f) => /^app-\d{4}-\d{2}-\d{2}\.log$/.test(f))
    .sort((a, b) => b.localeCompare(a))
}

/** 读取并解析日志条目 */
function readLogEntries(filePath: string): LogEntry[] {
  if (!fs.existsSync(filePath)) return []
  const content = fs.readFileSync(filePath, 'utf8')
  const entries: LogEntry[] = []
  for (const line of content.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed) continue
    try {
      entries.push(JSON.parse(trimmed) as LogEntry)
    } catch {
      /* 跳过损坏行 */
    }
  }
  return entries
}

/** 读取独立 HTML 页面（移动端优化样式） */
function renderLogViewerPage(): string {
  const dir = path.dirname(fileURLToPath(import.meta.url))
  const htmlPath = path.join(dir, 'log-viewer.html')
  return fs.readFileSync(htmlPath, 'utf8')
}

/** 挂载日志查看相关路由 */
export function mountLogsViewer(app: Express): void {
  app.get(LOG_VIEWER_PATH, (_req, res) => {
    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    res.setHeader('Cache-Control', 'no-store')
    res.send(renderLogViewerPage())
  })

  app.post('/api/internal/logs/login', (req, res) => {
    const { password } = req.body as { password?: string }
    if (password !== LOG_VIEWER_PASSWORD) {
      logger.warn('logs-viewer', '日志页登录失败', { clientIp: req.ip })
      res.status(403).json({ success: false, error: '密码错误' })
      return
    }
    const token = randomUUID()
    sessions.set(token, Date.now() + SESSION_TTL_MS)
    res.setHeader(
      'Set-Cookie',
      `${SESSION_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${SESSION_TTL_MS / 1000}`
    )
    logger.info('logs-viewer', '日志页登录成功', { clientIp: req.ip })
    res.json({ success: true })
  })

  app.post('/api/internal/logs/logout', (req, res) => {
    const token = getSessionToken(req)
    if (token) sessions.delete(token)
    res.setHeader('Set-Cookie', `${SESSION_COOKIE}=; Path=/; HttpOnly; Max-Age=0`)
    res.json({ success: true })
  })

  app.get('/api/internal/logs/files', requireLogAuth, (_req, res) => {
    const logDir = logger.getLogDir()
    res.json({ success: true, files: listLogFiles(logDir), logDir })
  })

  app.get('/api/internal/logs/entries', requireLogAuth, (req, res) => {
    const logDir = logger.getLogDir()
    const filename = (req.query.file as string) || listLogFiles(logDir)[0]
    if (!filename) {
      res.json({ success: true, entries: [], total: 0, page: 1, totalPages: 1 })
      return
    }

    const filePath = resolveLogFile(logDir, filename)
    if (!filePath) {
      res.status(400).json({ success: false, error: '无效的日志文件名' })
      return
    }

    let entries = readLogEntries(filePath).reverse()

    const level = req.query.level as LogLevel | undefined
    const category = req.query.category as string | undefined
    const keyword = ((req.query.keyword as string) || '').trim().toLowerCase()

    if (level) entries = entries.filter((e) => e.level === level)
    if (category) entries = entries.filter((e) => e.category === category)
    if (keyword) {
      entries = entries.filter((e) => JSON.stringify(e).toLowerCase().includes(keyword))
    }

    const page = Math.max(1, parseInt(String(req.query.page || '1'), 10) || 1)
    const limit = Math.min(200, Math.max(1, parseInt(String(req.query.limit || '50'), 10) || 50))
    const total = entries.length
    const totalPages = Math.max(1, Math.ceil(total / limit))
    const start = (page - 1) * limit

    res.json({
      success: true,
      entries: entries.slice(start, start + limit),
      total,
      page,
      totalPages,
      limit,
    })
  })
}

/** 是否为日志查看内部路径（HTTP 中间件跳过记录） */
export function isLogsViewerPath(pathname: string): boolean {
  return pathname.startsWith('/api/internal/logs')
}
