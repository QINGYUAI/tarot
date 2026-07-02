import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { DrawnCard, Spread, InterpretationResult, DrawMode } from '@/types/tarot'
import spreadsData from '@/data/spreads.json'
import { TAROT_CARDS, getCardById } from '@/data/tarot-cards'

/** 占卜流程核心状态 */
export const useTarotStore = defineStore('tarot', () => {
  const question = ref('')
  const sceneId = ref<string | null>(null)
  const sceneName = ref<string | null>(null)
  const selectedSpread = ref<Spread | null>(null)
  const drawnCards = ref<DrawnCard[]>([])
  const shuffledDeck = ref<typeof TAROT_CARDS>([])
  const isShuffling = ref(false)
  const shuffleSkipped = ref(false)
  const interpretation = ref<InterpretationResult | null>(null)
  const isInterpreting = ref(false)
  /** 抽牌方式：system=系统抽牌，physical=录入现实牌型 */
  const drawMode = ref<DrawMode>('system')

  const spreads = spreadsData as Spread[]

  const requiredCount = computed(() => selectedSpread.value?.cardCount ?? 0)
  const isDrawComplete = computed(() => drawnCards.value.length >= requiredCount.value)

  const drawModeLabel = computed(() =>
    drawMode.value === 'physical' ? '现实牌型' : '系统抽牌'
  )

  /** 重置占卜会话 */
  function resetSession() {
    question.value = ''
    sceneId.value = null
    sceneName.value = null
    selectedSpread.value = null
    drawnCards.value = []
    shuffledDeck.value = []
    isShuffling.value = false
    shuffleSkipped.value = false
    interpretation.value = null
    isInterpreting.value = false
    drawMode.value = 'system'
  }

  function setScene(id: string, name: string, q?: string) {
    sceneId.value = id
    sceneName.value = name
    if (q) question.value = q
  }

  function setQuestion(q: string) {
    question.value = q
  }

  function setDrawMode(mode: DrawMode) {
    drawMode.value = mode
    drawnCards.value = []
    interpretation.value = null
  }

  function selectSpread(spreadId: string) {
    selectedSpread.value = spreads.find((s) => s.id === spreadId) ?? null
    drawnCards.value = []
    interpretation.value = null
  }

  function clearDrawnCards() {
    drawnCards.value = []
    interpretation.value = null
  }

  /** Fisher-Yates 洗牌 */
  function shuffleDeck() {
    const deck = [...TAROT_CARDS]
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
        ;[deck[i], deck[j]] = [deck[j], deck[i]]
    }
    shuffledDeck.value = deck
  }

  /** 系统抽牌：从牌堆随机抽取 */
  function drawCard(deckIndex: number) {
    if (!selectedSpread.value || isDrawComplete.value) return
    const card = shuffledDeck.value[deckIndex]
    if (!card) return

    const positions = selectedSpread.value.positions
    const nextPosition = positions[drawnCards.value.length]
    if (!nextPosition) return

    const isReversed = Math.random() < 0.5

    drawnCards.value.push({
      card,
      position: nextPosition.index,
      isReversed,
    })
  }

  /** 录入现实牌型：手动指定位置、牌面、正逆位 */
  function setPhysicalCard(positionIndex: number, cardId: string, isReversed: boolean) {
    const card = getCardById(cardId)
    if (!card || !selectedSpread.value) return

    const validPosition = selectedSpread.value.positions.some((p) => p.index === positionIndex)
    if (!validPosition) return

    // 同一张牌不能重复出现在牌阵中
    drawnCards.value = drawnCards.value.filter(
      (d) => d.position !== positionIndex && d.card.id !== cardId
    )

    drawnCards.value.push({ card, position: positionIndex, isReversed })
  }

  /** 清除某位置的选牌 */
  function removePhysicalCard(positionIndex: number) {
    drawnCards.value = drawnCards.value.filter((d) => d.position !== positionIndex)
  }

  function clearInterpretation() {
    interpretation.value = null
  }

  return {
    question,
    sceneId,
    sceneName,
    selectedSpread,
    drawnCards,
    shuffledDeck,
    isShuffling,
    shuffleSkipped,
    interpretation,
    isInterpreting,
    drawMode,
    drawModeLabel,
    spreads,
    requiredCount,
    isDrawComplete,
    resetSession,
    setScene,
    setQuestion,
    setDrawMode,
    selectSpread,
    clearDrawnCards,
    shuffleDeck,
    drawCard,
    setPhysicalCard,
    removePhysicalCard,
    clearInterpretation,
  }
})
