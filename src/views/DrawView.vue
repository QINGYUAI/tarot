<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { NCard, NProgress, NTag } from 'naive-ui'
import { useTarotStore } from '@/stores/tarot'
import CardDeck from '@/components/CardDeck.vue'
import CardDisplay from '@/components/CardDisplay.vue'
import PageHeader from '@/components/PageHeader.vue'
import AnimatedSection from '@/components/AnimatedSection.vue'

const router = useRouter()
const tarotStore = useTarotStore()

const phase = ref<'shuffle' | 'draw'>('shuffle')
const flippedIndices = ref<Set<number>>(new Set())

const drawnCount = computed(() => tarotStore.drawnCards.length)
const requiredCount = computed(() => tarotStore.requiredCount)
const progressPercent = computed(() =>
  requiredCount.value ? (drawnCount.value / requiredCount.value) * 100 : 0
)

const availableIndices = computed(() => {
  const drawnIds = new Set(tarotStore.drawnCards.map((d) => d.card.id))
  return tarotStore.shuffledDeck
    .map((card, idx) => ({ card, idx }))
    .filter(({ card }) => !drawnIds.has(card.id))
})

onMounted(() => {
  if (!tarotStore.selectedSpread || !tarotStore.question) {
    router.replace('/spread')
    return
  }
  tarotStore.shuffleDeck()
})

function onShuffleComplete() { phase.value = 'draw' }
function onShuffleSkip() {
  tarotStore.shuffleSkipped = true
  phase.value = 'draw'
}

function handleDraw(deckIndex: number) {
  if (tarotStore.isDrawComplete || flippedIndices.value.has(deckIndex)) return
  flippedIndices.value.add(deckIndex)
  tarotStore.drawCard(deckIndex)
  if (tarotStore.isDrawComplete) {
    setTimeout(() => router.push({ name: 'confirm' }), 900)
  }
}

function getPositionName(positionIndex: number) {
  return tarotStore.selectedSpread?.positions.find((p) => p.index === positionIndex)?.name
}
</script>

<template>
  <div class="draw-view page">
    <PageHeader
      title="抽牌"
      :subtitle="tarotStore.question"
      @back="router.push('/spread')"
    />

    <CardDeck
      v-if="phase === 'shuffle'"
      @complete="onShuffleComplete"
      @skip="onShuffleSkip"
    />

    <template v-if="phase === 'draw'">
      <AnimatedSection>
        <div class="draw-progress">
          <NTag type="warning" round :bordered="false">
            已抽 {{ drawnCount }} / {{ requiredCount }} 张
          </NTag>
          <NProgress
            type="line"
            :percentage="progressPercent"
            :show-indicator="false"
            :height="4"
            :border-radius="4"
            class="draw-progress__bar"
          />
        </div>
      </AnimatedSection>

      <AnimatedSection v-if="drawnCount > 0" :delay="80">
        <NCard size="small" class="drawn-cards">
          <div class="drawn-cards__grid">
            <div
              v-for="(dc, i) in tarotStore.drawnCards"
              :key="`${dc.card.id}-${dc.position}`"
              class="drawn-cards__item"
              :style="{ animationDelay: `${i * 100}ms` }"
            >
              <CardDisplay
                :card="dc.card"
                :is-reversed="dc.isReversed"
                flipped
                size="md"
                :position-name="getPositionName(dc.position)"
              />
            </div>
          </div>
        </NCard>
      </AnimatedSection>

      <AnimatedSection v-if="!tarotStore.isDrawComplete" :delay="160">
        <NCard size="small" class="deck-grid">
          <p class="deck-grid__hint">✨ 凭直觉点击一张牌</p>
          <div class="deck-grid__cards">
            <CardDisplay
              v-for="{ idx } in availableIndices.slice(0, 12)"
              :key="idx"
              show-back
              clickable
              size="sm"
              :flipped="flippedIndices.has(idx)"
              @click="handleDraw(idx)"
            />
          </div>
        </NCard>
      </AnimatedSection>
    </template>
  </div>
</template>

<style scoped lang="scss">
.draw-progress {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;

  &__bar {
    width: 100%;
    max-width: 280px;
  }
}

.drawn-cards {
  margin-bottom: 1.5rem;

  &__grid {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 1rem;
  }

  &__item {
    animation: cardReveal 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) both;
  }
}

.deck-grid {
  &__hint {
    text-align: center;
    color: var(--color-text-muted);
    margin-bottom: 1rem;
    font-size: 0.9rem;
  }

  &__cards {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 0.5rem;
  }
}

@keyframes cardReveal {
  from { opacity: 0; transform: scale(0.5) rotateY(90deg); }
  to { opacity: 1; transform: scale(1) rotateY(0); }
}
</style>
