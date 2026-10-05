<script setup lang="ts">
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

const deferredPrompt = shallowRef<BeforeInstallPromptEvent | null>(null)
const isMobile = ref(false)
const isStandalone = ref(false)
const isIos = ref(false)
const dismissed = useCookie('mifin_install_dismissed', {
  maxAge: 60 * 60 * 24 * 14,
  sameSite: 'lax'
})

const canInstall = computed(() => {
  if (dismissed.value === '1' || !isMobile.value || isStandalone.value) return false
  return Boolean(deferredPrompt.value) || isIos.value
})
const showIosHelp = computed(() => canInstall.value && isIos.value && !deferredPrompt.value)

async function install() {
  if (!deferredPrompt.value) return
  await deferredPrompt.value.prompt()
  await deferredPrompt.value.userChoice
  deferredPrompt.value = null
}

function close() {
  dismissed.value = '1'
}

onMounted(() => {
  isMobile.value = window.matchMedia('(max-width: 767px), (pointer: coarse)').matches
  isStandalone.value = window.matchMedia('(display-mode: standalone)').matches || Boolean((navigator as Navigator & { standalone?: boolean }).standalone)
  isIos.value = /iphone|ipad|ipod/i.test(navigator.userAgent)

  window.addEventListener('beforeinstallprompt', (event: Event) => {
    event.preventDefault()
    deferredPrompt.value = event as BeforeInstallPromptEvent
  })
  window.addEventListener('appinstalled', close)
})
</script>

<template>
  <ClientOnly>
    <div v-if="canInstall" class="fixed inset-x-3 bottom-24 z-[70] md:hidden">
      <div class="mobile-card mx-auto max-w-md p-3 shadow-lg">
        <div class="flex items-start gap-3">
          <span class="inline-flex size-11 shrink-0 items-center justify-center rounded-xl bg-teal-800 text-white shadow-sm">
            <UIcon name="i-lucide-smartphone" class="size-5" />
          </span>
          <div class="min-w-0 flex-1">
            <p class="text-sm font-black text-slate-950">میفین را روی گوشی نصب کن</p>
            <p class="mt-1 text-xs leading-5 text-slate-500">مثل یک اپ مستقل باز می‌شود و همیشه از صفحه اصلی گوشی در دسترس است.</p>
          </div>
          <button class="icon-danger-button size-9 min-w-9 border-slate-200 bg-white text-slate-500" aria-label="بستن پیام نصب" @click="close">
            <UIcon name="i-lucide-x" class="size-4" />
          </button>
        </div>

        <div v-if="showIosHelp" class="mt-3 rounded-xl bg-teal-50 p-3 text-xs font-bold leading-6 text-teal-950">
          در Safari دکمه Share را بزن، سپس گزینه Add to Home Screen را انتخاب کن.
        </div>

        <div class="mt-3 grid gap-2" :class="showIosHelp ? 'grid-cols-1' : 'grid-cols-[1fr_auto]'">
          <button v-if="!showIosHelp" class="btn-primary min-h-11 px-4 py-2 text-sm" @click="install">
            <UIcon name="i-lucide-download" class="btn-icon" />
            <span>نصب اپ</span>
          </button>
          <button class="btn-secondary min-h-11 px-3 py-2 text-sm" @click="close">
            <UIcon name="i-lucide-clock" class="btn-icon" />
            <span>بعداً</span>
          </button>
        </div>
      </div>
    </div>
  </ClientOnly>
</template>
