<script setup lang="ts">
const { money } = usePersian()
const { data, pending, refresh } = useFetch('/api/accounts', { credentials: 'include', lazy: true })

interface AccountItem {
  id: string
  name: string
  type: string
  currency: string
  balanceMinor: string
}

const accounts = computed(() => (data.value?.accounts ?? []) as AccountItem[])
const form = reactive({ name: '', type: 'bank', initialBalanceMinor: '0' })
const error = ref('')
const success = ref('')
const accountTypes = [
  { value: 'bank', label: 'بانک' },
  { value: 'cash', label: 'نقدی' },
  { value: 'wallet', label: 'کیف پول' },
  { value: 'credit_card', label: 'کارت اعتباری' },
  { value: 'other', label: 'سایر' }
]

async function createAccount() {
  error.value = ''
  success.value = ''
  try {
    await $fetch('/api/accounts', { method: 'POST', body: { ...form, currency: 'IRR' } })
    form.name = ''
    form.type = 'bank'
    form.initialBalanceMinor = '0'
    success.value = 'حساب اضافه شد.'
    await refresh()
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'ثبت حساب ناموفق بود.'
  }
}

async function removeAccount(id: string) {
  await $fetch(`/api/accounts/${id}`, { method: 'DELETE' })
  await refresh()
}
</script>

<template>
  <div class="space-y-5">
    <div>
      <p class="text-sm font-semibold text-slate-500">موجودی از تراکنش‌ها محاسبه می‌شود</p>
      <h1 class="text-2xl font-black text-slate-950">حساب‌ها</h1>
    </div>

    <form class="mobile-card p-4" @submit.prevent="createAccount">
      <h2 class="text-lg font-bold">حساب جدید</h2>
      <div class="mt-4 grid gap-3 sm:grid-cols-3">
        <label class="block sm:col-span-1">
          <span class="text-sm font-medium">نام حساب</span>
          <input v-model="form.name" class="field mt-2" placeholder="مثلاً بانک ملت" required>
        </label>
        <label class="block">
          <span class="text-sm font-medium">نوع</span>
          <SharedSelect v-model="form.type" :options="accountTypes" class="mt-2" />
        </label>
        <SharedMoneyInput v-model="form.initialBalanceMinor" label="موجودی اولیه" required />
      </div>
      <p v-if="error" class="mt-4 rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{{ error }}</p>
      <p v-if="success" class="mt-4 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">{{ success }}</p>
      <button class="btn-primary mt-4 w-full sm:w-auto">
        <UIcon name="i-lucide-plus" class="btn-icon" />
        <span>افزودن حساب</span>
      </button>
    </form>

    <SharedLoadingState v-if="pending" title="در حال دریافت حساب‌ها" />

    <section v-else class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <article v-for="account in accounts" :key="account.id" class="mobile-card p-4">
        <div class="flex items-start justify-between gap-4">
          <div class="min-w-0">
            <h2 class="truncate font-bold">{{ account.name }}</h2>
            <p class="mt-1 text-sm text-slate-500">{{ account.type }}</p>
          </div>
          <button class="icon-danger-button" type="button" aria-label="حذف حساب" title="حذف حساب" @click="removeAccount(account.id)">
            <UIcon name="i-lucide-trash-2" class="size-4" />
          </button>
        </div>
        <div class="money-value mt-5 text-2xl font-black leading-tight text-teal-950">{{ money(account.balanceMinor, account.currency) }}</div>
      </article>
      <p v-if="!accounts.length" class="mobile-card p-8 text-center text-sm text-slate-500 sm:col-span-2 lg:col-span-3">حسابی ثبت نشده است.</p>
    </section>
  </div>
</template>
