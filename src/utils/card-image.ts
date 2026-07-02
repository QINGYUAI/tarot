import { getImagePath } from '@cometpisces/tarot-kit-images'

/** 本地牌图目录（public/card-images） */
const LOCAL_BASE = '/card-images'

/** 本项目 id → tarot-kit id 映射（大阿尔卡纳） */
const MAJOR_ID_MAP: Record<string, string> = {
  fool: 'the-fool',
  magician: 'the-magician',
  'high-priestess': 'the-high-priestess',
  empress: 'the-empress',
  emperor: 'the-emperor',
  hierophant: 'the-hierophant',
  lovers: 'the-lovers',
  chariot: 'the-chariot',
  strength: 'strength',
  hermit: 'the-hermit',
  'wheel-of-fortune': 'wheel-of-fortune',
  justice: 'justice',
  'hanged-man': 'the-hanged-man',
  death: 'death',
  temperance: 'temperance',
  devil: 'the-devil',
  tower: 'the-tower',
  star: 'the-star',
  moon: 'the-moon',
  sun: 'the-sun',
  judgement: 'judgement',
  world: 'the-world',
}

const RANK_WORD: Record<string, string> = {
  ace: 'ace',
  '2': 'two',
  '3': 'three',
  '4': 'four',
  '5': 'five',
  '6': 'six',
  '7': 'seven',
  '8': 'eight',
  '9': 'nine',
  '10': 'ten',
  page: 'page',
  knight: 'knight',
  queen: 'queen',
  king: 'king',
}

/** 将本项目卡牌 id 转为 tarot-kit id */
export function toKitCardId(cardId: string, suit?: string, rank?: string): string | undefined {
  if (MAJOR_ID_MAP[cardId]) return MAJOR_ID_MAP[cardId]
  if (suit && rank && RANK_WORD[rank]) {
    return `${RANK_WORD[rank]}-of-${suit}`
  }
  return undefined
}

/** 获取卡牌图片路径（本地静态资源） */
export function getCardImageUrl(cardId: string, suit?: string, rank?: string): string {
  const kitId = toKitCardId(cardId, suit, rank)
  const filename = kitId ? getImagePath(kitId) : undefined
  if (filename) return `${LOCAL_BASE}/${filename}`
  return '/card-placeholder.svg'
}
