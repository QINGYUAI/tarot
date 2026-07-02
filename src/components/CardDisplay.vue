<script setup lang="ts">
import { ref } from 'vue'
import { NSpin, NTag } from 'naive-ui'
import type { TarotCard } from '@/types/tarot'

defineProps<{
  card?: TarotCard
  isReversed?: boolean
  showBack?: boolean
  size?: 'sm' | 'md' | 'lg'
  positionName?: string
  clickable?: boolean
  flipped?: boolean
}>()

defineEmits<{ click: [] }>()

const imageLoaded = ref(false)
const imageError = ref(false)

function onLoad() {
  imageLoaded.value = true
}

function onError() {
  imageError.value = true
  imageLoaded.value = true
}
</script>

<template>
  <div
    class="card-display"
    :class="[
      `card-display--${size ?? 'md'}`,
      {
        'card-display--clickable': clickable,
        'card-display--flipped': flipped || (!showBack && card),
      },
    ]"
    @click="clickable && $emit('click')"
  >
    <div class="card-display__inner">
      <div class="card-display__face card-display__back">
        <div class="card-back-pattern">
          <span class="card-back-symbol">☽</span>
          <span class="card-back-ring" />
        </div>
      </div>

      <div
        class="card-display__face card-display__front"
        :class="{ 'card-display__front--reversed': isReversed }"
      >
        <div v-if="card" class="card-display__img-wrap">
          <NSpin v-if="!imageLoaded" size="small" class="card-display__loading" />
          <img
            :src="imageError ? '/card-placeholder.svg' : card.image"
            :alt="card.name.zh"
            loading="eager"
            class="card-display__img"
            :class="{ 'card-display__img--loaded': imageLoaded }"
            @load="onLoad"
            @error="onError"
          />
        </div>
        <div v-if="card" class="card-display__info">
          <span class="card-display__name">{{ card.name.zh }}</span>
          <NTag
            :type="isReversed ? 'warning' : 'success'"
            size="tiny"
            round
            :bordered="false"
          >
            {{ isReversed ? '逆位' : '正位' }}
          </NTag>
        </div>
        <p v-if="positionName" class="card-display__position">{{ positionName }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.card-display {
  perspective: 1200px;

  &--sm { width: 84px; height: 136px; }
  &--md { width: 126px; height: 204px; }
  &--lg { width: 168px; height: 272px; }

  &--clickable {
    cursor: pointer;
    transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);

    &:hover { transform: translateY(-6px) scale(1.02); }
    &:active { transform: translateY(-2px) scale(0.98); }
  }

  &__inner {
    position: relative;
    width: 100%;
    height: 100%;
    transform-style: preserve-3d;
    transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  }

  &--flipped &__inner { transform: rotateY(180deg); }

  &__face {
    position: absolute;
    inset: 0;
    backface-visibility: hidden;
    border-radius: 10px;
    overflow: hidden;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.35);
  }

  &__back {
    background: linear-gradient(145deg, #3d2066, #2a1550);
    border: 2px solid rgba(212, 175, 55, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__front {
    transform: rotateY(180deg);
    background: var(--color-secondary);
    border: 2px solid var(--color-gold);
    display: flex;
    flex-direction: column;

    &--reversed {
      border-color: var(--color-reversed-border);
      .card-display__img { transform: rotate(180deg); }
    }
  }

  &__img-wrap {
    position: relative;
    flex: 1;
    min-height: 0;
    width: 100%;
    background: rgba(26, 16, 53, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  }

  &__loading { position: absolute; z-index: 2; }

  &__img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    opacity: 0;
    transition: opacity 0.4s ease;

    &--loaded { opacity: 1; }
  }

  &__info {
    padding: 5px 6px;
    text-align: center;
    background: rgba(26, 16, 53, 0.9);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 3px;
  }

  &__name {
    font-size: 0.68rem;
    color: var(--color-text);
    font-family: var(--font-serif);
  }

  &__position {
    font-size: 0.62rem;
    color: var(--color-gold);
    text-align: center;
    padding: 3px 4px;
    margin: 0;
    background: rgba(212, 175, 55, 0.08);
  }
}

.card-back-pattern {
  position: relative;
  width: 82%;
  height: 86%;
  border: 1px solid rgba(212, 175, 55, 0.4);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: repeating-linear-gradient(
    45deg, transparent, transparent 5px,
    rgba(212, 175, 55, 0.06) 5px, rgba(212, 175, 55, 0.06) 10px
  );
}

.card-back-symbol {
  font-size: 2rem;
  color: var(--color-gold);
  opacity: 0.8;
  animation: pulse-glow 3s ease-in-out infinite;
}

.card-back-ring {
  position: absolute;
  inset: 8px;
  border: 1px solid rgba(155, 126, 217, 0.3);
  border-radius: 4px;
}

@keyframes pulse-glow {
  0%, 100% { opacity: 0.5; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.05); }
}
</style>
