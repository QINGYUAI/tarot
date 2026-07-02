<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { NButton, NSpin } from 'naive-ui'
import CardDisplay from './CardDisplay.vue'

const props = defineProps<{ duration?: number }>()
const emit = defineEmits<{ complete: []; skip: [] }>()

let timer: ReturnType<typeof setTimeout> | null = null

onMounted(() => {
  timer = setTimeout(() => emit('complete'), props.duration ?? 5000)
})

onUnmounted(() => {
  if (timer) clearTimeout(timer)
})

function handleSkip() {
  if (timer) clearTimeout(timer)
  emit('skip')
}
</script>

<template>
  <div class="card-deck">
    <NSpin size="large">
      <div class="card-deck__animation">
        <CardDisplay
          v-for="i in 5"
          :key="i"
          show-back
          size="lg"
          :class="`card-deck__card card-deck__card--${i}`"
        />
      </div>
    </NSpin>
    <p class="card-deck__hint">正在洗牌，让能量流动…</p>
    <NButton quaternary @click="handleSkip">直接开始</NButton>
  </div>
</template>

<style scoped lang="scss">
.card-deck {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  padding: 2rem;

  &__animation {
    position: relative;
    width: 200px;
    height: 280px;
  }

  &__card {
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);

    @for $i from 1 through 5 {
      &--#{$i} {
        z-index: $i;
        animation: shuffle#{$i} 0.8s ease-in-out infinite alternate;
      }
    }
  }

  &__hint {
    color: var(--color-text-muted);
    font-size: 0.95rem;
    animation: textPulse 2s ease-in-out infinite;
  }
}

@for $i from 1 through 5 {
  @keyframes shuffle#{$i} {
    0% { transform: translateX(-50%) rotate(#{-6 + $i * 2}deg) translateY(0); }
    100% { transform: translateX(#{-50 + ($i - 3) * 10}%) rotate(#{4 - $i}deg) translateY(#{-5 + $i}px); }
  }
}

@keyframes textPulse {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
}
</style>
