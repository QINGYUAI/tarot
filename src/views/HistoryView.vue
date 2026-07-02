<script setup lang="ts">
import { NButton, NCard, NEmpty, NTag, NSpace, NPopconfirm } from 'naive-ui'
import { useSettingsStore } from '@/stores/settings'
import PageHeader from '@/components/PageHeader.vue'
import AnimatedSection from '@/components/AnimatedSection.vue'

const settingsStore = useSettingsStore()

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('zh-CN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
</script>

<template>
  <div class="history-view page">
    <PageHeader title="历史记录" :show-back="false" />

    <NEmpty v-if="settingsStore.history.length === 0" description="暂无占卜记录">
      <template #extra>
        <NButton type="primary" @click="$router.push('/')">开始第一次占卜</NButton>
      </template>
    </NEmpty>

    <div v-else class="history-list">
      <AnimatedSection
        v-for="(record, i) in settingsStore.history"
        :key="record.id"
        :delay="i * 60"
      >
        <NCard size="small" class="history-item">
          <p class="history-item__question">{{ record.question }}</p>
          <NSpace :size="8" class="history-item__meta">
            <NTag size="tiny" :bordered="false">{{ record.spreadName }}</NTag>
            <NTag v-if="record.drawMode === 'physical'" size="tiny" type="warning" :bordered="false">现实牌型</NTag>
            <NTag size="tiny" type="info" :bordered="false">{{ record.model }}</NTag>
            <span class="history-item__date">{{ formatDate(record.createdAt) }}</span>
          </NSpace>
          <template #action>
            <NPopconfirm @positive-click="settingsStore.removeRecord(record.id)">
              <template #trigger>
                <NButton quaternary size="tiny">删除</NButton>
              </template>
              确定删除这条记录？
            </NPopconfirm>
          </template>
        </NCard>
      </AnimatedSection>

      <NSpace justify="center" style="margin-top: 1rem">
        <NPopconfirm @positive-click="settingsStore.clearHistory">
          <template #trigger>
            <NButton quaternary size="small">清空全部</NButton>
          </template>
          确定清空所有历史记录？
        </NPopconfirm>
      </NSpace>
    </div>
  </div>
</template>

<style scoped lang="scss">
.history-list {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}

.history-item {
  &__question {
    margin: 0 0 0.5rem;
    color: var(--color-text);
    font-size: 0.92rem;
    line-height: 1.55;
  }

  &__meta {
    align-items: center;
  }

  &__date {
    font-size: 0.75rem;
    color: var(--color-text-muted);
  }
}
</style>
