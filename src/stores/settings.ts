import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { AIModel, DivinationRecord } from '@/types/tarot'

const STORAGE_KEY = 'tarot_history'
const MAX_HISTORY = 20

/** 解析环境变量中的 AI 模型配置 */
function parseModels(): AIModel[] {
  try {
    const raw = import.meta.env.VITE_AI_MODELS
    if (raw) return JSON.parse(raw) as AIModel[]
  } catch {
    /* 使用默认配置 */
  }
  return [
    { id: 'deepseek', name: 'DeepSeek', enabled: true },
    { id: 'zhipu', name: '智谱清言', enabled: true },
    { id: 'qwen', name: '通义千问', enabled: true },
    { id: 'xiaomi', name: '小米 MiMo', enabled: true },
  ]
}

/** 设置与历史记录状态 */
export const useSettingsStore = defineStore('settings', () => {
  const models = parseModels()
  const enabledModels = models.filter((m) => m.enabled)
  const defaultModel = import.meta.env.VITE_DEFAULT_MODEL || 'deepseek'

  const selectedModel = ref(
    enabledModels.find((m) => m.id === defaultModel)?.id ?? enabledModels[0]?.id ?? 'deepseek'
  )

  const history = ref<DivinationRecord[]>(loadHistory())

  const currentModelName = computed(
    () => enabledModels.find((m) => m.id === selectedModel.value)?.name ?? selectedModel.value
  )

  function loadHistory(): DivinationRecord[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw ? (JSON.parse(raw) as DivinationRecord[]) : []
    } catch {
      return []
    }
  }

  function saveHistory() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history.value.slice(0, MAX_HISTORY)))
  }

  function addRecord(record: DivinationRecord) {
    history.value.unshift(record)
    if (history.value.length > MAX_HISTORY) {
      history.value = history.value.slice(0, MAX_HISTORY)
    }
    saveHistory()
  }

  function removeRecord(id: string) {
    history.value = history.value.filter((r) => r.id !== id)
    saveHistory()
  }

  function clearHistory() {
    history.value = []
    saveHistory()
  }

  return {
    enabledModels,
    selectedModel,
    currentModelName,
    history,
    addRecord,
    removeRecord,
    clearHistory,
  }
})
