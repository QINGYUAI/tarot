<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { NButton, NAlert, NSpace } from 'naive-ui'
import { useTarotStore } from '@/stores/tarot'
import { useSettingsStore } from '@/stores/settings'
import InterpretationView from '@/components/InterpretationView.vue'
import AIModelSelect from '@/components/AIModelSelect.vue'
import PageHeader from '@/components/PageHeader.vue'
import AnimatedSection from '@/components/AnimatedSection.vue'
import { buildInterpretRequest, streamInterpretation } from '@/api/tarot'
import type { InterpretationResult } from '@/types/tarot'

const router = useRouter()
const tarotStore = useTarotStore()
const settingsStore = useSettingsStore()

const streamingText = ref('')
const loading = ref(false)
const error = ref('')

onMounted(() => {
  if (!tarotStore.isDrawComplete || !tarotStore.selectedSpread) {
    router.replace('/')
    return
  }
  startInterpretation()
})

async function startInterpretation() {
  if (!tarotStore.selectedSpread) return

  loading.value = true
  error.value = ''
  streamingText.value = ''
  tarotStore.interpretation = null
  tarotStore.isInterpreting = true

  const payload = buildInterpretRequest(
    tarotStore.question,
    tarotStore.selectedSpread,
    tarotStore.drawnCards,
    settingsStore.selectedModel
  )

  await streamInterpretation(
    payload,
    (text) => { streamingText.value += text },
    (result: InterpretationResult) => {
      tarotStore.interpretation = result
      loading.value = false
      tarotStore.isInterpreting = false
      settingsStore.addRecord({
        id: Date.now().toString(),
        question: tarotStore.question,
        spreadId: tarotStore.selectedSpread!.id,
        spreadName: tarotStore.selectedSpread!.name.zh,
        scene: tarotStore.sceneName ?? undefined,
        drawMode: tarotStore.drawMode,
        cards: [...tarotStore.drawnCards],
        interpretation: result,
        model: settingsStore.selectedModel,
        createdAt: new Date().toISOString(),
      })
    },
    (err) => {
      error.value = err.message
      loading.value = false
      tarotStore.isInterpreting = false
    }
  )
}

watch(
  () => settingsStore.selectedModel,
  () => {
    if (tarotStore.interpretation || error.value) startInterpretation()
  }
)

function handleNewReading() {
  tarotStore.resetSession()
  router.push('/')
}
</script>

<template>
  <div class="result-view page">
    <PageHeader
      title="解读结果"
      :subtitle="tarotStore.question"
      @back="router.push('/confirm')"
    />

    <AnimatedSection>
      <div class="result-view__toolbar">
        <AIModelSelect
          v-model="settingsStore.selectedModel"
          :models="settingsStore.enabledModels"
          :disabled="loading"
        />
        <NButton v-if="!loading" quaternary size="small" @click="startInterpretation">
          重新生成
        </NButton>
      </div>
    </AnimatedSection>

    <NAlert v-if="error" type="warning" :title="error" class="result-view__error">
      请检查 .env 中对应模型的 API Key 是否已配置（DEEPSEEK / ZHIPU / DASHSCOPE / XIAOMI），并确保后端服务已启动。
    </NAlert>
    <NSpace v-if="error" justify="center" style="margin-bottom: 1rem">
      <NButton size="small" type="primary" @click="startInterpretation">重试</NButton>
    </NSpace>

    <InterpretationView
      :result="tarotStore.interpretation"
      :streaming-text="streamingText"
      :loading="loading"
    />

    <AnimatedSection v-if="tarotStore.interpretation">
      <NSpace justify="center" class="result-view__actions">
        <NButton type="primary" size="large" @click="handleNewReading">
          开始新的占卜
        </NButton>
      </NSpace>
    </AnimatedSection>
  </div>
</template>

<style scoped lang="scss">
.result-view {
  &__toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    margin-bottom: 1.25rem;
    flex-wrap: wrap;
  }

  &__error {
    margin-bottom: 1.25rem;
  }

  &__actions {
    padding: 2rem 0 1rem;
  }
}
</style>
