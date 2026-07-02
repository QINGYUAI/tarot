<script setup lang="ts">
import { computed } from 'vue'
import { NSelect } from 'naive-ui'
import type { AIModel } from '@/types/tarot'

const props = defineProps<{
  models: AIModel[]
  modelValue: string
  disabled?: boolean
}>()

const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

const options = computed(() =>
  props.models.map((m) => ({ label: m.name, value: m.id }))
)
</script>

<template>
  <div class="ai-model-select">
    <label class="ai-model-select__label">AI 模型</label>
    <NSelect
      :value="modelValue"
      :options="options"
      :disabled="disabled"
      size="medium"
      @update:value="emit('update:modelValue', $event)"
    />
  </div>
</template>

<style scoped lang="scss">
.ai-model-select {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;

  &__label {
    font-size: 0.88rem;
    color: var(--color-text-muted);
    white-space: nowrap;
  }

  :deep(.n-select) {
    flex: 1;
    min-width: 140px;
  }
}
</style>
