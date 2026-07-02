<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  NButton,
  NCard,
  NTag,
  NSpace,
  NSwitch,
  NSteps,
  NStep,
  useMessage,
} from 'naive-ui'
import { useTarotStore } from '@/stores/tarot'
import CardDisplay from '@/components/CardDisplay.vue'
import CardPicker from '@/components/CardPicker.vue'
import PageHeader from '@/components/PageHeader.vue'
import AnimatedSection from '@/components/AnimatedSection.vue'
import type { TarotCard } from '@/types/tarot'

const router = useRouter()
const message = useMessage()
const tarotStore = useTarotStore()

const pickerVisible = ref(false)
const activePosition = ref<number | null>(null)

onMounted(() => {
  if (!tarotStore.selectedSpread || !tarotStore.question) {
    router.replace('/spread')
    return
  }
  if (tarotStore.drawMode !== 'physical') {
    tarotStore.setDrawMode('physical')
  }
  tarotStore.clearDrawnCards()
})

const positions = computed(() => tarotStore.selectedSpread?.positions ?? [])

const filledCount = computed(() => tarotStore.drawnCards.length)

const usedCardIds = computed(() => tarotStore.drawnCards.map((d) => d.card.id))

/** 选牌弹窗排除列表（允许更换当前位置已选的牌） */
const pickerExcludeIds = computed(() => {
  if (activePosition.value === null) return usedCardIds.value
  const currentId = getCardAtPosition(activePosition.value)?.card.id
  return usedCardIds.value.filter((id) => id !== currentId)
})

const currentStep = computed(() => filledCount.value)

function getCardAtPosition(positionIndex: number) {
  return tarotStore.drawnCards.find((d) => d.position === positionIndex)
}

function openPicker(positionIndex: number) {
  activePosition.value = positionIndex
  pickerVisible.value = true
}

function handleCardSelect(card: TarotCard) {
  if (activePosition.value === null) return
  tarotStore.setPhysicalCard(activePosition.value, card.id, false)
  activePosition.value = null
}

function toggleReversed(positionIndex: number, value: boolean) {
  const existing = getCardAtPosition(positionIndex)
  if (existing) {
    tarotStore.setPhysicalCard(positionIndex, existing.card.id, value)
  }
}

function clearPosition(positionIndex: number) {
  tarotStore.removePhysicalCard(positionIndex)
}

function handleConfirm() {
  if (!tarotStore.isDrawComplete) {
    message.warning(`请录入全部 ${tarotStore.requiredCount} 张牌`)
    return
  }
  router.push({ name: 'confirm' })
}
</script>

<template>
  <div class="manual-view page">
    <PageHeader
      title="录入现实牌型"
      :subtitle="tarotStore.question"
      @back="router.push('/spread')"
    />

    <AnimatedSection>
      <NCard size="small" class="manual-view__tip">
        <p>请对照你<strong>现实中已抽出的牌</strong>，依次选择每张牌及正/逆位。</p>
        <NTag type="info" size="small" round :bordered="false">
          {{ tarotStore.selectedSpread?.name.zh }} · {{ filledCount }}/{{ tarotStore.requiredCount }}
        </NTag>
      </NCard>
    </AnimatedSection>

    <NSteps :current="currentStep" size="small" class="manual-view__steps">
      <NStep
        v-for="pos in positions"
        :key="pos.index"
        :title="pos.name"
        :description="getCardAtPosition(pos.index) ? getCardAtPosition(pos.index)!.card.name.zh : '待选'"
      />
    </NSteps>

    <div class="manual-view__slots">
      <AnimatedSection
        v-for="(pos, i) in positions"
        :key="pos.index"
        :delay="i * 60"
      >
        <NCard size="small" class="slot-card" :class="{ 'slot-card--filled': !!getCardAtPosition(pos.index) }">
          <div class="slot-card__header">
            <div>
              <NTag type="warning" size="tiny" round :bordered="false">位置 {{ pos.index }}</NTag>
              <h3 class="slot-card__title">{{ pos.name }}</h3>
              <p class="slot-card__desc">{{ pos.description }}</p>
            </div>
          </div>

          <div class="slot-card__body">
            <div v-if="getCardAtPosition(pos.index)" class="slot-card__selected">
              <CardDisplay
                :card="getCardAtPosition(pos.index)!.card"
                :is-reversed="getCardAtPosition(pos.index)!.isReversed"
                flipped
                size="md"
              />
              <div class="slot-card__controls">
                <div class="slot-card__switch">
                  <span>逆位</span>
                  <NSwitch
                    :value="getCardAtPosition(pos.index)!.isReversed"
                    @update:value="toggleReversed(pos.index, $event)"
                  />
                </div>
                <NSpace :size="8">
                  <NButton size="tiny" quaternary @click="openPicker(pos.index)">更换</NButton>
                  <NButton size="tiny" quaternary @click="clearPosition(pos.index)">清除</NButton>
                </NSpace>
              </div>
            </div>

            <div v-else class="slot-card__empty" @click="openPicker(pos.index)">
              <div class="slot-card__placeholder">
                <span>+</span>
                <p>点击选择牌</p>
              </div>
            </div>
          </div>
        </NCard>
      </AnimatedSection>
    </div>

    <AnimatedSection>
      <NSpace justify="center" class="manual-view__actions">
        <NButton quaternary @click="router.push('/spread')">返回修改</NButton>
        <NButton
          type="primary"
          size="large"
          :disabled="!tarotStore.isDrawComplete"
          @click="handleConfirm"
        >
          确认牌阵 →
        </NButton>
      </NSpace>
    </AnimatedSection>

    <CardPicker
      v-model:show="pickerVisible"
      :exclude-ids="pickerExcludeIds"
      @select="handleCardSelect"
    />
  </div>
</template>

<style scoped lang="scss">
.manual-view {
  &__tip {
    margin-bottom: 1.25rem;

    p {
      margin: 0 0 0.5rem;
      font-size: 0.9rem;
      line-height: 1.6;
      color: var(--color-text-muted);

      strong { color: var(--color-gold); }
    }
  }

  &__steps {
    margin-bottom: 1.5rem;
    padding: 0 0.25rem;
  }

  &__slots {
    display: flex;
    flex-direction: column;
    gap: 0.85rem;
    margin-bottom: 1.5rem;
  }

  &__actions {
    padding-bottom: 1.5rem;
  }
}

.slot-card {
  transition: border-color 0.25s;

  &--filled {
    border-color: rgba(212, 175, 55, 0.35) !important;
  }

  &__header { margin-bottom: 0.75rem; }

  &__title {
    font-family: var(--font-serif);
    font-size: 1rem;
    color: var(--color-text);
    margin: 0.35rem 0 0.2rem;
  }

  &__desc {
    font-size: 0.8rem;
    color: var(--color-text-muted);
    margin: 0;
  }

  &__body {
    display: flex;
    justify-content: center;
  }

  &__selected {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
  }

  &__controls {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
  }

  &__switch {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.85rem;
    color: var(--color-text-muted);
  }

  &__empty {
    width: 100%;
    cursor: pointer;
  }

  &__placeholder {
    border: 2px dashed rgba(155, 126, 217, 0.35);
    border-radius: 12px;
    padding: 2rem;
    text-align: center;
    transition: all 0.25s;

    span {
      font-size: 2rem;
      color: var(--color-accent);
      display: block;
      margin-bottom: 0.25rem;
    }

    p {
      margin: 0;
      font-size: 0.85rem;
      color: var(--color-text-muted);
    }

    &:hover {
      border-color: var(--color-gold);
      background: rgba(212, 175, 55, 0.05);
    }
  }
}
</style>
