import type { TarotCard } from '@/types/tarot'
import { getCardImageUrl } from '@/utils/card-image'

/** 大阿尔卡纳 22 张完整数据 */
const MAJOR_DATA: Omit<TarotCard, 'image'>[] = [
  { id: 'fool', name: { en: 'The Fool', zh: '愚者' }, arcana: 'major', keywords: { upright: '冒险、天真、无限可能', reversed: '冲动、愚蠢、错失机会' }, meanings: { upright: '新的开始，充满可能性，保持开放心态踏上旅程', reversed: '鲁莽行事，缺乏计划，因冲动而错失良机' } },
  { id: 'magician', name: { en: 'The Magician', zh: '魔术师' }, arcana: 'major', keywords: { upright: '创造力、意志力、工具', reversed: '伎俩、缺乏方向、自我欺骗' }, meanings: { upright: '拥有实现目标的能力与资源，主动创造改变', reversed: '才能被误用，方向不明，自我欺骗或操纵他人' } },
  { id: 'high-priestess', name: { en: 'The High Priestess', zh: '女祭司' }, arcana: 'major', keywords: { upright: '直觉、神秘、内心声音', reversed: '秘密、欺骗、隐藏动机' }, meanings: { upright: '倾听内在直觉，答案在潜意识中', reversed: '忽视直觉，隐藏信息，内心与外界脱节' } },
  { id: 'empress', name: { en: 'The Empress', zh: '女皇' }, arcana: 'major', keywords: { upright: '丰盛、温柔、自然、母亲', reversed: '依赖、忽视、创造力受阻' }, meanings: { upright: '滋养与丰盛，创造力蓬勃，享受感官与美好', reversed: '过度依赖，忽视自我，创造力或关系受阻' } },
  { id: 'emperor', name: { en: 'The Emperor', zh: '皇帝' }, arcana: 'major', keywords: { upright: '权威、结构、秩序、父亲', reversed: '专制、僵化、缺乏自律' }, meanings: { upright: '建立秩序与规则，以理性和领导力掌控局面', reversed: '控制欲过强，僵化固执，或缺乏自律与方向' } },
  { id: 'hierophant', name: { en: 'The Hierophant', zh: '教皇' }, arcana: 'major', keywords: { upright: '传统、精神指引、群体', reversed: '反叛、质疑权威、新方式' }, meanings: { upright: '遵循传统与规范，寻求导师或精神指引', reversed: '挑战权威，走非传统道路，打破旧有框架' } },
  { id: 'lovers', name: { en: 'The Lovers', zh: '恋人' }, arcana: 'major', keywords: { upright: '选择、爱情、价值观', reversed: '优柔寡断、沟通不良、不和' }, meanings: { upright: '重要选择与价值观对齐，关系中的和谐与吸引', reversed: '关系失衡，价值观冲突，难以做出决定' } },
  { id: 'chariot', name: { en: 'The Chariot', zh: '战车' }, arcana: 'major', keywords: { upright: '意志力、胜利、控制', reversed: '失控、方向迷失、愤怒' }, meanings: { upright: '以坚定意志克服障碍，朝着目标前进', reversed: '失去控制，方向混乱，被情绪或外力牵制' } },
  { id: 'strength', name: { en: 'Strength', zh: '力量' }, arcana: 'major', keywords: { upright: '勇气、耐心、内在力量', reversed: '自我怀疑、脆弱、失控' }, meanings: { upright: '以柔克刚，内在勇气与耐心化解挑战', reversed: '自我怀疑，缺乏信心，被恐惧或冲动支配' } },
  { id: 'hermit', name: { en: 'The Hermit', zh: '隐者' }, arcana: 'major', keywords: { upright: '独处、内省、指引', reversed: '孤立、孤独、害怕独处' }, meanings: { upright: '退隐内省，在独处中寻找智慧与答案', reversed: '过度孤立，拒绝他人帮助，逃避面对问题' } },
  { id: 'wheel-of-fortune', name: { en: 'Wheel of Fortune', zh: '命运之轮' }, arcana: 'major', keywords: { upright: '运气、转变、循环', reversed: '坏运气、停滞、命运逆转' }, meanings: { upright: '命运转折，周期变化，把握机遇', reversed: '运势低迷，抗拒变化，感到命运不公' } },
  { id: 'justice', name: { en: 'Justice', zh: '正义' }, arcana: 'major', keywords: { upright: '公正、因果、真相', reversed: '不公、不诚实、法律问题' }, meanings: { upright: '公平与真相，因果报应，理性决策', reversed: '不公正待遇，逃避责任，偏见影响判断' } },
  { id: 'hanged-man', name: { en: 'The Hanged Man', zh: '吊人' }, arcana: 'major', keywords: { upright: '暂停、牺牲、新视角', reversed: '拒绝牺牲、停滞、拖延' }, meanings: { upright: '暂停行动，换个角度看问题，必要的牺牲', reversed: '拖延不决，拒绝改变视角，无意义的等待' } },
  { id: 'death', name: { en: 'Death', zh: '死神' }, arcana: 'major', keywords: { upright: '结束、转变、放下', reversed: '抗拒改变、停滞、抑郁' }, meanings: { upright: '旧事物的结束与新开始，深层转变', reversed: '抗拒必要的改变， cling 于过去，停滞不前' } },
  { id: 'temperance', name: { en: 'Temperance', zh: '节制' }, arcana: 'major', keywords: { upright: '平衡、耐心、调和', reversed: '失衡、过度、自我浪费' }, meanings: { upright: '寻求平衡与和谐，耐心调和对立面', reversed: '极端行为，缺乏耐心，生活失衡' } },
  { id: 'devil', name: { en: 'The Devil', zh: '恶魔' }, arcana: 'major', keywords: { upright: '束缚、欲望、物质主义', reversed: '挣脱束缚、戒瘾、面对阴影' }, meanings: { upright: '被欲望或执念束缚，意识到限制才能解脱', reversed: '开始挣脱束缚，面对阴影，打破成瘾模式' } },
  { id: 'tower', name: { en: 'The Tower', zh: '塔' }, arcana: 'major', keywords: { upright: '剧变、启示、觉醒', reversed: '害怕变化、灾难延迟、内部冲突' }, meanings: { upright: ' sudden 颠覆，旧结构崩塌带来觉醒', reversed: '恐惧改变，危机被延迟，内在冲突未解决' } },
  { id: 'star', name: { en: 'The Star', zh: '星星' }, arcana: 'major', keywords: { upright: '希望、灵感、平静', reversed: '绝望、失去信心、误导' }, meanings: { upright: '希望与疗愈，灵感涌现，保持信念', reversed: '失去希望，信心不足，被虚假承诺误导' } },
  { id: 'moon', name: { en: 'The Moon', zh: '月亮' }, arcana: 'major', keywords: { upright: '恐惧、幻觉、不确定', reversed: '直面恐惧、发现真相、摆脱幻觉' }, meanings: { upright: '潜意识与不确定性，直觉与恐惧交织', reversed: '迷雾散去，直面恐惧，逐渐看清真相' } },
  { id: 'sun', name: { en: 'The Sun', zh: '太阳' }, arcana: 'major', keywords: { upright: '快乐、成功、活力', reversed: '暂时困难、过度乐观、阴郁' }, meanings: { upright: '成功与喜悦，活力充沛，事情明朗', reversed: '暂时的阴郁，过度乐观，成功被延迟' } },
  { id: 'judgement', name: { en: 'Judgement', zh: '审判' }, arcana: 'major', keywords: { upright: '觉醒、复兴、宽恕', reversed: '自我否定、后悔、重蹈覆辙' }, meanings: { upright: '觉醒与重生，反思过去，做出重要决定', reversed: '自我批判过重，无法原谅自己，重复旧模式' } },
  { id: 'world', name: { en: 'The World', zh: '世界' }, arcana: 'major', keywords: { upright: '完成、成就、整合', reversed: '未完成、缺乏成就感、拖延' }, meanings: { upright: '周期完成，达成目标，整体和谐', reversed: '临门一脚未完成，缺乏closure，拖延收尾' } },
]

/** 小阿尔卡纳牌面中文名映射 */
const RANK_ZH: Record<string, string> = {
  ace: '王牌', '2': '二', '3': '三', '4': '四', '5': '五',
  '6': '六', '7': '七', '8': '八', '9': '九', '10': '十',
  page: '侍从', knight: '骑士', queen: '王后', king: '国王',
}

const SUIT_ZH: Record<string, string> = {
  wands: '权杖', cups: '圣杯', swords: '宝剑', pentacles: '钱币',
}

const SUIT_EN: Record<string, string> = {
  wands: 'Wands', cups: 'Cups', swords: 'Swords', pentacles: 'Pentacles',
}

/** 小阿尔卡纳各花色主题关键词 */
const SUIT_THEMES: Record<string, { upright: string; reversed: string; meaningU: string; meaningR: string }> = {
  wands: {
    upright: '热情、行动、创造',
    reversed: '拖延、缺乏动力、冲动',
    meaningU: '与热情、行动力和创造力相关的能量',
    meaningR: '行动力受阻，热情消退或方向偏差',
  },
  cups: {
    upright: '情感、直觉、关系',
    reversed: '情感压抑、关系失衡',
    meaningU: '与情感、直觉和人际关系相关的能量',
    meaningR: '情感被压抑，关系中出现隔阂或不满足',
  },
  swords: {
    upright: '思维、决策、沟通',
    reversed: '混乱、冲突、误解',
    meaningU: '与思维、决策和沟通相关的能量',
    meaningR: '思维混乱，沟通不畅，内心冲突加剧',
  },
  pentacles: {
    upright: '物质、工作、稳定',
    reversed: '财务不稳、缺乏规划',
    meaningU: '与物质、工作和现实稳定相关的能量',
    meaningR: '财务或工作方面的不稳定，缺乏长远规划',
  },
}

const MINOR_RANKS = ['ace', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'page', 'knight', 'queen', 'king'] as const
const SUITS = ['wands', 'cups', 'swords', 'pentacles'] as const

/** 生成小阿尔卡纳牌 */
function buildMinorCards(): TarotCard[] {
  const cards: TarotCard[] = []
  for (const suit of SUITS) {
    MINOR_RANKS.forEach((rank) => {
      const theme = SUIT_THEMES[suit]
      cards.push({
        id: `${suit}-${rank}`,
        name: {
          en: `${SUIT_EN[suit]} ${rank === 'ace' ? 'Ace' : rank.charAt(0).toUpperCase() + rank.slice(1)}`,
          zh: `${SUIT_ZH[suit]}${RANK_ZH[rank]}`,
        },
        arcana: 'minor',
        suit,
        rank,
        keywords: {
          upright: `${theme.upright}、${rank === 'ace' ? '新开始' : rank === '10' ? '完成' : ['page', 'knight', 'queen', 'king'].includes(rank) ? '人物能量' : '发展'}`,
          reversed: `${theme.reversed}、${rank === 'ace' ? '机会流失' : '阻碍'}`,
        },
        meanings: {
          upright: `${SUIT_ZH[suit]}${RANK_ZH[rank]}：${theme.meaningU}，在此阶段呈现积极面向`,
          reversed: `${SUIT_ZH[suit]}${RANK_ZH[rank]}（逆位）：${theme.meaningR}，需要调整应对方式`,
        },
        image: getCardImageUrl(`${suit}-${rank}`, suit, rank),
      })
    })
  }
  return cards
}

/** 生成大阿尔卡纳牌（含图片 URL） */
function buildMajorCards(): TarotCard[] {
  return MAJOR_DATA.map((card) => ({
    ...card,
    image: getCardImageUrl(card.id),
  }))
}

/** 完整 78 张塔罗牌 */
export const TAROT_CARDS: TarotCard[] = [...buildMajorCards(), ...buildMinorCards()]

/** 按 id 查找牌 */
export function getCardById(id: string): TarotCard | undefined {
  return TAROT_CARDS.find((c) => c.id === id)
}

export default TAROT_CARDS
