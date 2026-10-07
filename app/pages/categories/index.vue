<script setup lang="ts">
type ActivePanel = 'list' | 'new'

const { number } = usePersian()
const { data, pending, refresh } = useFetch('/api/categories', { credentials: 'include', lazy: true })
const categories = computed(() => data.value?.categories ?? [])
const incomeCount = computed(() => categories.value.filter((category) => category.type === 'income').length)
const expenseCount = computed(() => categories.value.filter((category) => category.type === 'expense').length)
const activePanel = ref<ActivePanel>('list')
const form = reactive({ name: '', type: 'expense', icon: 'circle' })
const error = ref('')
const success = ref('')
const submitting = ref(false)
const deletingId = ref('')
const formSection = ref<HTMLElement | null>(null)
const nameInput = ref<HTMLInputElement | null>(null)

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

function panelClass(panel: ActivePanel) {
  return activePanel.value === panel ? 'block' : 'hidden md:block'
}

function iconName(value: string | null | undefined) {
  return iconOptions.find((option) => option.value === value)?.icon ?? 'i-lucide-circle'
}

function iconLabel(value: string | null | undefined) {
  return iconOptions.find((option) => option.value === value)?.label ?? 'سایر'
}

function openNewCategoryPanel() {
  activePanel.value = 'new'
  error.value = ''
  nextTick(() => {
    formSection.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    nameInput.value?.focus({ preventScroll: true })
  })
}

async function createCategory() {
  if (submitting.value) return
  error.value = ''
  success.value = ''
  submitting.value = true
  try {
    await $fetch('/api/categories', { method: 'POST', body: form })
    form.name = ''
    form.icon = 'circle'
    success.value = 'دسته‌بندی اضافه شد.'
    activePanel.value = 'list'
    await refresh()
  } catch (err) {
    const apiError = err as { data?: { statusMessage?: string }; message?: string }
    error.value = apiError.data?.statusMessage || apiError.message || 'ثبت دسته‌بندی ناموفق بود.'
  } finally {
    submitting.value = false
  }
}

async function removeCategory(id: string) {
  if (deletingId.value) return
  deletingId.value = id
  try {
    await $fetch(`/api/categories/${id}`, { method: 'DELETE' })
    await refresh()
  } finally {
    deletingId.value = ''
  }
}
</script>

<template>
  <div class="space-y-4">
    <section class="overflow-hidden rounded-[20px] bg-[linear-gradient(135deg,#063c36,#0f766e_58%,#d99b2b_135%)] text-white shadow-xl shadow-teal-900/15">
      <div class="p-4 sm:p-5">
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <p class="text-xs font-black text-white/70">برچسب‌گذاری خرج و درآمد</p>
            <h1 class="mt-1 text-2xl font-black">دسته‌بندی‌ها</h1>
            <p class="mt-2 max-w-xl text-sm leading-6 text-white/78">دسته‌های دقیق باعث می‌شوند گزارش‌ها خواناتر، قابل فیلترتر و تصمیم‌سازتر باشند.</p>
          </div>
          <button type="button" class="inline-flex size-11 shrink-0 items-center justify-center rounded-2xl bg-white/12 ring-1 ring-white/20 active:scale-95" aria-label="دسته‌بندی جدید" @click="openNewCategoryPanel">
            <UIcon name="i-lucide-plus" class="size-5" />
          </button>
        </div>

        <div class="mt-4 grid grid-cols-3 gap-2">
          <div class="rounded-2xl bg-white/12 p-3 ring-1 ring-white/15">
            <span class="block text-[11px] font-bold text-white/68">کل</span>
            <strong class="mt-1 block text-lg font-black">{{ number(categories.length) }}</strong>
          </div>
          <div class="rounded-2xl bg-white/12 p-3 ring-1 ring-white/15">
            <span class="block text-[11px] font-bold text-white/68">هزینه</span>
            <strong class="mt-1 block text-lg font-black">{{ number(expenseCount) }}</strong>
          </div>
          <div class="rounded-2xl bg-white/12 p-3 ring-1 ring-white/15">
            <span class="block text-[11px] font-bold text-white/68">درآمد</span>
            <strong class="mt-1 block text-lg font-black">{{ number(incomeCount) }}</strong>
          </div>
        </div>
      </div>
    </section>

    <nav class="filter-summary md:hidden">
      <div class="grid grid-cols-2 gap-2 rounded-2xl border border-teal-100 bg-white/94 p-2 shadow-lg shadow-teal-900/5 backdrop-blur">
        <button type="button" class="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl text-sm font-black transition" :class="activePanel === 'list' ? 'bg-teal-700 text-white shadow-lg shadow-teal-900/15' : 'text-slate-600'" @click="activePanel = 'list'">
          <UIcon name="i-lucide-tags" class="size-4" />
          <span>لیست</span>
        </button>
        <button type="button" class="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl text-sm font-black transition" :class="activePanel === 'new' ? 'bg-teal-700 text-white shadow-lg shadow-teal-900/15' : 'text-slate-600'" @click="openNewCategoryPanel">
          <UIcon name="i-lucide-plus" class="size-4" />
          <span>جدید</span>
        </button>
      </div>
    </nav>

    <SharedLoadingState v-if="pending" title="در حال دریافت دسته‌بندی‌ها" />

    <template v-else>
      <div class="grid gap-4 md:grid-cols-[minmax(0,1.3fr)_minmax(340px,0.8fr)] md:items-start">
        <section class="space-y-3" :class="panelClass('list')">
          <div class="flex items-center justify-between gap-3">
            <div>
              <h2 class="text-lg font-black text-slate-950">دسته‌های من</h2>
              <p class="mt-1 text-xs font-bold text-slate-500">هر دسته با آیکن خودش در فرم‌ها و گزارش‌ها دیده می‌شود.</p>
            </div>
            <button type="button" class="btn-secondary hidden min-h-10 px-3 py-2 text-sm md:inline-flex" @click="openNewCategoryPanel">
              <UIcon name="i-lucide-plus" class="btn-icon" />
              <span>دسته جدید</span>
            </button>
          </div>

          <div v-if="categories.length" class="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <article v-for="category in categories" :key="category.id" class="mobile-card flex min-h-20 items-center justify-between gap-3 p-4 transition hover:border-teal-200 hover:shadow-xl hover:shadow-teal-900/10">
              <div class="flex min-w-0 items-center gap-3">
                <span class="inline-flex size-11 shrink-0 items-center justify-center rounded-2xl" :class="category.type === 'income' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'">
                  <UIcon :name="iconName(category.icon)" class="size-5" />
                </span>
                <div class="min-w-0">
                  <h2 class="truncate font-black text-slate-950">{{ category.name }}</h2>
                  <p class="mt-1 text-xs font-bold" :class="category.type === 'income' ? 'text-emerald-700' : 'text-rose-700'">
                    {{ category.type === 'income' ? 'درآمد' : 'هزینه' }} · {{ iconLabel(category.icon) }}
                  </p>
                </div>
              </div>
              <button class="icon-danger-button" type="button" aria-label="حذف دسته‌بندی" title="حذف دسته‌بندی" :disabled="deletingId === category.id" @click="category.id && removeCategory(category.id)">
                <UIcon :name="deletingId === category.id ? 'i-lucide-loader-circle' : 'i-lucide-trash-2'" class="size-4" :class="{ 'animate-spin': deletingId === category.id }" />
              </button>
            </article>
          </div>

          <div v-else class="mobile-card p-6 text-center">
            <UIcon name="i-lucide-tags" class="mx-auto size-9 text-teal-700" />
            <p class="mt-2 text-sm font-black text-slate-950">دسته‌بندی‌ای ثبت نشده است.</p>
            <button type="button" class="btn-primary mt-4 w-full sm:w-auto" @click="openNewCategoryPanel">
              <UIcon name="i-lucide-plus" class="btn-icon" />
              <span>افزودن اولین دسته</span>
            </button>
          </div>
        </section>

        <aside class="md:sticky md:top-5">
          <form ref="formSection" class="mobile-card p-4 scroll-mt-24" :class="panelClass('new')" @submit.prevent="createCategory">
            <h2 class="text-lg font-black text-slate-950">دسته‌بندی جدید</h2>
            <div class="mt-4 grid gap-3">
              <label class="block">
                <span class="text-sm font-medium">نام</span>
                <input ref="nameInput" v-model="form.name" class="field mt-2" placeholder="مثلا خوراک" required>
              </label>
              <label class="block">
                <span class="text-sm font-medium">نوع</span>
                <SharedSelect v-model="form.type" :options="categoryTypes" class="mt-2" />
              </label>
            </div>

            <div class="mt-4">
              <div class="mb-2 flex items-center justify-between gap-3">
                <span class="text-sm font-medium">آیکن</span>
                <span class="inline-flex items-center gap-2 rounded-full bg-teal-50 px-3 py-1 text-xs font-black text-teal-800">
                  <UIcon :name="iconName(form.icon)" class="size-4" />
                  {{ iconLabel(form.icon) }}
                </span>
              </div>
              <div class="grid grid-cols-3 gap-2 sm:grid-cols-4">
                <button v-for="option in iconOptions" :key="option.value" type="button" class="icon-choice" :class="{ 'is-selected': form.icon === option.value }" @click="form.icon = option.value">
                  <UIcon :name="option.icon" class="size-5" />
                  <span>{{ option.label }}</span>
                </button>
              </div>
            </div>

            <p v-if="error" class="mt-4 rounded-xl bg-rose-50 p-3 text-sm font-bold text-rose-700">{{ error }}</p>
            <p v-if="success" class="mt-4 rounded-xl bg-emerald-50 p-3 text-sm font-bold text-emerald-700">{{ success }}</p>
            <button class="btn-primary mt-4 w-full disabled:opacity-70" :disabled="submitting">
              <UIcon :name="submitting ? 'i-lucide-loader-circle' : 'i-lucide-plus'" class="btn-icon" :class="{ 'animate-spin': submitting }" />
              <span>{{ submitting ? 'در حال افزودن...' : 'افزودن دسته' }}</span>
            </button>
          </form>
        </aside>
      </div>
    </template>
  </div>
</template>
