import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
  // Hash 路由模式，无需服务端 fallback 配置
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/HomeView.vue'),
      meta: { title: '首页' },
    },
    {
      path: '/spread',
      name: 'spread',
      component: () => import('@/views/SpreadView.vue'),
      meta: { title: '选择牌阵' },
    },
    {
      path: '/draw',
      name: 'draw',
      component: () => import('@/views/DrawView.vue'),
      meta: { title: '抽牌' },
    },
    {
      path: '/manual',
      name: 'manual',
      component: () => import('@/views/ManualSelectView.vue'),
      meta: { title: '录入现实牌型' },
    },
    {
      path: '/confirm',
      name: 'confirm',
      component: () => import('@/views/ConfirmView.vue'),
      meta: { title: '确认牌阵' },
    },
    {
      path: '/result',
      name: 'result',
      component: () => import('@/views/ResultView.vue'),
      meta: { title: '解读结果' },
    },
    {
      path: '/history',
      name: 'history',
      component: () => import('@/views/HistoryView.vue'),
      meta: { title: '历史记录' },
    },
  ],
})

router.afterEach((to) => {
  const title = to.meta.title as string
  document.title = title ? `${title} · 塔罗占卜` : '塔罗占卜'

  // Tab 切换时重置内容区滚动位置，避免滚动条残留
  document.querySelector('.app-main')?.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
})

export default router
