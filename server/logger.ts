import fs from 'node:fs'
import path from 'node:path'
import type { InterpretRequestBody } from './ai.js'

export type LogLevel = 'info' | 'warn' | 'error'

/** 日志条目结构（JSON Lines 格式） */
export interface LogEntry {
  time: string
  level: LogLevel
  category: string
  message: string
  [key: string]: unknown
}

const LOG_DIR = process.env.LOG_DIR || path.join(process.cwd(), 'logs')

/** 确保日志目录存在 */
function ensureLogDir(): void {
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true })
  }
}

/** 按日期分文件：logs/app-2026-07-12.log */
function getLogFilePath(): string {
  const date = new Date().toISOString().slice(0, 10)
  return path.join(LOG_DIR, `app-${date}.log`)
}

/** 截断过长文本，避免日志膨胀 */
export function truncateText(text: string, max = 120): string {
  const trimmed = text.trim()
  if (trimmed.length <= max) return trimmed
  return `${trimmed.slice(0, max)}...`
}

/** 从解读请求中提取可记录的业务字段（不含完整 prompt） */
export function extractInterpretMeta(body: InterpretRequestBody) {
  return {
    question: truncateText(body.question ?? ''),
    spreadType: body.spreadType,
    model: body.model,
    cardCount: body.cards?.length ?? 0,
    cards: body.cards?.map(
      (c) => `${c.cardNameZh}${c.isReversed ? '(逆位)' : '(正位)'}`
    ),
  }
}

/** 写入日志文件并输出到控制台（PM2 可捕获） */
function writeLog(entry: LogEntry): void {
  try {
    ensureLogDir()
    fs.appendFileSync(getLogFilePath(), `${JSON.stringify(entry)}\n`, 'utf8')
  } catch (err) {
    console.error('[logger] 写入日志文件失败:', err)
  }

  const { time, level, category, message, ...meta } = entry
  const metaStr = Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : ''
  console.log(`[${time}] [${level.toUpperCase()}] [${category}] ${message}${metaStr}`)
}

function log(level: LogLevel, category: string, message: string, meta?: Record<string, unknown>): void {
  writeLog({
    time: new Date().toISOString(),
    level,
    category,
    message,
    ...meta,
  })
}

/** 后端统一日志工具 */
export const logger = {
  info: (category: string, message: string, meta?: Record<string, unknown>) =>
    log('info', category, message, meta),
  warn: (category: string, message: string, meta?: Record<string, unknown>) =>
    log('warn', category, message, meta),
  error: (category: string, message: string, meta?: Record<string, unknown>) =>
    log('error', category, message, meta),
}
