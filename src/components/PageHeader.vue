<script setup lang="ts">
import { NButton } from 'naive-ui'
import { ArrowBackOutline } from '@vicons/ionicons5'

defineProps<{
  title: string
  subtitle?: string
  showBack?: boolean
}>()

defineEmits<{ back: [] }>()
</script>

<template>
  <header class="page-header">
    <NButton
      v-if="showBack !== false"
      quaternary
      size="small"
      class="page-header__back"
      @click="$emit('back')"
    >
      <template #icon>
        <ArrowBackOutline />
      </template>
      返回
    </NButton>
    <h1 class="page-header__title">{{ title }}</h1>
    <p v-if="subtitle" class="page-header__subtitle">{{ subtitle }}</p>
  </header>
</template>

<style scoped lang="scss">
.page-header {
  margin-bottom: 1.5rem;

  &__back {
    margin-bottom: 0.25rem;
    color: var(--color-text-muted) !important;

    &:hover {
      color: var(--color-gold) !important;
    }
  }

  &__title {
    font-family: var(--font-serif);
    font-size: 1.6rem;
    color: var(--color-gold);
    margin: 0.25rem 0;
    letter-spacing: 0.02em;
  }

  &__subtitle {
    font-size: 0.88rem;
    color: var(--color-text-muted);
    line-height: 1.6;
    margin: 0;
  }
}
</style>
