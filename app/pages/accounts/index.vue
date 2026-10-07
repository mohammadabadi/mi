<script setup lang="ts">
type ActivePanel = 'list' | 'new'

const { money, number } = usePersian()
const { data, pending, refresh } = useFetch('/api/accounts', { credentials: 'include', lazy: true })

interface AccountItem {
  id: string
  name: string
  type: string
  currency: string
  balanceMinor: string
}

const accounts = computed(() => (data.value?.accounts ?? []) as AccountItem[])
const totalBalanceMinor = computed(() => accounts.value.reduce((sum, account) => sum + BigInt(account.balanceMinor || '0'), BigInt(0)).toString())
const activePanel = ref<ActivePanel>('list')
const form = reactive({ name: '', type: 'bank', initialBalanceMinor: '0' })
const error = ref('')
const success = ref('')
const submitting = ref(false)
const deletingId = ref('')
const formSection = ref<HTMLElement | null>(null)
const nameInput = ref<HTMLInputElement | null>(null)

const accountTypes = [
  { value: 'bank', label: 'بانک', icon: 'i-lucide-landmark' },
  { value: 'cash', label: 'نقدی', icon: 'i-lucide-banknote' },
  { value: 'wallet', label: 'کیف پول', icon: 'i-lucide-wallet' },
  { value: 'credit_card', label: 'کارت اعتباری', icon: 'i-lucide-credit-card' },
  { value: 'other', label: 'سایر', icon: 'i-lucide-circle-dot' }
]

const accountTypeOptions = computed(() => accountTypes.map(({ value, label }) => ({ value, label })))

function panelClass(panel: ActivePanel) {
  return activePanel.value === panel ? 'block' : 'hidden md:block'
}

function typeLabel(type: string) {
  return accountTypes.find((item) => item.value === type)?.label ?? 'سایر'
}

function typeIcon(type: string) {
  return accountTypes.find((item) => item.value === type)?.icon ?? 'i-lucide-wallet-cards'
}

function openNewAccountPanel() {
  activePanel.value = 'new'
  error.value = ''
  nextTick(() => {
    formSection.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    nameInput.value?.focus({ preventScroll: true })
  })
}

async function createAccount() {
  if (submitting.value) return
  error.value = ''
  success.value = ''
  submitting.value = true
  try {
    await $fetch('/api/accounts', { method: 'POST', body: { ...form, currency: 'IRR' } })
    form.name = ''
    form.type = 'bank'
    form.initialBalanceMinor = '0'
    success.value = 'حساب اضافه شد.'
    activePanel.value = 'list'
    await refresh()
  } catch (err) {
    const apiError = err as { data?: { statusMessage?: string }; message?: string }
    error.value = apiError.data?.statusMessage || apiError.message || 'ثبت حساب ناموفق بود.'
  } finally {
    submitting.value = false
  }
}

async function removeAccount(id: string) {
  if (deletingId.value) return
  deletingId.value = id
  try {
    await $fetch(`/api/accounts/${id}`, { method: 'DELETE' })
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
            <p class="text-xs font-black text-white/70">مدیریت حساب‌ها</p>
            <h1 class="mt-1 text-2xl font-black">حساب‌ها</h1>
            <p class="mt-2 max-w-xl text-sm leading-6 text-white/78">موجودی هر حساب از تراکنش‌ها محاسبه می‌شود و برای گزارش‌ها مبنای قابل اعتماد می‌سازد.</p>
          </div>
          <button type="button" class="inline-flex size-11 shrink-0 items-center justify-center rounded-2xl bg-white/12 ring-1 ring-white/20 active:scale-95" aria-label="حساب جدید" @click="openNewAccountPanel">
            <UIcon name="i-lucide-plus" class="size-5" />
          </button>
        </div>

        <div class="mt-4 grid grid-cols-2 gap-2">
          <div class="rounded-2xl bg-white/12 p-3 ring-1 ring-white/15">
            <span class="block text-[11px] font-bold text-white/68">تعداد حساب</span>
            <strong class="mt-1 block text-lg font-black">{{ number(accounts.length) }}</strong>
          </div>
          <div class="rounded-2xl bg-white/12 p-3 ring-1 ring-white/15">
            <span class="block text-[11px] font-bold text-white/68">موجودی کل</span>
            <strong class="money-value mt-1 block truncate text-sm font-black text-amber-100">{{ money(totalBalanceMinor) }}</strong>
          </div>
        </div>
      </div>
    </section>

    <nav class="filter-summary md:hidden">
      <div class="grid grid-cols-2 gap-2 rounded-2xl border border-teal-100 bg-white/94 p-2 shadow-lg shadow-teal-900/5 backdrop-blur">
        <button type="button" class="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl text-sm font-black transition" :class="activePanel === 'list' ? 'bg-teal-700 text-white shadow-lg shadow-teal-900/15' : 'text-slate-600'" @click="activePanel = 'list'">
          <UIcon name="i-lucide-wallet-cards" class="size-4" />
          <span>حساب‌ها</span>
        </button>
        <button type="button" class="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl text-sm font-black transition" :class="activePanel === 'new' ? 'bg-teal-700 text-white shadow-lg shadow-teal-900/15' : 'text-slate-600'" @click="openNewAccountPanel">
          <UIcon name="i-lucide-plus" class="size-4" />
          <span>جدید</span>
        </button>
      </div>
    </nav>

    <SharedLoadingState v-if="pending" title="در حال دریافت حساب‌ها" />

    <template v-else>
      <div class="grid gap-4 md:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.75fr)] md:items-start">
        <section class="space-y-3" :class="panelClass('list')">
          <div class="flex items-center justify-between gap-3">
            <div>
              <h2 class="text-lg font-black text-slate-950">حساب‌های من</h2>
              <p class="mt-1 text-xs font-bold text-slate-500">برای هر حساب، موجودی به‌روز و قابل بررسی است.</p>
            </div>
            <button type="button" class="btn-secondary hidden min-h-10 px-3 py-2 text-sm md:inline-flex" @click="openNewAccountPanel">
              <UIcon name="i-lucide-plus" class="btn-icon" />
              <span>حساب جدید</span>
            </button>
          </div>

          <div v-if="accounts.length" class="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <article v-for="account in accounts" :key="account.id" class="mobile-card p-4 transition hover:border-teal-200 hover:shadow-xl hover:shadow-teal-900/10">
              <div class="flex items-start justify-between gap-3">
                <div class="flex min-w-0 items-center gap-3">
                  <span class="inline-flex size-11 shrink-0 items-center justify-center rounded-2xl bg-teal-50 text-teal-700">
                    <UIcon :name="typeIcon(account.type)" class="size-5" />
                  </span>
                  <div class="min-w-0">
                    <h2 class="truncate font-black text-slate-950">{{ account.name }}</h2>
                    <p class="mt-1 text-xs font-bold text-slate-500">{{ typeLabel(account.type) }}</p>
                  </div>
                </div>
                <button class="icon-danger-button" type="button" aria-label="حذف حساب" title="حذف حساب" :disabled="deletingId === account.id" @click="removeAccount(account.id)">
                  <UIcon :name="deletingId === account.id ? 'i-lucide-loader-circle' : 'i-lucide-trash-2'" class="size-4" :class="{ 'animate-spin': deletingId === account.id }" />
                </button>
              </div>
              <div class="money-value mt-5 text-2xl font-black leading-tight text-teal-950">{{ money(account.balanceMinor, account.currency) }}</div>
            </article>
          </div>

          <div v-else class="mobile-card p-6 text-center">
            <UIcon name="i-lucide-wallet-cards" class="mx-auto size-9 text-teal-700" />
            <p class="mt-2 text-sm font-black text-slate-950">هنوز حسابی ثبت نشده است.</p>
            <button type="button" class="btn-primary mt-4 w-full sm:w-auto" @click="openNewAccountPanel">
              <UIcon name="i-lucide-plus" class="btn-icon" />
              <span>افزودن اولین حساب</span>
            </button>
          </div>
        </section>

        <aside class="md:sticky md:top-5">
          <form ref="formSection" class="mobile-card p-4 scroll-mt-24" :class="panelClass('new')" @submit.prevent="createAccount">
            <h2 class="text-lg font-black text-slate-950">حساب جدید</h2>
            <div class="mt-4 grid gap-3">
              <label class="block">
                <span class="text-sm font-medium">نام حساب</span>
                <input ref="nameInput" v-model="form.name" class="field mt-2" placeholder="مثلا بانک ملت" required>
              </label>
              <label class="block">
                <span class="text-sm font-medium">نوع</span>
                <SharedSelect v-model="form.type" :options="accountTypeOptions" class="mt-2" />
              </label>
              <SharedMoneyInput v-model="form.initialBalanceMinor" label="موجودی اولیه" required />
            </div>
            <p v-if="error" class="mt-4 rounded-xl bg-rose-50 p-3 text-sm font-bold text-rose-700">{{ error }}</p>
            <p v-if="success" class="mt-4 rounded-xl bg-emerald-50 p-3 text-sm font-bold text-emerald-700">{{ success }}</p>
            <button class="btn-primary mt-4 w-full disabled:opacity-70" :disabled="submitting">
              <UIcon :name="submitting ? 'i-lucide-loader-circle' : 'i-lucide-plus'" class="btn-icon" :class="{ 'animate-spin': submitting }" />
              <span>{{ submitting ? 'در حال افزودن...' : 'افزودن حساب' }}</span>
            </button>
          </form>
        </aside>
      </div>
    </template>
  </div>
</template>
