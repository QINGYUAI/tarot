<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { NButton, NInput, NCard, NTag, NRadioGroup, NRadioButton, useMessage } from 'naive-ui'
import { useTarotStore } from '@/stores/tarot'
import SpreadSelector from '@/components/SpreadSelector.vue'
import PageHeader from '@/components/PageHeader.vue'
import AnimatedSection from '@/components/AnimatedSection.vue'
import scenesData from '@/data/scenes.json'
import type { Scene } from '@/types/tarot'

import type { DrawMode } from '@/types/tarot'

const router = useRouter()
const route = useRoute()
const message = useMessage()
const tarotStore = useTarotStore()
const scenes = scenesData as Scene[]

const selectedSpreadId = ref<string | null>(tarotStore.selectedSpread?.id ?? null)
const questionInput = ref(tarotStore.question)
const drawMode = ref<DrawMode>(tarotStore.drawMode)

const currentScene = computed(() =>
  scenes.find((s) => s.id === (tarotStore.sceneId ?? route.query.scene))
)

onMounted(() => {
  const sceneId = route.query.scene as string
  if (sceneId && !tarotStore.sceneId) {
    const scene = scenes.find((s) => s.id === sceneId)
    if (scene) tarotStore.setScene(scene.id, scene.name)
  }
})

function fillQuestion(q: string) {
  questionInput.value = q
  tarotStore.setQuestion(q)
}

function handleSpreadSelect(id: string) {
  selectedSpreadId.value = id
  tarotStore.selectSpread(id)
}

function handleDrawModeChange(mode: DrawMode) {
  drawMode.value = mode
  tarotStore.setDrawMode(mode)
}

function handleNext() {
  const q = questionInput.value.trim()
  if (!q) {
    message.warning('请先输入或选择一个问题')
    return
  }
  if (!selectedSpreadId.value) {
    message.warning('请选择一个牌阵')
    return
  }
  tarotStore.setQuestion(q)
  tarotStore.setDrawMode(drawMode.value)
  router.push({ name: drawMode.value === 'physical' ? 'manual' : 'draw' })
}
</script>

<template>
  <div class="spread-view page">
    <PageHeader title="选择牌阵" @back="router.push('/')" />

    <AnimatedSection v-if="currentScene">
      <NCard size="small" class="preset-section">
        <template #header>
          <span>{{ currentScene.icon }} {{ currentScene.name }} — 推荐问题</span>
        </template>
        <div class="preset-list">
          <NTag
            v-for="q in currentScene.questions"
            :key="q"
            :type="questionInput === q ? 'warning' : 'default'"
            class="preset-tag"
            round
            clickable
            @click="fillQuestion(q)"
          >
            {{ q }}
          </NTag>
        </div>
      </NCard>
    </AnimatedSection>

    <AnimatedSection :delay="80">
      <div class="question-section">
        <label class="question-section__label">你的问题</label>
        <NInput
          v-model:value="questionInput"
          type="textarea"
          placeholder="描述你想占卜的问题…"
          :rows="2"
        />
      </div>
    </AnimatedSection>

    <AnimatedSection :delay="160">
      <section class="spread-section">
        <h2 class="section-title">选择牌阵</h2>
        <SpreadSelector
          :spreads="tarotStore.spreads"
          :selected-id="selectedSpreadId"
          @select="handleSpreadSelect"
        />
      </section>
    </AnimatedSection>

    <AnimatedSection :delay="200">
      <section class="draw-mode-section">
        <h2 class="section-title">抽牌方式</h2>
        <NRadioGroup v-model:value="drawMode" @update:value="handleDrawModeChange">
          <NRadioButton value="system">🎴 系统在线抽牌</NRadioButton>
          <NRadioButton value="physical">🃏 录入现实牌型</NRadioButton>
        </NRadioGroup>
        <p class="draw-mode-section__hint">
          <template v-if="drawMode === 'system'">在应用中洗牌、凭直觉点击抽牌</template>
          <template v-else>已在现实中抽好牌？手动选择每张牌及正/逆位</template>
        </p>
      </section>
    </AnimatedSection>

    <AnimatedSection :delay="240">
      <div class="spread-view__actions">
        <NButton
          type="primary"
          size="large"
          :disabled="!selectedSpreadId || !questionInput.trim()"
          @click="handleNext"
        >
          {{ drawMode === 'physical' ? '录入牌型 →' : '开始抽牌 →' }}
        </NButton>
      </div>
    </AnimatedSection>
  </div>
</template>

<style scoped lang="scss">
.preset-section {
  margin-bottom: 1.25rem;
}

.preset-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.preset-tag {
  cursor: pointer;
  padding: 6px 12px !important;
  height: auto !important;
  white-space: normal !important;
  line-height: 1.5 !important;
}

.question-section {
  margin-bottom: 1.25rem;

  &__label {
    display: block;
    font-size: 0.88rem;
    color: var(--color-text-muted);
    margin-bottom: 0.5rem;
  }
}

.spread-section { margin-bottom: 1.25rem; }

.draw-mode-section {
  margin-bottom: 1.5rem;

  &__hint {
    margin: 0.65rem 0 0;
    font-size: 0.82rem;
    color: var(--color-text-muted);
  }
}

.spread-view__actions {
  display: flex;
  justify-content: center;
  padding-bottom: 1.5rem;
}
</style>
