import fs from 'node:fs'
import path from 'node:path'
import './load-env.js'
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

/** 解析日志目录（延迟读取 env，相对路径基于 process.cwd()） */
function getLogDir(): string {
  const raw = process.env.LOG_DIR?.trim()
  if (!raw) return path.resolve(process.cwd(), 'logs')
  return path.isAbsolute(raw) ? raw : path.resolve(process.cwd(), raw)
}

/** 确保日志目录存在 */
function ensureLogDir(logDir: string): void {
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true })
  }
}

/** 按日期分文件：logs/app-2026-07-12.log */
function getLogFilePath(logDir: string): string {
  const date = new Date().toISOString().slice(0, 10)
  return path.join(logDir, `app-${date}.log`)
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
  const logDir = getLogDir()

  try {
    ensureLogDir(logDir)
    fs.appendFileSync(getLogFilePath(logDir), `${JSON.stringify(entry)}\n`, 'utf8')
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error(`[logger] 写入日志文件失败 (${logDir}):`, message)
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
  /** 返回当前解析后的日志目录绝对路径（用于启动诊断） */
  getLogDir,
}
