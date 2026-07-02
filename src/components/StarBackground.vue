<!-- 全局星空背景动画 -->
<template>
  <div class="star-bg" aria-hidden="true">
    <div class="star-bg__gradient" />
    <span
      v-for="star in stars"
      :key="star.id"
      class="star-bg__star"
      :style="{
        left: `${star.x}%`,
        top: `${star.y}%`,
        animationDelay: `${star.delay}s`,
        animationDuration: `${star.duration}s`,
        width: `${star.size}px`,
        height: `${star.size}px`,
      }"
    />
  </div>
</template>

<script setup lang="ts">
/** 随机生成星点参数 */
const stars = Array.from({ length: 40 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 2 + 1,
  delay: Math.random() * 5,
  duration: Math.random() * 3 + 2,
}))
</script>

<style scoped lang="scss">
.star-bg {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;

  &__gradient {
    position: absolute;
    inset: 0;
    background:
      radial-gradient(ellipse at 15% 10%, rgba(155, 126, 217, 0.12) 0%, transparent 50%),
      radial-gradient(ellipse at 85% 90%, rgba(212, 175, 55, 0.06) 0%, transparent 45%),
      radial-gradient(ellipse at 50% 50%, rgba(45, 27, 105, 0.3) 0%, transparent 70%);
  }

  &__star {
    position: absolute;
    border-radius: 50%;
    background: #d4af37;
    opacity: 0;
    animation: twinkle ease-in-out infinite;
  }
}

@keyframes twinkle {
  0%, 100% { opacity: 0.1; transform: scale(1); }
  50% { opacity: 0.7; transform: scale(1.3); }
}
</style>
