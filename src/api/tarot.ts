import axios from 'axios'
import type { DrawnCard, InterpretationResult, Spread } from '@/types/tarot'

export interface InterpretRequest {
  question: string
  spreadType: string
  cards: {
    position: number
    cardName: string
    cardNameZh: string
    isReversed: boolean
    positionMeaning: string
    cardMeaning: string
  }[]
  model: string
}

/** 构建解读请求体 */
export function buildInterpretRequest(
  question: string,
  spread: Spread,
  cards: DrawnCard[],
  model: string
): InterpretRequest {
  return {
    question,
    spreadType: spread.id,
    model,
    cards: cards.map((dc) => {
      const pos = spread.positions.find((p) => p.index === dc.position)
      const meaning = dc.isReversed ? dc.card.meanings.reversed : dc.card.meanings.upright
      return {
        position: dc.position,
        cardName: dc.card.name.en,
        cardNameZh: dc.card.name.zh,
        isReversed: dc.isReversed,
        positionMeaning: pos?.name ?? `位置${dc.position}`,
        cardMeaning: meaning,
      }
    }),
  }
}

/** 非流式 AI 解读 */
export async function fetchInterpretation(
  payload: InterpretRequest
): Promise<InterpretationResult> {
  const { data } = await axios.post<{
    success: boolean
    interpretation: InterpretationResult
  }>('/api/tarot/interpret', payload)
  return data.interpretation
}

/** 流式 AI 解读（SSE） */
export async function streamInterpretation(
  payload: InterpretRequest,
  onChunk: (text: string) => void,
  onComplete: (result: InterpretationResult) => void,
  onError: (err: Error) => void
): Promise<void> {
  try {
    const response = await fetch('/api/tarot/interpret/stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}))
      throw new Error((errData as { error?: string }).error ?? '解读请求失败')
    }

    const reader = response.body?.getReader()
    if (!reader) throw new Error('无法读取响应流')

    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() ?? ''

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const jsonStr = line.slice(6).trim()
          if (jsonStr === '[DONE]') continue
          try {
            const parsed = JSON.parse(jsonStr) as {
              type: 'chunk' | 'done'
              text?: string
              interpretation?: InterpretationResult
            }
            if (parsed.type === 'chunk' && parsed.text) {
              onChunk(parsed.text)
            } else if (parsed.type === 'done' && parsed.interpretation) {
              onComplete(parsed.interpretation)
            }
          } catch {
            /* 忽略解析失败的行 */
          }
        }
      }
    }
  } catch (err) {
    onError(err instanceof Error ? err : new Error(String(err)))
  }
}
