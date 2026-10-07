<script setup lang="ts">
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

type PromptMode = 'install' | 'notification'

const deferredPrompt = shallowRef<BeforeInstallPromptEvent | null>(null)
const mounted = ref(false)
const isMobile = ref(false)
const isStandalone = ref(false)
const isIos = ref(false)
const installing = ref(false)
const requestingNotification = ref(false)
const mode = ref<PromptMode>('install')

const installDismissed = useCookie('mifin_install_dismissed', {
  maxAge: 60 * 60 * 24 * 14,
  sameSite: 'lax'
})
const notificationDismissed = useCookie('mifin_notification_dismissed', {
  maxAge: 60 * 60 * 24 * 30,
  sameSite: 'lax'
})

const hasNotificationSupport = computed(() => mounted.value && 'Notification' in window)
const notificationPermission = ref<NotificationPermission | 'unsupported'>('unsupported')

const isInstalled = computed(() => isStandalone.value || (mounted.value && localStorage.getItem('mifin_pwa_installed') === '1'))
const canInstall = computed(() => {
  if (!mounted.value || installDismissed.value === '1' || isInstalled.value) return false
  return Boolean(deferredPrompt.value) || isIos.value
})
const canAskNotification = computed(() => {
  if (!mounted.value || notificationDismissed.value === '1' || !isInstalled.value || !hasNotificationSupport.value) return false
  return notificationPermission.value === 'default'
})
const isVisible = computed(() => mode.value === 'install' ? canInstall.value : canAskNotification.value)
const showIosHelp = computed(() => mode.value === 'install' && canInstall.value && isIos.value && !deferredPrompt.value)

function syncInstallState() {
  isMobile.value = window.matchMedia('(max-width: 767px), (pointer: coarse)').matches
  isStandalone.value = window.matchMedia('(display-mode: standalone)').matches || Boolean((navigator as Navigator & { standalone?: boolean }).standalone)
  isIos.value = /iphone|ipad|ipod/i.test(navigator.userAgent)
  if (isStandalone.value) localStorage.setItem('mifin_pwa_installed', '1')
}

function syncNotificationState() {
  notificationPermission.value = 'Notification' in window ? Notification.permission : 'unsupported'
}

function close() {
  if (mode.value === 'install') installDismissed.value = '1'
  if (mode.value === 'notification') notificationDismissed.value = '1'
}

async function install() {
  if (!deferredPrompt.value || installing.value) return
  installing.value = true
  try {
    await deferredPrompt.value.prompt()
    const choice = await deferredPrompt.value.userChoice
    if (choice.outcome === 'accepted') {
      localStorage.setItem('mifin_pwa_installed', '1')
      installDismissed.value = '1'
      mode.value = 'notification'
    }
    deferredPrompt.value = null
  } finally {
    installing.value = false
  }
}

async function askNotificationPermission() {
  if (!hasNotificationSupport.value || requestingNotification.value) return
  requestingNotification.value = true
  try {
    const permission = await Notification.requestPermission()
    notificationPermission.value = permission
    if (permission !== 'default') notificationDismissed.value = '1'
  } finally {
    requestingNotification.value = false
  }
}

onMounted(() => {
  mounted.value = true
  syncInstallState()
  syncNotificationState()
  mode.value = canInstall.value ? 'install' : 'notification'

  window.addEventListener('beforeinstallprompt', (event: Event) => {
    event.preventDefault()
    deferredPrompt.value = event as BeforeInstallPromptEvent
    mode.value = 'install'
  })

  window.addEventListener('appinstalled', () => {
    localStorage.setItem('mifin_pwa_installed', '1')
    installDismissed.value = '1'
    syncInstallState()
    syncNotificationState()
    mode.value = 'notification'
  })
})
</script>

<template>
  <ClientOnly>
    <Transition name="pwa-card">
      <div v-if="isVisible" class="fixed inset-x-3 bottom-24 z-[80] md:bottom-6 md:left-6 md:right-auto md:w-[390px]">
        <div class="overflow-hidden rounded-[18px] border border-white/80 bg-white/95 shadow-2xl shadow-teal-900/15 backdrop-blur-xl">
          <div class="bg-[linear-gradient(135deg,#064e46,#0f766e_58%,#d99b2b_130%)] p-4 text-white">
            <div class="flex items-start gap-3">
              <span class="inline-flex size-12 shrink-0 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/25">
                <UIcon :name="mode === 'install' ? 'i-lucide-smartphone' : 'i-lucide-bell-ring'" class="size-6" />
              </span>
              <div class="min-w-0 flex-1">
                <p class="text-base font-black">
                  {{ mode === 'install' ? 'میفین را مثل اپ نصب کن' : 'اعلان‌های میفین را فعال کن' }}
                </p>
                <p class="mt-1 text-xs leading-6 text-white/82">
                  {{ mode === 'install' ? 'دسترسی سریع‌تر، تجربه تمام‌صفحه و آماده برای استفاده روزانه روی موبایل.' : 'دعوت گروه، دنگ جدید و تایید پرداخت را سریع‌تر می‌بینی.' }}
                </p>
              </div>
              <button class="inline-flex size-9 shrink-0 items-center justify-center rounded-xl bg-white/12 text-white ring-1 ring-white/20 transition hover:bg-white/20" :aria-label="mode === 'install' ? 'بستن پیام نصب' : 'بستن پیام اعلان'" @click="close">
                <UIcon name="i-lucide-x" class="size-4" />
              </button>
            </div>
          </div>

          <div class="space-y-3 p-4">
            <div v-if="showIosHelp" class="rounded-2xl border border-amber-100 bg-amber-50 p-3 text-xs font-bold leading-6 text-amber-900">
              در Safari دکمه Share را بزن، سپس گزینه Add to Home Screen را انتخاب کن. بعد از نصب، همین‌جا می‌توانی اعلان‌ها را هم فعال کنی.
            </div>

            <div v-else-if="mode === 'notification'" class="grid grid-cols-[auto_1fr] gap-3 rounded-2xl bg-teal-50 p-3">
              <span class="inline-flex size-10 items-center justify-center rounded-xl bg-white text-teal-700 shadow-sm">
                <UIcon name="i-lucide-shield-check" class="size-5" />
              </span>
              <p class="text-xs font-bold leading-6 text-teal-950">
                فقط برای اتفاق‌های مهم مالی و گروهی اعلان می‌گیری؛ هر زمان هم از تنظیمات مرورگر قابل تغییر است.
              </p>
            </div>

            <div class="grid grid-cols-[1fr_auto] gap-2">
              <button v-if="mode === 'install' && !showIosHelp" class="btn-primary min-h-12 px-4 text-sm disabled:opacity-70" :disabled="installing" @click="install">
                <UIcon :name="installing ? 'i-lucide-loader-circle' : 'i-lucide-download'" class="btn-icon" :class="{ 'animate-spin': installing }" />
                <span>{{ installing ? 'در حال آماده‌سازی' : 'نصب اپ' }}</span>
              </button>
              <button v-else-if="mode === 'notification'" class="btn-primary min-h-12 px-4 text-sm disabled:opacity-70" :disabled="requestingNotification" @click="askNotificationPermission">
                <UIcon :name="requestingNotification ? 'i-lucide-loader-circle' : 'i-lucide-bell-plus'" class="btn-icon" :class="{ 'animate-spin': requestingNotification }" />
                <span>{{ requestingNotification ? 'در حال بررسی' : 'فعال‌سازی اعلان' }}</span>
              </button>
              <button class="btn-secondary min-h-12 px-3 text-sm" @click="close">
                <UIcon name="i-lucide-clock-3" class="btn-icon" />
                <span>بعدا</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </ClientOnly>
</template>
