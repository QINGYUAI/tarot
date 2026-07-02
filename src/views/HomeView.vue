<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { NButton, NCard, NInput, NSpace, NGrid, NGridItem } from 'naive-ui'
import { useTarotStore } from '@/stores/tarot'
import scenesData from '@/data/scenes.json'
import type { Scene } from '@/types/tarot'
import AnimatedSection from '@/components/AnimatedSection.vue'

const router = useRouter()
const tarotStore = useTarotStore()
const scenes = scenesData as Scene[]
const freeQuestion = ref('')

function handleSceneClick(scene: Scene) {
  tarotStore.resetSession()
  tarotStore.setScene(scene.id, scene.name)
  router.push({ name: 'spread', query: { scene: scene.id } })
}

function handleFreeQuestion() {
  const q = freeQuestion.value.trim()
  if (!q) return
  tarotStore.resetSession()
  tarotStore.setQuestion(q)
  router.push({ name: 'spread' })
}
</script>

<template>
  <div class="home-view page">
    <AnimatedSection>
      <header class="home-view__hero">
        <div class="home-view__logo">☽</div>
        <h1 class="home-view__title">塔罗占卜</h1>
        <p class="home-view__subtitle">专为零基础设计的引导式 AI 深度解读</p>
        <p class="home-view__tagline">不知道问什么？不知道怎么抽？抽到了看不懂？一次帮你全部打通</p>
      </header>
    </AnimatedSection>

    <AnimatedSection :delay="100">
      <section class="home-view__scenes">
        <h2 class="section-title">选择场景</h2>
        <NGrid :cols="3" :x-gap="10" :y-gap="10" responsive="screen" item-responsive>
          <NGridItem v-for="(scene, i) in scenes" :key="scene.id" span="3 m:1">
            <NCard
              class="scene-card"
              :style="{ animationDelay: `${i * 60}ms` }"
              hoverable
              @click="handleSceneClick(scene)"
            >
              <div class="scene-card__inner">
                <span class="scene-card__icon">{{ scene.icon }}</span>
                <span class="scene-card__name">{{ scene.name }}</span>
              </div>
            </NCard>
          </NGridItem>
        </NGrid>
      </section>
    </AnimatedSection>

    <AnimatedSection :delay="200">
      <section class="home-view__question">
        <h2 class="section-title">自由提问</h2>
        <NCard size="small">
          <NSpace vertical :size="12">
            <NInput
              v-model:value="freeQuestion"
              type="textarea"
              placeholder="输入你想问的问题，例如：我最近工作很迷茫，该怎么办？"
              :rows="3"
              @keydown.ctrl.enter="handleFreeQuestion"
            />
            <NButton
              type="primary"
              block
              size="large"
              :disabled="!freeQuestion.trim()"
              @click="handleFreeQuestion"
            >
              开始占卜 ✨
            </NButton>
          </NSpace>
        </NCard>
      </section>
    </AnimatedSection>
  </div>
</template>

<style scoped lang="scss">
.home-view {
  &__hero {
    text-align: center;
    padding: 1.5rem 0 2rem;
  }

  &__logo {
    font-size: 3.5rem;
    color: var(--color-gold);
    margin-bottom: 0.5rem;
    animation: float 4s ease-in-out infinite;
    filter: drop-shadow(0 0 20px rgba(212, 175, 55, 0.3));
  }

  &__title {
    font-family: var(--font-serif);
    font-size: 2.4rem;
    background: linear-gradient(135deg, #d4af37, #f5e6a3, #d4af37);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin: 0 0 0.5rem;
  }

  &__subtitle {
    font-size: 1.05rem;
    color: var(--color-text);
    margin: 0 0 0.75rem;
  }

  &__tagline {
    font-size: 0.85rem;
    color: var(--color-text-muted);
    margin: 0;
    line-height: 1.65;
    max-width: 420px;
    margin-inline: auto;
  }

  &__scenes { margin-bottom: 2rem; }
  &__question { margin-bottom: 1rem; }
}

.scene-card {
  cursor: pointer;
  animation: popIn 0.5s ease both;
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) !important;

  &:hover {
    transform: translateY(-4px) scale(1.02);
  }

  &__inner {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0;
  }

  &__icon { font-size: 2rem; }
  &__name { font-size: 0.92rem; color: var(--color-text); }
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}

@keyframes popIn {
  from { opacity: 0; transform: scale(0.85); }
  to { opacity: 1; transform: scale(1); }
}
</style>
