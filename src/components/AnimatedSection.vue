<script setup lang="ts">
/** 入场动画区块 — 支持延迟与方向 */
defineProps<{
  delay?: number
  direction?: 'up' | 'down' | 'left' | 'right'
}>()
</script>

<template>
  <div
    class="animated-section"
    :class="`animated-section--${direction ?? 'up'}`"
    :style="{ animationDelay: `${delay ?? 0}ms` }"
  >
    <slot />
  </div>
</template>

<style scoped lang="scss">
.animated-section {
  animation: fadeInUp 0.6s ease both;

  &--down {
    animation-name: fadeInDown;
  }
  &--left {
    animation-name: fadeInLeft;
  }
  &--right {
    animation-name: fadeInRight;
  }
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(24px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes fadeInDown {
  from { opacity: 0; transform: translateY(-24px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes fadeInLeft {
  from { opacity: 0; transform: translateX(-24px); }
  to { opacity: 1; transform: translateX(0); }
}
@keyframes fadeInRight {
  from { opacity: 0; transform: translateX(24px); }
  to { opacity: 1; transform: translateX(0); }
}
</style>
