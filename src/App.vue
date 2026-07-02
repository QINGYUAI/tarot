<script setup lang="ts">
import { computed } from 'vue'
import { RouterView, RouterLink, useRoute } from 'vue-router'
import type { RouteLocationNormalizedLoaded } from 'vue-router'
import {
  NConfigProvider,
  NMessageProvider,
  NDialogProvider,
  darkTheme,
  NIcon,
  zhCN,
  dateZhCN,
} from 'naive-ui'
import { tarotThemeOverrides } from '@/plugins/naive-theme'
import StarBackground from '@/components/StarBackground.vue'
import { HomeOutline, TimeOutline } from '@vicons/ionicons5'

const route = useRoute()
const showNav = computed(() => !['draw', 'manual'].includes(route.name as string))

/** 底部 Tab 配置 */
const navTabs = [
  { to: '/', name: 'home', label: '首页', icon: HomeOutline },
  { to: '/history', name: 'history', label: '历史', icon: TimeOutline },
] as const

const TAB_ROUTE_NAMES = new Set(['home', 'history'])

function isTabActive(tabName: string) {
  return route.name === tabName
}

/** Tab 页用淡入淡出，避免横向位移触发滚动条 */
function getTransitionName(r: RouteLocationNormalizedLoaded) {
  if (TAB_ROUTE_NAMES.has(r.name as string)) return 'page-fade'
  return (r.meta.transition as string) ?? 'page-slide'
}
</script>

<template>
  <NConfigProvider
    :locale="zhCN"
    :date-locale="dateZhCN"
    :theme="darkTheme"
    :theme-overrides="tarotThemeOverrides"
  >
    <NMessageProvider>
      <NDialogProvider>
        <div id="app-root">
          <StarBackground />

          <main class="app-main">
            <div class="app-main__inner">
              <RouterView v-slot="{ Component, route: r }">
                <Transition :name="getTransitionName(r)" mode="out-in">
                  <component :is="Component" :key="r.fullPath" />
                </Transition>
              </RouterView>
            </div>
          </main>

          <nav v-if="showNav" class="bottom-nav">
            <RouterLink
              v-for="tab in navTabs"
              :key="tab.name"
              :to="tab.to"
              class="bottom-nav__item"
              :class="{ 'bottom-nav__item--active': isTabActive(tab.name) }"
            >
              <span class="bottom-nav__icon-wrap">
                <NIcon :component="tab.icon" :size="22" />
              </span>
              <span class="bottom-nav__label">{{ tab.label }}</span>
            </RouterLink>
          </nav>
        </div>
      </NDialogProvider>
    </NMessageProvider>
  </NConfigProvider>
</template>

<style scoped lang="scss">
#app-root {
  height: 100vh;
  height: 100dvh;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
}

.app-main {
  flex: 1;
  min-height: 0;
  overflow-x: hidden;
  overflow-y: auto;
  overscroll-behavior: contain;
  -webkit-overflow-scrolling: touch;
  position: relative;
  z-index: 1;
  scrollbar-gutter: stable;

  &__inner {
    min-height: 100%;
    padding-bottom: calc(64px + env(safe-area-inset-bottom, 0px));
  }
}

.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: calc(64px + env(safe-area-inset-bottom, 0px));
  padding-bottom: env(safe-area-inset-bottom, 0px);
  background: rgba(26, 16, 53, 0.92);
  backdrop-filter: blur(16px);
  border-top: 1px solid rgba(212, 175, 55, 0.12);
  display: flex;
  justify-content: space-around;
  align-items: stretch;
  z-index: 100;
  box-sizing: border-box;

  &__item {
    flex: 1;
    max-width: 160px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
    color: var(--color-text-muted);
    text-decoration: none;
    position: relative;
    transition: color 0.2s ease;
    -webkit-tap-highlight-color: transparent;

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 0;
      height: 2px;
      background: var(--color-gold);
      border-radius: 0 0 2px 2px;
      transition: width 0.2s ease;
    }

    &--active {
      color: var(--color-gold);

      &::before {
        width: 28px;
      }
    }

    &:hover {
      color: var(--color-text);
    }
  }

  &__icon-wrap {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    flex-shrink: 0;
  }

  &__label {
    font-size: 0.72rem;
    line-height: 1;
    white-space: nowrap;
    min-height: 0.72rem;
  }
}

/* Tab 切换：纯淡入，不产生横向溢出 */
.page-fade-enter-active,
.page-fade-leave-active {
  transition: opacity 0.22s ease;
}

.page-fade-enter-from,
.page-fade-leave-to {
  opacity: 0;
}

.page-slide-enter-active,
.page-slide-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.page-slide-enter-from {
  opacity: 0;
  transform: translateX(16px);
}

.page-slide-leave-to {
  opacity: 0;
  transform: translateX(-16px);
}
</style>

<style lang="scss">
/* 内容区滚动条 — 深色主题细滚动条 */
.app-main {
  scrollbar-width: thin;
  scrollbar-color: rgba(155, 126, 217, 0.35) transparent;

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(155, 126, 217, 0.35);
    border-radius: 4px;

    &:hover {
      background: rgba(212, 175, 55, 0.45);
    }
  }
}
</style>
