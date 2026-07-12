import fs from 'node:fs'
import path from 'node:path'
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

/** 独立日志查看页 HTML（无前端入口，仅地址栏访问） */
function renderLogViewerPage(): string {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="robots" content="noindex, nofollow" />
  <title>日志查看</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: ui-monospace, 'Cascadia Code', 'Segoe UI', sans-serif;
      background: #0f0a1a;
      color: #e8e0f0;
      min-height: 100vh;
      padding: 24px;
    }
    .wrap { max-width: 1200px; margin: 0 auto; }
    h1 { font-size: 1.25rem; font-weight: 600; margin-bottom: 20px; color: #c4b5fd; }
    .card {
      background: #1a1228;
      border: 1px solid #2d2440;
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 16px;
    }
    .login-form { max-width: 360px; }
    label { display: block; font-size: 0.85rem; color: #a89bc4; margin-bottom: 6px; }
    input, select {
      width: 100%;
      padding: 10px 12px;
      border-radius: 8px;
      border: 1px solid #3d3255;
      background: #120d1c;
      color: #e8e0f0;
      font-size: 0.9rem;
      margin-bottom: 12px;
    }
    button {
      padding: 10px 18px;
      border: none;
      border-radius: 8px;
      background: linear-gradient(135deg, #7c3aed, #5b21b6);
      color: #fff;
      cursor: pointer;
      font-size: 0.9rem;
    }
    button:hover { opacity: 0.9; }
    button.secondary { background: #2d2440; margin-left: 8px; }
    button:disabled { opacity: 0.4; cursor: not-allowed; }
    .toolbar { display: flex; flex-wrap: wrap; gap: 12px; align-items: end; margin-bottom: 16px; }
    .toolbar > div { flex: 1; min-width: 140px; }
    .stats { font-size: 0.85rem; color: #a89bc4; margin-bottom: 12px; }
    table { width: 100%; border-collapse: collapse; font-size: 0.8rem; }
    th, td { text-align: left; padding: 10px 8px; border-bottom: 1px solid #2d2440; vertical-align: top; }
    th { color: #a89bc4; font-weight: 500; }
    .level-info { color: #86efac; }
    .level-warn { color: #fcd34d; }
    .level-error { color: #f87171; }
    .meta { color: #9ca3af; font-size: 0.75rem; word-break: break-all; max-width: 420px; }
    .pager { display: flex; gap: 8px; align-items: center; margin-top: 16px; }
    .hidden { display: none !important; }
    .err { color: #f87171; font-size: 0.85rem; margin-top: 8px; }
  </style>
</head>
<body>
  <div class="wrap">
    <h1>🔮 后端日志查看</h1>
    <div id="loginCard" class="card login-form">
      <label for="password">访问密码</label>
      <input id="password" type="password" placeholder="请输入密码" autocomplete="current-password" />
      <button id="loginBtn" type="button">登录</button>
      <p id="loginErr" class="err hidden"></p>
    </div>
    <div id="viewer" class="hidden">
      <div class="card">
        <div class="toolbar">
          <div><label for="fileSelect">日志文件</label><select id="fileSelect"></select></div>
          <div><label for="levelFilter">级别</label><select id="levelFilter"><option value="">全部</option><option value="info">info</option><option value="warn">warn</option><option value="error">error</option></select></div>
          <div><label for="categoryFilter">分类</label><select id="categoryFilter"><option value="">全部</option><option value="system">system</option><option value="http">http</option><option value="interpret">interpret</option><option value="ai">ai</option><option value="logs-viewer">logs-viewer</option></select></div>
          <div><label for="keyword">关键词</label><input id="keyword" type="text" placeholder="搜索 message / requestId" /></div>
          <div><button id="searchBtn" type="button">查询</button><button id="logoutBtn" type="button" class="secondary">退出</button></div>
        </div>
        <p id="stats" class="stats"></p>
        <div style="overflow-x:auto"><table><thead><tr><th>时间</th><th>级别</th><th>分类</th><th>消息</th><th>详情</th></tr></thead><tbody id="logBody"></tbody></table></div>
        <div class="pager"><button id="prevBtn" type="button" class="secondary">上一页</button><span id="pageInfo"></span><button id="nextBtn" type="button" class="secondary">下一页</button></div>
      </div>
    </div>
  </div>
  <script>
    const API = '/api/internal/logs';
    let page = 1;
    const limit = 50;
    const $ = (id) => document.getElementById(id);
    async function api(path, options = {}) {
      const res = await fetch(API + path, { credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, ...options });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || '请求失败');
      return data;
    }
    function showLogin() { $('loginCard').classList.remove('hidden'); $('viewer').classList.add('hidden'); }
    function showViewer() { $('loginCard').classList.add('hidden'); $('viewer').classList.remove('hidden'); }
    async function checkAuth() {
      try { await api('/files'); showViewer(); await loadFiles(); await loadLogs(); }
      catch { showLogin(); }
    }
    $('loginBtn').onclick = async () => {
      $('loginErr').classList.add('hidden');
      try {
        await api('/login', { method: 'POST', body: JSON.stringify({ password: $('password').value }) });
        showViewer(); await loadFiles(); page = 1; await loadLogs();
      } catch (e) { $('loginErr').textContent = e.message; $('loginErr').classList.remove('hidden'); }
    };
    $('password').onkeydown = (e) => { if (e.key === 'Enter') $('loginBtn').click(); };
    $('logoutBtn').onclick = async () => { await api('/logout', { method: 'POST' }).catch(() => {}); showLogin(); $('password').value = ''; };
    async function loadFiles() {
      const { files } = await api('/files');
      $('fileSelect').innerHTML = files.map((f) => '<option value="' + f + '">' + f + '</option>').join('');
    }
    function escapeHtml(s) { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
    async function loadLogs() {
      const params = new URLSearchParams({ file: $('fileSelect').value, page: String(page), limit: String(limit) });
      if ($('levelFilter').value) params.set('level', $('levelFilter').value);
      if ($('categoryFilter').value) params.set('category', $('categoryFilter').value);
      if ($('keyword').value.trim()) params.set('keyword', $('keyword').value.trim());
      const data = await api('/entries?' + params.toString());
      $('stats').textContent = '共 ' + data.total + ' 条，第 ' + data.page + ' / ' + data.totalPages + ' 页';
      $('pageInfo').textContent = '第 ' + data.page + ' 页';
      $('prevBtn').disabled = data.page <= 1;
      $('nextBtn').disabled = data.page >= data.totalPages;
      $('logBody').innerHTML = data.entries.map((e) => {
        const { time, level, category, message, ...meta } = e;
        const metaStr = Object.keys(meta).length ? JSON.stringify(meta) : '-';
        return '<tr><td>' + new Date(time).toLocaleString('zh-CN') + '</td><td class="level-' + level + '">' + level + '</td><td>' + category + '</td><td>' + escapeHtml(message) + '</td><td class="meta">' + escapeHtml(metaStr) + '</td></tr>';
      }).join('');
    }
    $('searchBtn').onclick = () => { page = 1; loadLogs(); };
    $('fileSelect').onchange = () => { page = 1; loadLogs(); };
    $('prevBtn').onclick = () => { if (page > 1) { page--; loadLogs(); } };
    $('nextBtn').onclick = () => { page++; loadLogs(); };
    checkAuth();
  </script>
</body>
</html>`
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
