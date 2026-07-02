# 塔罗占卜 Web 应用

专为塔罗零基础小白设计的引导式 + AI 深度解读占卜工具。

## 功能

- 6 大场景入口 + 自由提问
- 3 种牌阵：单张 / 三张 / 凯尔特十字（7张）
- 78 张 Rider-Waite 塔罗牌，支持正位/逆位
- 洗牌动画 + 翻牌交互
- AI 深度解读（DeepSeek / 智谱 / 通义 / 小米，流式输出）
- 历史记录（localStorage）
- 深紫神秘主题 UI，响应式设计

## 快速开始

```powershell
# 安装依赖
npm install

# 下载 78 张塔罗牌图片到 public/card-images/（首次或缺失时执行）
npm run download:cards

# 配置环境变量
Copy-Item .env.example .env
# 编辑 .env，填入需要使用的模型 API Key

# 启动开发服务（前端 + 后端）
npm run dev
```

- 前端：<http://localhost:5173>
- 后端 API：<http://localhost:3001>

## AI 模型配置

在 `.env` 中配置对应 Key（按需填写，未配置的模型无法使用）：

| 模型 | 环境变量 | 获取地址 |
|------|----------|----------|
| DeepSeek | `DEEPSEEK_API_KEY` | <https://platform.deepseek.com> |
| 智谱清言 | `ZHIPU_API_KEY` | <https://open.bigmodel.cn> |
| 通义千问 | `DASHSCOPE_API_KEY` | <https://dashscope.aliyun.com> |
| 小米 MiMo | `XIAOMI_API_KEY` | <https://platform.xiaomimimo.com> |

前端模型下拉列表由 `VITE_AI_MODELS` 控制，`enabled: true` 的模型会显示。

若所有 Key 均未配置，将自动使用模拟解读（便于本地体验）。

## 构建部署

在 `.env` 中可配置打包路径：

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `VITE_BASE_PATH` | 静态资源公共路径 | `./`（相对路径，适配 Hash 路由） |
| `VITE_OUT_DIR` | 打包输出目录 | `tarot` |

```powershell
npm run build
# 产物输出到 tarot/ 目录
# Hash 路由访问: index.html#/  或  index.html#/spread
```

若部署在固定子目录（如 `/tarot/`），可设置 `VITE_BASE_PATH=/tarot/` 后重新打包。

## 技术栈

- Vue 3 + TypeScript + Vite
- Pinia + Vue Router
- Express（AI 代理后端，支持多模型）
- DeepSeek / 智谱 GLM / 通义千问 / 小米 MiMo API
