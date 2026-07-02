#!/usr/bin/env bash
# 服务器端部署脚本：由 GitHub Actions SSH 触发，也可在服务器上手动执行
set -euo pipefail

# 项目根目录（脚本位于 scripts/ 下）
PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_DIR"

echo "=========================================="
echo "  Tarot 部署开始: $(date '+%Y-%m-%d %H:%M:%S')"
echo "  目录: $PROJECT_DIR"
echo "=========================================="

# 检查 .env 是否存在（首次部署需手动创建）
if [[ ! -f .env ]]; then
  echo "错误: 未找到 .env 文件，请先复制 .env.example 并填入 API Key"
  echo "  cp .env.example .env && nano .env"
  exit 1
fi

echo ">>> [1/4] 拉取最新代码..."
git fetch origin main
git reset --hard origin/main

echo ">>> [2/4] 安装依赖..."
npm ci

echo ">>> [3/4] 构建前端（读取 .env 中的 VITE_* 变量）..."
npm run build

echo ">>> [4/4] 重启后端 API..."
if pm2 describe tarot-api > /dev/null 2>&1; then
  pm2 reload ecosystem.config.cjs --update-env
else
  pm2 start ecosystem.config.cjs
fi
pm2 save

echo "=========================================="
echo "  部署完成: $(date '+%Y-%m-%d %H:%M:%S')"
echo "  后端状态: pm2 status tarot-api"
echo "  健康检查: curl http://127.0.0.1:3001/api/health"
echo "=========================================="
