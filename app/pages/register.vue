<script setup lang="ts">
const form = reactive({ name: '', email: '', phone: '', password: '' })
const error = ref('')
const loading = ref(false)

function getApiErrorMessage(err: unknown, fallback: string) {
  const apiError = err as { data?: { statusMessage?: string; message?: string }; statusMessage?: string; message?: string }
  return apiError.data?.statusMessage || apiError.data?.message || apiError.statusMessage || apiError.message || fallback
}

async function submit() {
  if (loading.value) return
  loading.value = true
  error.value = ''
  try {
    const session = await $fetch<{ user: { id: string; name: string; email: string; phone: string | null } }>('/api/auth/register', { method: 'POST', body: form })
    useNuxtData('current-user').data.value = session
    useNuxtData('layout-user').data.value = session
    await navigateTo('/dashboard')
  } catch (err) {
    error.value = getApiErrorMessage(err, 'ثبت‌نام ناموفق بود.')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <section class="flex min-h-[calc(100dvh-96px)] items-center justify-center py-6">
    <form class="mobile-card w-full max-w-md p-5 sm:p-6" @submit.prevent="submit">
      <p class="text-sm font-semibold text-slate-500">شروع مدیریت مالی</p>
      <h1 class="mt-1 text-2xl font-black text-slate-950">ساخت حساب</h1>

      <label class="mt-6 block">
        <span class="text-sm font-medium">نام</span>
        <input v-model="form.name" class="field mt-2" autocomplete="name" required>
      </label>
      <label class="mt-4 block">
        <span class="text-sm font-medium">ایمیل</span>
        <input v-model="form.email" type="email" class="field ltr mt-2" autocomplete="email" required>
      </label>
      <label class="mt-4 block">
        <span class="text-sm font-medium">شماره موبایل</span>
        <input v-model="form.phone" inputmode="tel" class="field ltr mt-2" autocomplete="tel" dir="ltr" placeholder="09123456789" required>
      </label>
      <label class="mt-4 block">
        <span class="text-sm font-medium">رمز عبور</span>
        <input v-model="form.password" type="password" class="field ltr mt-2" autocomplete="new-password" required minlength="8">
      </label>

      <p v-if="error" class="mt-4 rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{{ error }}</p>
      <button class="btn-primary mt-6 w-full disabled:opacity-60" :disabled="loading">
        <UIcon :name="loading ? 'i-lucide-loader-circle' : 'i-lucide-user-plus'" class="btn-icon" :class="{ 'animate-spin': loading }" />
        <span>{{ loading ? 'در حال ساخت...' : 'ساخت حساب' }}</span>
      </button>
      <NuxtLink to="/login" class="mt-4 flex min-h-12 items-center justify-center gap-2 text-center text-sm font-semibold text-slate-600">
        <UIcon name="i-lucide-log-in" class="size-4" />
        <span>قبلاً ثبت‌نام کرده‌اید؟ ورود</span>
      </NuxtLink>
    </form>
  </section>
</template>
