#!/usr/bin/env bash
# 服务器端部署脚本：由 GitHub Actions SSH 触发，也可在服务器上手动执行
set -euo pipefail

# PROJECT_PATH：Git 源码目录（默认脚本所在项目的根目录）
# DEPLOY_PATH：前端静态文件部署目录（Nginx root，可与源码目录不同）
PROJECT_DIR="${PROJECT_PATH:-$(cd "$(dirname "$0")/.." && pwd)}"
BUILD_DIR="$PROJECT_DIR/tarot"
cd "$PROJECT_DIR"

echo "=========================================="
echo "  Tarot 部署开始: $(date '+%Y-%m-%d %H:%M:%S')"
echo "  源码目录: $PROJECT_DIR"
echo "  构建输出: $BUILD_DIR"
echo "  部署目录: ${DEPLOY_PATH:-（同构建输出）}"
echo "=========================================="

# 检查 .env 是否存在（首次部署需手动创建）
if [[ ! -f .env ]]; then
  echo "错误: 未找到 .env 文件，请先复制 .env.example 并填入 API Key"
  echo "  cp .env.example .env && nano .env"
  exit 1
fi

echo ">>> [1/5] 拉取最新代码..."
git fetch origin main
git reset --hard origin/main

echo ">>> [2/5] 安装依赖..."
npm ci

echo ">>> [3/5] 构建前端（读取 .env 中的 VITE_* 变量）..."
npm run build

# 若配置了 DEPLOY_PATH 且与构建目录不同，则同步静态文件
if [[ -n "${DEPLOY_PATH:-}" && "$DEPLOY_PATH" != "$BUILD_DIR" ]]; then
  echo ">>> [4/5] 同步静态文件到 $DEPLOY_PATH ..."
  mkdir -p "$DEPLOY_PATH"

  # 宝塔等面板生成的受保护文件，不可删除
  PANEL_PROTECTED=(.user.ini .htaccess)

  if command -v rsync &>/dev/null; then
    RSYNC_EXCLUDE=()
    for f in "${PANEL_PROTECTED[@]}"; do
      RSYNC_EXCLUDE+=(--exclude="$f")
    done
    rsync -a --delete "${RSYNC_EXCLUDE[@]}" "$BUILD_DIR/" "$DEPLOY_PATH/"
  else
    # 无 rsync：仅清理构建产物目录，保留 .user.ini 等面板文件
    rm -rf "$DEPLOY_PATH/assets"
    cp -a "$BUILD_DIR/." "$DEPLOY_PATH/"
  fi
else
  echo ">>> [4/5] 静态文件保留在 $BUILD_DIR"
fi

echo ">>> [5/5] 重启后端 API..."
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
