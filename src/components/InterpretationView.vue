<script setup lang="ts">
import { NCard, NSpin, NTag, NList, NListItem, NThing } from 'naive-ui'
import type { InterpretationResult } from '@/types/tarot'
import AnimatedSection from './AnimatedSection.vue'

defineProps<{
  result: InterpretationResult | null
  streamingText?: string
  loading?: boolean
}>()
</script>

<template>
  <div class="interpretation-view">
    <!-- 加载中 -->
    <div v-if="loading && !streamingText" class="interpretation-view__loading">
      <NSpin size="large" />
      <p>AI 正在解读牌面，请稍候…</p>
    </div>

    <!-- 流式输出 -->
    <NCard v-if="streamingText && !result" class="interpretation-view__streaming" size="small">
      <pre class="interpretation-view__stream-text">{{ streamingText }}<span class="cursor">|</span></pre>
    </NCard>

    <!-- 结构化结果 -->
    <template v-if="result">
      <AnimatedSection :delay="0">
        <NCard title="整体概述" size="small" class="interpretation-card">
          <p class="interpretation-text">{{ result.overview }}</p>
        </NCard>
      </AnimatedSection>

      <AnimatedSection
        v-for="(pos, idx) in result.positions"
        :key="pos.position"
        :delay="100 + idx * 80"
      >
        <NCard size="small" class="interpretation-card">
          <template #header>
            <NTag type="warning" size="small" round :bordered="false">
              位置 {{ pos.position }}
            </NTag>
          </template>
          <p class="interpretation-text">{{ pos.text }}</p>
        </NCard>
      </AnimatedSection>

      <AnimatedSection :delay="300">
        <NCard title="行动建议" size="small" class="interpretation-card">
          <NList>
            <NListItem v-for="(s, i) in result.suggestions" :key="i">
              <NThing>
                <template #avatar>
                  <span class="list-icon list-icon--gold">✦</span>
                </template>
                {{ s }}
              </NThing>
            </NListItem>
          </NList>
        </NCard>
      </AnimatedSection>

      <AnimatedSection :delay="400">
        <NCard title="注意事项" size="small" class="interpretation-card interpretation-card--caution">
          <NList>
            <NListItem v-for="(c, i) in result.cautions" :key="i">
              <NThing>
                <template #avatar>
                  <span class="list-icon list-icon--warn">⚠</span>
                </template>
                {{ c }}
              </NThing>
            </NListItem>
          </NList>
        </NCard>
      </AnimatedSection>
    </template>
  </div>
</template>

<style scoped lang="scss">
.interpretation-view {
  display: flex;
  flex-direction: column;
  gap: 1rem;

  &__loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    padding: 3rem;
    color: var(--color-text-muted);
  }

  &__stream-text {
    white-space: pre-wrap;
    word-break: break-word;
    font-family: inherit;
    font-size: 0.95rem;
    line-height: 1.8;
    color: var(--color-text);
    margin: 0;
  }
}

.interpretation-card {
  margin-bottom: 0.25rem;

  &--caution {
    border-color: rgba(139, 90, 43, 0.3) !important;
  }

  :deep(.n-card-header__main) {
    font-family: var(--font-serif);
    color: var(--color-gold) !important;
  }
}

.interpretation-text {
  line-height: 1.85;
  color: var(--color-text);
  margin: 0;
  font-size: 0.95rem;
}

.list-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  font-size: 0.75rem;

  &--gold { color: var(--color-gold); }
  &--warn { color: #c4956a; }
}

.cursor {
  animation: blink 0.8s step-end infinite;
  color: var(--color-gold);
}

@keyframes blink {
  50% { opacity: 0; }
}
</style>
