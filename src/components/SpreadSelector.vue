<script setup lang="ts">
import { NCard, NTag } from 'naive-ui'
import type { Spread } from '@/types/tarot'
import { CheckmarkCircle } from '@vicons/ionicons5'
import { NIcon } from 'naive-ui'

defineProps<{
  spreads: Spread[]
  selectedId?: string | null
}>()

defineEmits<{ select: [id: string] }>()
</script>

<template>
  <div class="spread-selector">
    <NCard
      v-for="(spread, index) in spreads"
      :key="spread.id"
      class="spread-card"
      :class="{ 'spread-card--active': selectedId === spread.id }"
      :style="{ animationDelay: `${index * 80}ms` }"
      hoverable
      @click="$emit('select', spread.id)"
    >
      <div class="spread-card__header">
        <h3 class="spread-card__title">{{ spread.name.zh }}</h3>
        <NTag :bordered="false" size="small" type="info">{{ spread.cardCount }} 张</NTag>
        <NIcon
          v-if="selectedId === spread.id"
          :component="CheckmarkCircle"
          :size="20"
          class="spread-card__check"
        />
      </div>
      <p class="spread-card__desc">{{ spread.description }}</p>
      <ul class="spread-card__positions">
        <li v-for="pos in spread.positions" :key="pos.index">
          <strong>{{ pos.name }}</strong> — {{ pos.description }}
        </li>
      </ul>
    </NCard>
  </div>
</template>

<style scoped lang="scss">
.spread-selector {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.spread-card {
  cursor: pointer;
  animation: slideIn 0.5s ease both;
  transition: transform 0.25s ease, box-shadow 0.25s ease !important;
  border: 1px solid rgba(155, 126, 217, 0.15) !important;

  &:hover {
    transform: translateY(-3px);
  }

  &--active {
    border-color: rgba(212, 175, 55, 0.6) !important;
    box-shadow: 0 0 24px rgba(212, 175, 55, 0.12) !important;
  }

  &__header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
  }

  &__title {
    font-family: var(--font-serif);
    font-size: 1.1rem;
    color: var(--color-gold);
    margin: 0;
    flex: 1;
  }

  &__check {
    color: var(--color-gold);
  }

  &__desc {
    color: var(--color-text-muted);
    font-size: 0.88rem;
    margin: 0 0 0.65rem;
    line-height: 1.55;
  }

  &__positions {
    list-style: none;
    padding: 0;
    margin: 0;
    font-size: 0.8rem;
    color: var(--color-text-muted);

    li {
      padding: 4px 0;
      border-top: 1px solid rgba(155, 126, 217, 0.08);

      strong { color: var(--color-text); }
    }
  }
}

@keyframes slideIn {
  from { opacity: 0; transform: translateX(-16px); }
  to { opacity: 1; transform: translateX(0); }
}
</style>
