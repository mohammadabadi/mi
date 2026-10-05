<script setup lang="ts">
const { money, date } = usePersian()
const filters = reactive({
  type: '',
  search: '',
  accountId: '',
  categoryId: '',
  from: '',
  to: '',
  sort: 'date_desc',
  page: 1
})
const activeForm = ref<'transaction' | 'transfer'>('transaction')
const filtersOpen = ref(false)
const query = computed(() => ({
  page: filters.page,
  limit: 20,
  ...(filters.type ? { type: filters.type } : {}),
  ...(filters.search ? { search: filters.search } : {}),
  ...(filters.accountId ? { accountId: filters.accountId } : {}),
  ...(filters.categoryId ? { categoryId: filters.categoryId } : {}),
  ...(filters.from ? { from: filters.from } : {}),
  ...(filters.to ? { to: filters.to } : {}),
  ...(filters.sort ? { sort: filters.sort } : {})
}))
const { data: transactionsData, pending: transactionsPending, refresh } = useFetch('/api/transactions', { query, credentials: 'include', lazy: true })
const { data: accountsData, pending: accountsPending } = useFetch('/api/accounts', { credentials: 'include', lazy: true })
const { data: categoriesData, pending: categoriesPending } = useFetch('/api/categories', { credentials: 'include', lazy: true })

interface AccountItem {
  id: string
  name: string
}

interface CategoryItem {
  id: string
  name: string
  type: string
}

interface TransactionItem {
  id: string
  kind?: 'transaction' | 'transfer'
  type: 'income' | 'expense' | 'transfer'
  amountMinor: string
  description: string
  date: string
  accountName: string
  categoryName: string
  fromAccountName?: string
  toAccountName?: string
}

const accounts = computed(() => (accountsData.value?.accounts ?? []) as unknown as AccountItem[])
const categories = computed(() => (categoriesData.value?.categories ?? []) as unknown as CategoryItem[])
const transactions = computed(() => (transactionsData.value?.transactions ?? []) as unknown as TransactionItem[])
const accountOptions = computed(() => accounts.value.map((account) => ({ value: account.id, label: account.name })))
const accountFilterOptions = computed(() => [
  { value: '', label: 'همه حساب‌ها' },
  ...accountOptions.value
])
const pagePending = computed(() => transactionsPending.value || accountsPending.value || categoriesPending.value)

const transactionForm = reactive({
  type: 'expense',
  accountId: '',
  categoryId: '',
  amountMinor: '',
  date: new Date().toISOString().slice(0, 10),
  description: ''
})
const transferForm = reactive({
  fromAccountId: '',
  toAccountId: '',
  amountMinor: '',
  date: new Date().toISOString().slice(0, 10),
  description: ''
})
const error = ref('')
const success = ref('')
const transactionSubmitting = ref(false)
const transferSubmitting = ref(false)

const filteredCategories = computed(() => categories.value.filter((category) => category.type === transactionForm.type))
const categoryOptions = computed(() => filteredCategories.value.map((category) => ({ value: category.id, label: category.name })))
const categoryFilterOptions = computed(() => [
  { value: '', label: 'همه دسته‌ها' },
  ...categories.value
    .filter((category) => !filters.type || category.type === filters.type)
    .map((category) => ({ value: category.id, label: category.name }))
])
const typeOptions = [
  { value: 'expense', label: 'هزینه' },
  { value: 'income', label: 'درآمد' }
]
const filterTypeOptions = [
  { value: '', label: 'همه' },
  ...typeOptions
]
const sortOptions = [
  { value: 'date_desc', label: 'جدیدترین' },
  { value: 'date_asc', label: 'قدیمی‌ترین' },
  { value: 'amount_desc', label: 'مبلغ زیاد' },
  { value: 'amount_asc', label: 'مبلغ کم' }
]
const activeFilterCount = computed(() => [
  filters.type,
  filters.search,
  filters.accountId,
  filters.categoryId,
  filters.from,
  filters.to,
  filters.sort !== 'date_desc' ? filters.sort : ''
].filter(Boolean).length)
const hasActiveFilters = computed(() => activeFilterCount.value > 0)
const filterToggleLabel = computed(() => hasActiveFilters.value ? `${activeFilterCount.value} فیلتر فعال` : 'فیلترها')

watch([accountsData, categoriesData], () => {
  transactionForm.accountId ||= accounts.value[0]?.id ?? ''
  transactionForm.categoryId ||= filteredCategories.value[0]?.id ?? ''
  transferForm.fromAccountId ||= accounts.value[0]?.id ?? ''
  transferForm.toAccountId ||= accounts.value[1]?.id ?? ''
}, { immediate: true })

watch(() => transactionForm.type, () => {
  transactionForm.categoryId = filteredCategories.value[0]?.id ?? ''
})

watch(() => filters.type, () => {
  if (filters.categoryId && !categoryFilterOptions.value.some((option) => option.value === filters.categoryId)) {
    filters.categoryId = ''
  }
})

watch(() => [
  filters.type,
  filters.search,
  filters.accountId,
  filters.categoryId,
  filters.from,
  filters.to,
  filters.sort
], () => {
  filters.page = 1
})

function resetFilters() {
  filters.type = ''
  filters.search = ''
  filters.accountId = ''
  filters.categoryId = ''
  filters.from = ''
  filters.to = ''
  filters.sort = 'date_desc'
  filters.page = 1
  filtersOpen.value = false
}

async function createTransaction() {
  if (transactionSubmitting.value) return

  error.value = ''
  success.value = ''
  transactionSubmitting.value = true
  try {
    await $fetch('/api/transactions', { method: 'POST', body: transactionForm })
    transactionForm.amountMinor = ''
    transactionForm.description = ''
    success.value = 'تراکنش ثبت شد.'
    await refresh()
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'ثبت تراکنش ناموفق بود.'
  } finally {
    transactionSubmitting.value = false
  }
}

async function createTransfer() {
  if (transferSubmitting.value) return

  error.value = ''
  success.value = ''
  transferSubmitting.value = true
  try {
    await $fetch('/api/transfers', { method: 'POST', body: transferForm })
    transferForm.amountMinor = ''
    transferForm.description = ''
    success.value = 'انتقال ثبت شد.'
    await refresh()
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'ثبت انتقال ناموفق بود.'
  } finally {
    transferSubmitting.value = false
  }
}

async function removeTransaction(id: string) {
  await $fetch(`/api/transactions/${id}`, { method: 'DELETE' })
  await refresh()
}
</script>

<template>
  <div class="space-y-5">
    <div>
      <p class="text-sm font-semibold text-slate-500">ثبت سریع و مرور روزانه</p>
      <h1 class="text-2xl font-black text-slate-950">تراکنش‌ها</h1>
    </div>

    <section class="mobile-card p-4">
      <div class="grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1">
        <button
          class="min-h-11 rounded-lg text-sm font-bold"
          :class="activeForm === 'transaction' ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-500'"
          @click="activeForm = 'transaction'"
        >
          <UIcon name="i-lucide-receipt-text" class="inline-block size-4 align-middle" />
          <span class="align-middle">درآمد / هزینه</span>
        </button>
        <button
          class="min-h-11 rounded-lg text-sm font-bold"
          :class="activeForm === 'transfer' ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-500'"
          @click="activeForm = 'transfer'"
        >
          <UIcon name="i-lucide-arrow-left-right" class="inline-block size-4 align-middle" />
          <span class="align-middle">انتقال</span>
        </button>
      </div>

      <form v-if="activeForm === 'transaction'" class="mt-4 space-y-4" @submit.prevent="createTransaction">
        <div class="grid grid-cols-2 gap-2">
          <label class="block">
            <span class="text-sm font-medium">نوع</span>
            <SharedSelect v-model="transactionForm.type" :options="typeOptions" class="mt-2" />
          </label>
          <SharedMoneyInput v-model="transactionForm.amountMinor" label="مبلغ" required />
        </div>
        <label class="block">
          <span class="text-sm font-medium">حساب</span>
          <SharedSelect v-model="transactionForm.accountId" :options="accountOptions" class="mt-2" required />
        </label>
        <label class="block">
          <span class="text-sm font-medium">دسته‌بندی</span>
          <SharedSelect v-model="transactionForm.categoryId" :options="categoryOptions" class="mt-2" required />
        </label>
        <div class="grid gap-3 sm:grid-cols-2">
          <SharedJalaliDatePicker v-model="transactionForm.date" label="تاریخ" required />
          <label class="block">
            <span class="text-sm font-medium">شرح</span>
            <input v-model="transactionForm.description" class="field mt-2" placeholder="مثلاً سوپرمارکت">
          </label>
        </div>
        <button class="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-75" :disabled="transactionSubmitting">
          <UIcon :name="transactionSubmitting ? 'i-lucide-loader-circle' : 'i-lucide-plus'" class="btn-icon" :class="{ 'animate-spin': transactionSubmitting }" />
          <span>ثبت تراکنش</span>
        </button>
      </form>

      <form v-else class="mt-4 space-y-4" @submit.prevent="createTransfer">
        <div class="grid gap-3 sm:grid-cols-2">
          <label class="block">
            <span class="text-sm font-medium">از حساب</span>
            <SharedSelect v-model="transferForm.fromAccountId" :options="accountOptions" class="mt-2" required />
          </label>
          <label class="block">
            <span class="text-sm font-medium">به حساب</span>
            <SharedSelect v-model="transferForm.toAccountId" :options="accountOptions" class="mt-2" required />
          </label>
        </div>
        <div class="grid gap-3 sm:grid-cols-2">
          <SharedMoneyInput v-model="transferForm.amountMinor" label="مبلغ انتقال" required />
          <SharedJalaliDatePicker v-model="transferForm.date" label="تاریخ انتقال" required />
        </div>
        <label class="block">
          <span class="text-sm font-medium">شرح</span>
          <input v-model="transferForm.description" class="field mt-2" placeholder="مثلاً انتقال به کیف پول">
        </label>
        <button class="btn-primary w-full bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-75" :disabled="transferSubmitting">
          <UIcon :name="transferSubmitting ? 'i-lucide-loader-circle' : 'i-lucide-arrow-left-right'" class="btn-icon" :class="{ 'animate-spin': transferSubmitting }" />
          <span>ثبت انتقال</span>
        </button>
      </form>

      <p v-if="error" class="mt-4 rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{{ error }}</p>
      <p v-if="success" class="mt-4 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">{{ success }}</p>
    </section>

    <section class="space-y-3">
      <div class="flex items-center justify-between gap-3">
        <div>
          <p class="text-xs font-extrabold text-teal-700">گزارش تراکنش‌ها</p>
          <h2 class="text-xl font-black text-slate-950">آخرین تراکنش‌ها</h2>
        </div>
        <span v-if="hasActiveFilters" class="rounded-full bg-teal-50 px-3 py-1 text-xs font-black text-teal-800">
          {{ activeFilterCount }} فیلتر
        </span>
      </div>

      <div class="mobile-card filter-summary p-2 md:hidden">
        <button
          type="button"
          class="filter-toggle"
          :aria-expanded="filtersOpen"
          @click="filtersOpen = !filtersOpen"
        >
          <span class="inline-flex items-center gap-2">
            <UIcon name="i-lucide-sliders-horizontal" class="size-5 text-teal-700" />
            <span>{{ filterToggleLabel }}</span>
          </span>
          <UIcon name="i-lucide-chevron-down" class="size-5 text-teal-700 transition-transform" :class="{ 'rotate-180': filtersOpen }" />
        </button>
      </div>

      <div class="filter-slide" :class="{ 'is-open': filtersOpen }">
        <div class="mobile-card transaction-filters p-3 sm:p-4">
          <label class="block sm:col-span-2 xl:col-span-3">
            <span class="text-sm font-semibold text-slate-700">جستجو در شرح تراکنش</span>
            <span class="filter-search mt-2">
              <UIcon name="i-lucide-search" class="size-5 text-teal-700" />
              <input v-model="filters.search" placeholder="مثلا سوپرمارکت، تاکسی، حقوق..." class="field">
            </span>
          </label>

          <label class="block">
            <span class="text-sm font-semibold text-slate-700">نوع</span>
            <SharedSelect v-model="filters.type" :options="filterTypeOptions" class="mt-2" />
          </label>

          <label class="block">
            <span class="text-sm font-semibold text-slate-700">حساب</span>
            <SharedSelect v-model="filters.accountId" :options="accountFilterOptions" class="mt-2" />
          </label>

          <label class="block">
            <span class="text-sm font-semibold text-slate-700">دسته‌بندی</span>
            <SharedSelect v-model="filters.categoryId" :options="categoryFilterOptions" class="mt-2" />
          </label>

          <SharedJalaliDatePicker v-model="filters.from" label="از تاریخ" placeholder="شروع بازه" />
          <SharedJalaliDatePicker v-model="filters.to" label="تا تاریخ" placeholder="پایان بازه" />

          <label class="block">
            <span class="text-sm font-semibold text-slate-700">مرتب‌سازی</span>
            <SharedSelect v-model="filters.sort" :options="sortOptions" class="mt-2" />
          </label>

          <button
            v-if="hasActiveFilters"
            type="button"
            class="btn-secondary min-h-12 w-full sm:col-span-2 xl:col-span-1"
            @click="resetFilters"
          >
            <UIcon name="i-lucide-rotate-ccw" class="btn-icon" />
            <span>پاک‌کردن فیلترها</span>
          </button>
        </div>
      </div>

      <SharedLoadingState v-if="pagePending" title="در حال دریافت تراکنش‌ها" />

      <div v-else class="space-y-3 md:hidden">
        <article v-for="transaction in transactions" :key="transaction.id" class="mobile-card p-4">
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0">
              <h3 class="truncate font-bold text-slate-950">{{ transaction.description || transaction.categoryName }}</h3>
              <p class="mt-1 text-sm text-slate-500">{{ transaction.categoryName }} · {{ transaction.accountName }}</p>
              <p class="mt-1 text-xs text-slate-400">{{ date(transaction.date) }}</p>
            </div>
            <div class="shrink-0 text-left">
              <div class="money-value font-black" :class="transaction.type === 'income' ? 'text-emerald-700' : transaction.type === 'transfer' ? 'text-cyan-700' : 'text-rose-700'">
                {{ transaction.type === 'income' ? '+' : transaction.type === 'transfer' ? '' : '-' }}{{ money(transaction.amountMinor) }}
              </div>
              <button v-if="transaction.type !== 'transfer'" class="icon-danger-button mt-3 ms-auto" type="button" aria-label="حذف تراکنش" title="حذف تراکنش" @click="transaction.id && removeTransaction(transaction.id)">
                <UIcon name="i-lucide-trash-2" class="size-4" />
              </button>
            </div>
          </div>
        </article>
        <p v-if="!transactions.length" class="mobile-card p-8 text-center text-sm text-slate-500">تراکنشی ثبت نشده است.</p>
      </div>

      <div v-if="!pagePending" class="hidden overflow-hidden rounded-lg border border-slate-200 bg-white md:block">
        <table class="w-full text-sm">
          <thead class="bg-slate-50 text-slate-500">
            <tr>
              <th class="p-3 text-right">تاریخ</th>
              <th class="p-3 text-right">شرح</th>
              <th class="p-3 text-right">دسته</th>
              <th class="p-3 text-right">حساب</th>
              <th class="p-3 text-right">نوع</th>
              <th class="p-3 text-right">مبلغ</th>
              <th class="p-3 text-right">عملیات</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="transaction in transactions" :key="transaction.id">
              <td class="p-3">{{ date(transaction.date) }}</td>
              <td class="p-3">{{ transaction.description || '-' }}</td>
              <td class="p-3">{{ transaction.categoryName }}</td>
              <td class="p-3">{{ transaction.accountName }}</td>
              <td class="p-3">{{ transaction.type === 'transfer' ? 'انتقال' : transaction.type === 'income' ? 'درآمد' : 'هزینه' }}</td>
              <td class="money-value p-3 font-bold" :class="transaction.type === 'income' ? 'text-emerald-700' : transaction.type === 'transfer' ? 'text-cyan-700' : 'text-rose-700'">
                {{ transaction.type === 'income' ? '+' : transaction.type === 'transfer' ? '' : '-' }}{{ money(transaction.amountMinor) }}
              </td>
              <td class="p-3">
                <button v-if="transaction.type !== 'transfer'" class="inline-flex items-center gap-1 rounded-md border border-slate-300 px-3 py-1" @click="transaction.id && removeTransaction(transaction.id)">
                  <UIcon name="i-lucide-trash-2" class="size-4" />
                  <span>حذف</span>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
        <p v-if="!transactions.length" class="p-8 text-center text-slate-500">تراکنشی ثبت نشده است.</p>
      </div>
    </section>
  </div>
</template>
