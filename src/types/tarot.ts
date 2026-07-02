/** 塔罗牌类型定义 */

export interface TarotCard {
  id: string
  name: { en: string; zh: string }
  arcana: 'major' | 'minor'
  suit?: 'wands' | 'cups' | 'swords' | 'pentacles'
  rank?: string
  keywords: { upright: string; reversed: string }
  meanings: { upright: string; reversed: string }
  image: string
}

export interface SpreadPosition {
  index: number
  name: string
  description: string
}

export interface Spread {
  id: string
  name: { en: string; zh: string }
  description: string
  cardCount: number
  positions: SpreadPosition[]
}

export interface DrawnCard {
  card: TarotCard
  position: number
  isReversed: boolean
}

export interface Scene {
  id: string
  name: string
  icon: string
  questions: string[]
}

export interface InterpretationResult {
  overview: string
  positions: { position: number; text: string }[]
  suggestions: string[]
  cautions: string[]
}

export interface AIModel {
  id: string
  name: string
  enabled: boolean
}

export interface DivinationRecord {
  id: string
  question: string
  spreadId: string
  spreadName: string
  scene?: string
  drawMode?: 'system' | 'physical'
  cards: DrawnCard[]
  interpretation?: InterpretationResult
  model: string
  createdAt: string
}

/** 抽牌方式：系统在线抽牌 / 录入现实牌型 */
export type DrawMode = 'system' | 'physical'
