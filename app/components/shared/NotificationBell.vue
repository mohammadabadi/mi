<script setup lang="ts">
interface NotificationItem {
  id: string
  title: string
  body: string
  type: string
  isRead: boolean
  createdAt: string
}

const open = ref(false)
const markingId = ref('')
const panelRef = ref<HTMLElement | null>(null)
const buttonRef = ref<HTMLButtonElement | null>(null)
const panelStyle = ref<Record<string, string>>({})

const { data, pending, refresh } = useFetch('/api/notifications', {
  credentials: 'include',
  lazy: true,
  server: false,
  default: () => ({ notifications: [] as NotificationItem[] })
})

const notifications = computed(() => (data.value?.notifications ?? []) as NotificationItem[])
const unreadCount = computed(() => notifications.value.filter((item) => !item.isRead).length)
const latest = computed(() => notifications.value.slice(0, 8))

function notificationIcon(type: string) {
  if (type.includes('invite')) return 'i-lucide-mail-plus'
  if (type.includes('payment')) return 'i-lucide-circle-dollar-sign'
  if (type.includes('expense')) return 'i-lucide-receipt-text'
  return 'i-lucide-bell'
}

async function markAsRead(notification: NotificationItem) {
  if (notification.isRead || markingId.value) return
  markingId.value = notification.id
  try {
    await $fetch(`/api/notifications/${notification.id}`, { method: 'PATCH' })
    await refresh()
  } finally {
    markingId.value = ''
  }
}

function updatePanelPosition() {
  if (!import.meta.client || !buttonRef.value) return
  const rect = buttonRef.value.getBoundingClientRect()
  const margin = 12
  const width = Math.min(360, window.innerWidth - margin * 2)
  const right = Math.max(margin, window.innerWidth - rect.right)
  const maxRight = Math.max(margin, window.innerWidth - width - margin)

  panelStyle.value = {
    position: 'fixed',
    top: `${rect.bottom + 10}px`,
    right: `${Math.min(right, maxRight)}px`,
    width: `${width}px`
  }
}

function toggleOpen() {
  open.value = !open.value
  if (open.value) {
    updatePanelPosition()
    void refresh()
  }
}

function refreshNotifications() {
  void refresh()
}

function closeOnOutsideClick(event: MouseEvent) {
  const target = event.target as Node
  if (panelRef.value?.contains(target) || buttonRef.value?.contains(target)) return
  open.value = false
}

onMounted(() => {
  document.addEventListener('click', closeOnOutsideClick)
  window.addEventListener('resize', updatePanelPosition)
  window.addEventListener('scroll', updatePanelPosition, true)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', closeOnOutsideClick)
  window.removeEventListener('resize', updatePanelPosition)
  window.removeEventListener('scroll', updatePanelPosition, true)
})
</script>

<template>
  <div class="relative">
    <button
      ref="buttonRef"
      type="button"
      class="relative inline-flex size-11 items-center justify-center rounded-xl border border-teal-900/10 bg-white text-slate-700 shadow-sm transition hover:bg-teal-50 hover:text-teal-800"
      aria-label="اعلان‌ها"
      @click="toggleOpen"
    >
      <UIcon name="i-lucide-bell" class="size-5" />
      <span v-if="unreadCount" class="absolute -left-1 -top-1 inline-flex min-w-5 items-center justify-center rounded-full bg-rose-600 px-1.5 py-0.5 text-[10px] font-black text-white shadow-sm">
        {{ unreadCount > 9 ? '+۹' : unreadCount }}
      </span>
    </button>

    <Transition name="select-pop">
      <div
        v-if="open"
        ref="panelRef"
        class="z-[70] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/12"
        :style="panelStyle"
      >
        <div class="flex items-center justify-between gap-3 border-b border-slate-100 bg-slate-50 px-4 py-3">
          <div>
            <h2 class="font-black text-slate-950">اعلان‌ها</h2>
            <p class="mt-1 text-xs font-bold text-slate-500">{{ unreadCount ? `${unreadCount} اعلان خوانده‌نشده` : 'همه اعلان‌ها خوانده شده‌اند' }}</p>
          </div>
          <button type="button" class="inline-flex size-9 items-center justify-center rounded-xl bg-white text-teal-700 shadow-sm" aria-label="به‌روزرسانی اعلان‌ها" @click="refreshNotifications">
            <UIcon :name="pending ? 'i-lucide-loader-circle' : 'i-lucide-rotate-ccw'" class="size-4" :class="{ 'animate-spin': pending }" />
          </button>
        </div>

        <div v-if="pending && !latest.length" class="p-4">
          <div class="loading-row">
            <span class="loading-dot" />
            <span class="min-w-0 flex-1 space-y-2">
              <span class="loading-line block w-4/5" />
              <span class="loading-line block w-3/5" />
            </span>
          </div>
        </div>

        <div v-else-if="latest.length" class="hide-scrollbar max-h-[430px] overflow-y-auto p-2">
          <button
            v-for="notification in latest"
            :key="notification.id"
            type="button"
            class="flex w-full items-start gap-3 rounded-2xl p-3 text-right transition hover:bg-teal-50/70"
            :class="notification.isRead ? 'opacity-70' : 'bg-slate-50'"
            @click="markAsRead(notification)"
          >
            <span class="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-white text-teal-700 shadow-sm">
              <UIcon :name="markingId === notification.id ? 'i-lucide-loader-circle' : notificationIcon(notification.type)" class="size-5" :class="{ 'animate-spin': markingId === notification.id }" />
            </span>
            <span class="min-w-0 flex-1">
              <span class="flex items-start justify-between gap-2">
                <span class="line-clamp-1 font-black text-slate-950">{{ notification.title }}</span>
                <span v-if="!notification.isRead" class="mt-1 size-2 shrink-0 rounded-full bg-teal-600" />
              </span>
              <span class="mt-1 line-clamp-2 block text-xs font-bold leading-5 text-slate-500">{{ notification.body }}</span>
            </span>
          </button>
        </div>

        <div v-else class="p-5 text-center">
          <span class="mx-auto inline-flex size-12 items-center justify-center rounded-2xl bg-teal-50 text-teal-700">
            <UIcon name="i-lucide-bell-off" class="size-6" />
          </span>
          <p class="mt-3 text-sm font-black text-slate-950">اعلانی نداری.</p>
          <p class="mt-1 text-xs font-bold leading-5 text-slate-500">دعوت گروه، دنگ جدید و تایید پرداخت اینجا نمایش داده می‌شود.</p>
        </div>
      </div>
    </Transition>
  </div>
</template>
