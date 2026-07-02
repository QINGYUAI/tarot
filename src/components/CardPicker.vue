<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  NModal,
  NInput,
  NTabs,
  NTabPane,
  NTag,
  NEmpty,
} from 'naive-ui'
import { TAROT_CARDS } from '@/data/tarot-cards'
import type { TarotCard } from '@/types/tarot'
import CardDisplay from './CardDisplay.vue'

const props = defineProps<{
  show: boolean
  /** 已被其他位置选中的牌 id */
  excludeIds?: string[]
}>()

const emit = defineEmits<{
  'update:show': [value: boolean]
  select: [card: TarotCard]
}>()

const search = ref('')
const activeTab = ref('all')

/** 可选牌列表（排除已选） */
const availableCards = computed(() => {
  const excluded = new Set(props.excludeIds ?? [])
  let list = TAROT_CARDS.filter((c) => !excluded.has(c.id))

  if (activeTab.value === 'major') {
    list = list.filter((c) => c.arcana === 'major')
  } else if (activeTab.value !== 'all') {
    list = list.filter((c) => c.suit === activeTab.value)
  }

  const q = search.value.trim().toLowerCase()
  if (q) {
    list = list.filter(
      (c) =>
        c.name.zh.includes(q) ||
        c.name.en.toLowerCase().includes(q) ||
        c.id.includes(q)
    )
  }
  return list
})

function handleSelect(card: TarotCard) {
  emit('select', card)
  emit('update:show', false)
  search.value = ''
}

function handleClose() {
  emit('update:show', false)
  search.value = ''
}
</script>

<template>
  <NModal
    :show="show"
    preset="card"
    title="选择塔罗牌"
    class="card-picker-modal"
    :style="{ width: 'min(640px, 96vw)' }"
    @update:show="emit('update:show', $event)"
    @close="handleClose"
  >
    <NInput
      v-model:value="search"
      placeholder="搜索牌名，如：愚者、女祭司、权杖…"
      clearable
      class="card-picker__search"
    />

    <NTabs v-model:value="activeTab" type="segment" size="small" class="card-picker__tabs">
      <NTabPane name="all" tab="全部" />
      <NTabPane name="major" tab="大阿尔卡纳" />
      <NTabPane name="wands" tab="权杖" />
      <NTabPane name="cups" tab="圣杯" />
      <NTabPane name="swords" tab="宝剑" />
      <NTabPane name="pentacles" tab="钱币" />
    </NTabs>

    <NEmpty v-if="availableCards.length === 0" description="没有匹配的牌" />

    <div v-else class="card-picker__grid">
      <div
        v-for="card in availableCards"
        :key="card.id"
        class="card-picker__item"
        @click="handleSelect(card)"
      >
        <CardDisplay :card="card" flipped size="sm" />
        <span class="card-picker__name">{{ card.name.zh }}</span>
      </div>
    </div>

    <template #footer>
      <NTag :bordered="false" size="small" type="info">
        共 {{ availableCards.length }} 张可选
      </NTag>
    </template>
  </NModal>
</template>

<style scoped lang="scss">
.card-picker__search {
  margin-bottom: 0.75rem;
}

.card-picker__tabs {
  margin-bottom: 1rem;
}

.card-picker__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(90px, 1fr));
  gap: 0.75rem;
  max-height: 50vh;
  overflow-y: auto;
  padding: 0.25rem;
}

.card-picker__item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.35rem;
  cursor: pointer;
  padding: 0.35rem;
  border-radius: 10px;
  transition: background 0.2s, transform 0.2s;

  &:hover {
    background: rgba(212, 175, 55, 0.08);
    transform: scale(1.03);
  }
}

.card-picker__name {
  font-size: 0.72rem;
  color: var(--color-text-muted);
  text-align: center;
  line-height: 1.3;
}
</style>
