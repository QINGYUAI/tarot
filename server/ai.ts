import type { Response } from 'express'
import {
  callChatCompletion,
  hasAnyProviderConfigured,
  isProviderConfigured,
  readStreamContent,
} from './providers.js'

/** 解读请求体类型 */
export interface InterpretRequestBody {
  question: string
  spreadType: string
  model: string
  cards: {
    position: number
    cardName: string
    cardNameZh: string
    isReversed: boolean
    positionMeaning: string
    cardMeaning: string
  }[]
}

/** 解读结果结构 */
export interface InterpretationResult {
  overview: string
  positions: { position: number; text: string }[]
  suggestions: string[]
  cautions: string[]
}

/** 构建 AI 提示词 */
function buildPrompt(body: InterpretRequestBody): string {
  const cardsDesc = body.cards
    .map(
      (c) =>
        `位置${c.position}（${c.positionMeaning}）：${c.cardNameZh}（${c.cardName}）${c.isReversed ? '【逆位】' : '【正位】'} — ${c.cardMeaning}`
    )
    .join('\n')

  return `你是一位温暖、有同理心的塔罗解读师，面向完全不懂塔罗的小白用户。

用户问题：${body.question}
牌阵类型：${body.spreadType}

抽到的牌：
${cardsDesc}

请用 JSON 格式返回解读，结构如下：
{
  "overview": "整体概述（50-100字，温暖易懂，1-2句话总结核心信息）",
  "positions": [
    { "position": 1, "text": "该位置的详细解读（80-150字）" }
  ],
  "suggestions": ["建议1：...", "建议2：...", "建议3：..."],
  "cautions": ["需要注意：..."]
}

要求：
- 语气像朋友在分析，温暖有同理心
- 清晰不玄学，避免"牌面显示"、"命中注定"等表述
- 不宿命论，强调选择和行动的力量
- 术语出现时附带简要解释
- 不夸大恐惧或希望
- 只返回 JSON，不要其他内容`
}

/** 解析 AI 返回的 JSON */
function parseInterpretation(text: string): InterpretationResult {
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    throw new Error('AI 返回格式异常，无法解析 JSON')
  }
  const parsed = JSON.parse(jsonMatch[0]) as InterpretationResult

  if (!parsed.overview || !parsed.positions || !parsed.suggestions) {
    throw new Error('AI 返回内容不完整')
  }

  return parsed
}

/** 非流式解读 */
export async function interpretTarot(body: InterpretRequestBody) {
  if (!hasAnyProviderConfigured()) {
    return { interpretation: mockInterpretation(body), model: body.model, tokens: 0 }
  }

  if (!isProviderConfigured(body.model)) {
    throw new Error(`当前模型未配置 API Key，请在 .env 中设置对应密钥`)
  }

  const prompt = buildPrompt(body)
  const response = await callChatCompletion(body.model, prompt, false)
  const data = (await response.json()) as {
    choices: { message: { content: string } }[]
    usage?: { total_tokens: number }
  }

  const content = data.choices[0]?.message?.content ?? ''
  const interpretation = parseInterpretation(content)

  return {
    interpretation,
    model: body.model,
    tokens: data.usage?.total_tokens ?? 0,
  }
}

/** 流式解读 */
export async function streamInterpretTarot(body: InterpretRequestBody, res: Response) {
  if (!hasAnyProviderConfigured()) {
    const mock = mockInterpretation(body)
    for (const char of mock.overview) {
      res.write(`data: ${JSON.stringify({ type: 'chunk', text: char })}\n\n`)
      await new Promise((r) => setTimeout(r, 20))
    }
    res.write(`data: ${JSON.stringify({ type: 'done', interpretation: mock })}\n\n`)
    res.end()
    return
  }

  if (!isProviderConfigured(body.model)) {
    throw new Error(`当前模型未配置 API Key，请在 .env 中设置对应密钥`)
  }

  const prompt = buildPrompt(body)
  const response = await callChatCompletion(body.model, prompt, true)

  const fullContent = await readStreamContent(response, (chunk) => {
    res.write(`data: ${JSON.stringify({ type: 'chunk', text: chunk })}\n\n`)
  })

  const interpretation = parseInterpretation(fullContent)
  res.write(`data: ${JSON.stringify({ type: 'done', interpretation })}\n\n`)
  res.end()
}

/** 无 API Key 时的模拟解读 */
export function mockInterpretation(body: InterpretRequestBody): InterpretationResult {
  return {
    overview: `关于"${body.question}"，牌面呈现出一幅值得深思的画面。整体能量提示你关注内心的真实感受，并以开放的心态面对当前局面。`,
    positions: body.cards.map((c) => ({
      position: c.position,
      text: `在「${c.positionMeaning}」这个位置，${c.cardNameZh}${c.isReversed ? '（逆位）' : '（正位）'}出现了。${c.cardMeaning}。结合你的问题，这提示你需要在这个维度上多加留意，${c.isReversed ? '可能存在一些需要调整的方面' : '当前能量对此较为有利'}。`,
    })),
    suggestions: [
      '建议1：给自己一些安静的时间，倾听内心的声音',
      '建议2：将大目标分解为小步骤，逐步推进',
      '建议3：与信任的人分享你的想法，获得不同视角',
    ],
    cautions: ['需要注意：避免在情绪激动时做重大决定，给自己留出思考空间'],
  }
}
