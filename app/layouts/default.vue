<script setup lang="ts">
const route = useRoute()
const { data: me, refresh } = await useFetch('/api/auth/me', { key: 'layout-user', credentials: 'include' })
const user = computed(() => me.value?.user)
const userName = computed(() => user.value?.name?.trim() || '')
const userInitial = computed(() => userName.value.slice(0, 1) || 'م')

const nav = [
  { to: '/dashboard', label: 'داشبورد', short: 'خانه', icon: 'i-lucide-house' },
  { to: '/accounts', label: 'حساب‌ها', short: 'حساب', icon: 'i-lucide-wallet-cards' },
  { to: '/transactions', label: 'تراکنش‌ها', short: 'ثبت', icon: 'i-lucide-receipt-text' },
  { to: '/categories', label: 'دسته‌بندی‌ها', short: 'دسته', icon: 'i-lucide-tags' },
  { to: '/reports', label: 'گزارش‌ها', short: 'گزارش', icon: 'i-lucide-chart-no-axes-combined' }
]

function isActive(path: string) {
  return route.path === path || route.path.startsWith(`${path}/`)
}

async function logout() {
  await $fetch('/api/auth/logout', { method: 'POST' })
  me.value = { user: null }
  useNuxtData('current-user').data.value = { user: null }
  clearNuxtData('current-user')
  clearNuxtData('layout-user')
  await navigateTo('/login')
}
</script>

<template>
  <div class="app-shell">
    <header class="sticky top-0 z-30 border-b border-teal-900/10 bg-white/90 backdrop-blur">
      <div class="mx-auto flex max-w-7xl items-center justify-between gap-2 px-4 py-3 sm:gap-3">
        <NuxtLink to="/" class="flex min-h-12 shrink-0 items-center gap-2 text-lg font-black text-slate-950" aria-label="میفین">
          <img src="/pwa-icon.svg" alt="" class="site-logo" width="36" height="36">
          <span class="hidden sm:inline">میفین</span>
        </NuxtLink>

        <nav v-if="user" class="hidden items-center gap-1 md:flex">
          <NuxtLink
            v-for="item in nav"
            :key="item.to"
            :to="item.to"
            prefetch
            class="nav-item inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-bold text-slate-600 hover:bg-teal-50 hover:text-teal-900"
            :class="{ 'bg-teal-800 text-white hover:bg-teal-800 hover:text-white': isActive(item.to) }"
          >
            <UIcon :name="item.icon" class="size-4" />
            {{ item.label }}
          </NuxtLink>
        </nav>

        <div class="flex min-w-0 items-center gap-2 text-sm">
          <div v-if="user" class="user-chip">
            <span class="user-avatar">{{ userInitial }}</span>
            <span class="min-w-0">
              <span class="block text-[11px] font-bold leading-4 text-slate-500">حساب شما</span>
              <span class="block max-w-28 truncate font-black leading-5 text-slate-950 sm:max-w-40">{{ userName }}</span>
            </span>
          </div>
          <button v-if="user" class="btn-secondary min-h-10 px-3 py-2 text-sm" @click="logout">
            <UIcon name="i-lucide-log-out" class="btn-icon" />
            <span class="hidden sm:inline">خروج</span>
          </button>
          <NuxtLink v-else to="/login" class="btn-primary min-h-10 px-4 py-2 text-sm">
            <UIcon name="i-lucide-log-in" class="btn-icon" />
            <span>ورود</span>
          </NuxtLink>
        </div>
      </div>
    </header>

    <main class="app-main">
      <slot />
    </main>

    <SharedPwaInstallBanner />

    <nav
      v-if="user"
      class="mobile-bottom-nav fixed inset-x-0 bottom-0 z-40 border-t border-teal-900/10 bg-white/95 px-2 pt-2 shadow-[0_-8px_28px_rgb(15_118_110_/_0.12)] backdrop-blur md:hidden"
      aria-label="ناوبری اصلی"
    >
      <div class="mx-auto grid max-w-md grid-cols-5 gap-1">
        <NuxtLink
          v-for="item in nav"
          :key="item.to"
          :to="item.to"
          prefetch
          class="nav-item flex min-h-14 flex-col items-center justify-center rounded-xl px-1 text-xs font-semibold text-slate-500"
          :class="{ 'bg-teal-800 text-white shadow-sm': isActive(item.to) }"
        >
          <UIcon :name="item.icon" class="nav-icon" />
          <span>{{ item.short }}</span>
        </NuxtLink>
      </div>
    </nav>
  </div>
</template>
