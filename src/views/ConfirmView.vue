<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { NButton, NCard, NTag, NSpace } from 'naive-ui'
import { useTarotStore } from '@/stores/tarot'
import { useSettingsStore } from '@/stores/settings'
import CardDisplay from '@/components/CardDisplay.vue'
import AIModelSelect from '@/components/AIModelSelect.vue'
import PageHeader from '@/components/PageHeader.vue'
import AnimatedSection from '@/components/AnimatedSection.vue'

const router = useRouter()
const tarotStore = useTarotStore()
const settingsStore = useSettingsStore()

onMounted(() => {
  if (!tarotStore.isDrawComplete || !tarotStore.selectedSpread) {
    router.replace('/')
  }
})

const sortedCards = computed(() =>
  [...tarotStore.drawnCards].sort((a, b) => a.position - b.position)
)

function getPositionName(positionIndex: number) {
  return tarotStore.selectedSpread?.positions.find((p) => p.index === positionIndex)?.name
}

function handleConfirm() {
  tarotStore.clearInterpretation()
  router.push({ name: 'result' })
}

function handleRedraw() {
  tarotStore.drawnCards = []
  if (tarotStore.drawMode === 'physical') {
    router.push({ name: 'manual' })
  } else {
    tarotStore.shuffleDeck()
    router.push({ name: 'draw' })
  }
}
</script>

<template>
  <div class="confirm-view page">
    <PageHeader
      title="确认牌阵"
      :subtitle="tarotStore.question"
      @back="router.push('/draw')"
    />

    <AnimatedSection>
      <div class="confirm-view__spread-name">
        <NTag type="info" round>{{ tarotStore.selectedSpread?.name.zh }}</NTag>
        <NTag size="small" :bordered="false">{{ tarotStore.drawModeLabel }}</NTag>
      </div>
    </AnimatedSection>

    <div class="confirm-view__cards">
      <AnimatedSection
        v-for="(dc, i) in sortedCards"
        :key="`${dc.card.id}-${dc.position}`"
        :delay="i * 100"
      >
        <div class="confirm-view__card-item">
          <CardDisplay
            :card="dc.card"
            :is-reversed="dc.isReversed"
            flipped
            size="lg"
            :position-name="getPositionName(dc.position)"
          />
          <p class="confirm-view__keywords">
            {{ dc.isReversed ? dc.card.keywords.reversed : dc.card.keywords.upright }}
          </p>
        </div>
      </AnimatedSection>
    </div>

    <AnimatedSection :delay="300">
      <NCard size="small" class="confirm-view__model">
        <AIModelSelect
          v-model="settingsStore.selectedModel"
          :models="settingsStore.enabledModels"
        />
      </NCard>
    </AnimatedSection>

    <AnimatedSection :delay="400">
      <NSpace justify="center" :size="12" class="confirm-view__actions">
        <NButton quaternary @click="handleRedraw">
          {{ tarotStore.drawMode === 'physical' ? '重新录入' : '重新抽牌' }}
        </NButton>
        <NButton type="primary" size="large" @click="handleConfirm">
          生成 AI 解读 ✨
        </NButton>
      </NSpace>
    </AnimatedSection>
  </div>
</template>

<style scoped lang="scss">
.confirm-view {
  &__spread-name {
    text-align: center;
    margin-bottom: 1.5rem;
    display: flex;
    justify-content: center;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  &__cards {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 1.5rem;
    margin-bottom: 1.5rem;
  }

  &__card-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
  }

  &__keywords {
    font-size: 0.78rem;
    color: var(--color-text-muted);
    text-align: center;
    max-width: 168px;
    margin: 0;
    line-height: 1.45;
  }

  &__model {
    max-width: 360px;
    margin: 0 auto 1.25rem;
  }

  &__actions {
    padding-bottom: 1.5rem;
  }
}
</style>
