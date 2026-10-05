<script setup lang="ts">
const { data, pending, refresh } = useFetch('/api/categories', { credentials: 'include', lazy: true })
const form = reactive({ name: '', type: 'expense', icon: 'circle' })
const error = ref('')
const success = ref('')
const categoryTypes = [
  { value: 'expense', label: 'هزینه' },
  { value: 'income', label: 'درآمد' }
]
const iconOptions = [
  { value: 'wallet', label: 'حقوق', icon: 'i-lucide-wallet' },
  { value: 'gift', label: 'هدیه', icon: 'i-lucide-gift' },
  { value: 'utensils', label: 'خوراک', icon: 'i-lucide-utensils' },
  { value: 'car', label: 'رفت و آمد', icon: 'i-lucide-car' },
  { value: 'shopping-bag', label: 'خرید', icon: 'i-lucide-shopping-bag' },
  { value: 'receipt', label: 'قبوض', icon: 'i-lucide-receipt' },
  { value: 'music', label: 'سرگرمی', icon: 'i-lucide-music' },
  { value: 'home', label: 'خانه', icon: 'i-lucide-house' },
  { value: 'heart-pulse', label: 'سلامت', icon: 'i-lucide-heart-pulse' },
  { value: 'graduation-cap', label: 'آموزش', icon: 'i-lucide-graduation-cap' },
  { value: 'plane', label: 'سفر', icon: 'i-lucide-plane' },
  { value: 'briefcase-business', label: 'کار', icon: 'i-lucide-briefcase-business' },
  { value: 'piggy-bank', label: 'پس‌انداز', icon: 'i-lucide-piggy-bank' },
  { value: 'chart-no-axes-combined', label: 'سرمایه', icon: 'i-lucide-chart-no-axes-combined' },
  { value: 'circle', label: 'سایر', icon: 'i-lucide-circle' }
]

function iconName(value: string | null | undefined) {
  return iconOptions.find((option) => option.value === value)?.icon ?? 'i-lucide-circle'
}

async function createCategory() {
  error.value = ''
  success.value = ''
  try {
    await $fetch('/api/categories', { method: 'POST', body: form })
    form.name = ''
    form.icon = 'circle'
    success.value = 'دسته‌بندی اضافه شد.'
    await refresh()
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'ثبت دسته‌بندی ناموفق بود.'
  }
}

async function removeCategory(id: string) {
  await $fetch(`/api/categories/${id}`, { method: 'DELETE' })
  await refresh()
}
</script>

<template>
  <div class="space-y-5">
    <div>
      <p class="text-sm font-semibold text-slate-500">برای گزارش‌های دقیق‌تر</p>
      <h1 class="text-2xl font-black text-slate-950">دسته‌بندی‌ها</h1>
    </div>

    <form class="mobile-card p-4" @submit.prevent="createCategory">
      <h2 class="text-lg font-bold">دسته‌بندی جدید</h2>
      <div class="mt-4 grid gap-3 sm:grid-cols-2">
        <label class="block">
          <span class="text-sm font-medium">نام</span>
          <input v-model="form.name" class="field mt-2" placeholder="مثلاً خوراک" required>
        </label>
        <label class="block">
          <span class="text-sm font-medium">نوع</span>
          <SharedSelect v-model="form.type" :options="categoryTypes" class="mt-2" />
        </label>
      </div>
      <div class="mt-4">
        <div class="mb-2 flex items-center justify-between gap-3">
          <span class="text-sm font-medium">آیکن</span>
          <span class="inline-flex items-center gap-2 rounded-full bg-teal-50 px-3 py-1 text-xs font-bold text-teal-800">
            <UIcon :name="iconName(form.icon)" class="size-4" />
            {{ iconOptions.find((option) => option.value === form.icon)?.label }}
          </span>
        </div>
        <div class="grid grid-cols-3 gap-2 sm:grid-cols-5">
          <button
            v-for="option in iconOptions"
            :key="option.value"
            type="button"
            class="icon-choice"
            :class="{ 'is-selected': form.icon === option.value }"
            @click="form.icon = option.value"
          >
            <UIcon :name="option.icon" class="size-5" />
            <span>{{ option.label }}</span>
          </button>
        </div>
      </div>
      <p v-if="error" class="mt-4 rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{{ error }}</p>
      <p v-if="success" class="mt-4 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">{{ success }}</p>
      <button class="btn-primary mt-4 w-full sm:w-auto">
        <UIcon name="i-lucide-plus" class="btn-icon" />
        <span>افزودن</span>
      </button>
    </form>

    <SharedLoadingState v-if="pending" title="در حال دریافت دسته‌بندی‌ها" />

    <section v-else class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <article v-for="category in data?.categories" :key="category.id" class="mobile-card flex min-h-20 items-center justify-between gap-3 p-4">
        <div class="min-w-0">
          <h2 class="truncate font-bold">{{ category.name }}</h2>
          <p class="mt-1 flex items-center gap-2 text-sm text-slate-500">
            <UIcon :name="iconName(category.icon)" class="size-4 text-teal-700" />
            <span>{{ category.type === 'income' ? 'درآمد' : 'هزینه' }}</span>
          </p>
        </div>
        <button class="icon-danger-button" type="button" aria-label="حذف دسته‌بندی" title="حذف دسته‌بندی" @click="category.id && removeCategory(category.id)">
          <UIcon name="i-lucide-trash-2" class="size-4" />
        </button>
      </article>
      <p v-if="!data?.categories?.length" class="mobile-card p-8 text-center text-sm text-slate-500 sm:col-span-2 lg:col-span-3">دسته‌بندی‌ای ثبت نشده است.</p>
    </section>
  </div>
</template>
