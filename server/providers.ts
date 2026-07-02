/** 各 AI 模型提供商配置 */
export interface ProviderConfig {
  id: string
  name: string
  envKey: string
  placeholder: string
  baseUrl: string
  model: string
  /** 可选额外请求体字段 */
  extraBody?: Record<string, unknown>
}

/** 支持的模型列表 */
export const PROVIDERS: ProviderConfig[] = [
  {
    id: 'deepseek',
    name: 'DeepSeek',
    envKey: 'DEEPSEEK_API_KEY',
    placeholder: 'your_deepseek_api_key_here',
    baseUrl: 'https://api.deepseek.com/chat/completions',
    model: 'deepseek-chat',
  },
  {
    id: 'zhipu',
    name: '智谱清言',
    envKey: 'ZHIPU_API_KEY',
    placeholder: 'your_zhipu_api_key_here',
    baseUrl: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
    model: 'glm-4-flash',
  },
  {
    id: 'qwen',
    name: '通义千问',
    envKey: 'DASHSCOPE_API_KEY',
    placeholder: 'your_dashscope_api_key_here',
    baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions',
    model: 'qwen-plus',
  },
  {
    id: 'xiaomi',
    name: '小米 MiMo',
    envKey: 'XIAOMI_API_KEY',
    placeholder: 'your_xiaomi_api_key_here',
    baseUrl: 'https://api.xiaomimimo.com/v1/chat/completions',
    model: 'mimo-v2.5',
    extraBody: { thinking: { type: 'disabled' } },
  },
]

/** 获取指定模型的 API Key */
export function getApiKey(provider: ProviderConfig): string | undefined {
  const key = process.env[provider.envKey]?.trim()
  if (!key || key === provider.placeholder) return undefined
  return key
}

/** 检查模型是否已配置 Key */
export function isProviderConfigured(providerId: string): boolean {
  const provider = PROVIDERS.find((p) => p.id === providerId)
  if (!provider) return false
  return !!getApiKey(provider)
}

/** 是否有任意模型已配置 */
export function hasAnyProviderConfigured(): boolean {
  return PROVIDERS.some((p) => isProviderConfigured(p.id))
}

/** 获取已配置的模型列表 */
export function getConfiguredProviders() {
  return PROVIDERS.filter((p) => isProviderConfigured(p.id)).map((p) => ({
    id: p.id,
    name: p.name,
  }))
}

/** 根据 id 获取提供商配置 */
export function getProvider(modelId: string): ProviderConfig {
  const provider = PROVIDERS.find((p) => p.id === modelId)
  if (!provider) {
    throw new Error(`不支持的 AI 模型: ${modelId}，可选: ${PROVIDERS.map((p) => p.id).join(', ')}`)
  }
  return provider
}

/** 构建请求头（小米同时支持 Bearer 与 api-key） */
function buildHeaders(provider: ProviderConfig, apiKey: string): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${apiKey}`,
  }
  if (provider.id === 'xiaomi') {
    headers['api-key'] = apiKey
  }
  return headers
}

/** 调用 OpenAI 兼容 Chat Completions API */
export async function callChatCompletion(
  modelId: string,
  prompt: string,
  stream = false
): Promise<globalThis.Response> {
  const provider = getProvider(modelId)
  const apiKey = getApiKey(provider)

  if (!apiKey) {
    throw new Error(`请在 .env 中配置 ${provider.envKey}（${provider.name}）`)
  }

  const response = await fetch(provider.baseUrl, {
    method: 'POST',
    headers: buildHeaders(provider, apiKey),
    body: JSON.stringify({
      model: provider.model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      stream,
      ...provider.extraBody,
    }),
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`${provider.name} API 错误: ${response.status} ${err}`)
  }

  return response
}

/** 解析 SSE 流式响应，返回完整文本 */
export async function readStreamContent(
  response: globalThis.Response,
  onChunk: (text: string) => void
): Promise<string> {
  const reader = response.body?.getReader()
  if (!reader) throw new Error('无法读取流式响应')

  const decoder = new TextDecoder()
  let fullContent = ''
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() ?? ''

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue
      const data = line.slice(6).trim()
      if (data === '[DONE]') continue

      try {
        const parsed = JSON.parse(data) as {
          choices?: { delta?: { content?: string } }[]
        }
        const chunk = parsed.choices?.[0]?.delta?.content ?? ''
        if (chunk) {
          fullContent += chunk
          onChunk(chunk)
        }
      } catch {
        /* 忽略非 JSON 行 */
      }
    }
  }

  return fullContent
}
