<script setup lang="ts">
definePageMeta({ layout: 'default' })

type AdminPanel = 'overview' | 'users' | 'activity'

interface AdminUser {
  id: string
  name: string
  email: string
  phone: string | null
  createdAt: string
  accountCount: number
  transactionCount: number
  groupCount: number
}

interface AdminTransaction {
  id: string
  userName: string
  userEmail: string
  type: 'income' | 'expense'
  amountMinor: string
  description: string
  date: string
  accountName: string
  categoryName: string
}

interface AdminGroup {
  id: string
  name: string
  description: string
  ownerName: string
  ownerEmail: string
  createdAt: string
}

interface AdminDetail {
  user: {
    id: string
    name: string
    email: string
    phone: string | null
    createdAt: string
  }
  summary: {
    accountCount: number
    categoryCount: number
    transactionCount: number
    transferCount: number
    groupCount: number
    ownedGroupCount: number
    paidGroupExpenseCount: number
    incomeMinor: string
    expenseMinor: string
    pendingShares: number
    paidShares: number
    pendingShareMinor: string
  }
  accounts: Array<{ id: string; name: string; type: string; balanceMinor: string }>
  transactions: Array<{ id: string; type: 'income' | 'expense'; amountMinor: string; description: string; date: string; accountName: string; categoryName: string }>
  memberships: Array<{ groupId: string; groupName: string; role: string }>
  notifications: Array<{ id: string; title: string; body: string; isRead: boolean; createdAt: string }>
}

const { money, date, number } = usePersian()
const { data, pending, refresh } = useFetch('/api/admin', { credentials: 'include', lazy: true })

const activePanel = ref<AdminPanel>('overview')
const selectedUserId = ref('')
const detail = ref<AdminDetail | null>(null)
const detailPending = ref(false)
const detailError = ref('')

const summary = computed(() => data.value?.summary ?? {
  users: 0,
  accounts: 0,
  transactions: 0,
  transfers: 0,
  groups: 0,
  groupExpenses: 0,
  pendingShares: 0,
  notifications: 0,
  incomeMinor: '0',
  expenseMinor: '0'
})
const users = computed(() => (data.value?.users ?? []) as AdminUser[])
const recentTransactions = computed(() => (data.value?.recentTransactions ?? []) as unknown as AdminTransaction[])
const recentGroups = computed(() => (data.value?.recentGroups ?? []) as unknown as AdminGroup[])
const netMinor = computed(() => (BigInt(summary.value.incomeMinor) - BigInt(summary.value.expenseMinor)).toString())

const stats = computed(() => [
  { label: 'کاربر', value: number(summary.value.users), icon: 'i-lucide-users' },
  { label: 'حساب', value: number(summary.value.accounts), icon: 'i-lucide-wallet-cards' },
  { label: 'تراکنش', value: number(summary.value.transactions), icon: 'i-lucide-receipt-text' },
  { label: 'گروه', value: number(summary.value.groups), icon: 'i-lucide-users-round' }
])

const tabs = [
  { key: 'overview' as const, label: 'نمای کلی', icon: 'i-lucide-layout-dashboard' },
  { key: 'users' as const, label: 'کاربران', icon: 'i-lucide-users' },
  { key: 'activity' as const, label: 'فعالیت', icon: 'i-lucide-activity' }
]

watch(users, () => {
  if (!selectedUserId.value && users.value[0]) {
    selectUser(users.value[0].id)
  }
}, { immediate: true })

async function selectUser(userId: string) {
  if (!userId || detailPending.value) return
  selectedUserId.value = userId
  detailPending.value = true
  detailError.value = ''
  try {
    detail.value = await $fetch<AdminDetail>(`/api/admin/users/${userId}`, { credentials: 'include' })
  } catch (err) {
    const apiError = err as { data?: { statusMessage?: string }; message?: string }
    detailError.value = apiError.data?.statusMessage || apiError.message || 'دریافت جزئیات کاربر ناموفق بود.'
  } finally {
    detailPending.value = false
  }
}

function userInitial(name: string) {
  return name.trim().slice(0, 1) || 'ک'
}

function panelClass(panel: AdminPanel) {
  return activePanel.value === panel ? 'block' : 'hidden lg:block'
}

function refreshAdminData() {
  refresh()
}
</script>

<template>
  <div class="space-y-4">
    <section class="overflow-hidden rounded-[20px] bg-[linear-gradient(135deg,#062f2b,#0f766e_56%,#d99b2b_135%)] text-white shadow-xl shadow-teal-900/15">
      <div class="p-4 sm:p-5">
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <p class="text-xs font-black text-white/70">پنل مدیریت اصلی</p>
            <h1 class="mt-1 text-2xl font-black">مدیریت میفین</h1>
            <p class="mt-2 max-w-2xl text-sm leading-6 text-white/78">نمای کلی کاربران، حساب‌ها، تراکنش‌ها، گروه‌ها و وضعیت دنگ‌ها برای پشتیبانی و کنترل سیستم.</p>
          </div>
          <button type="button" class="inline-flex size-11 shrink-0 items-center justify-center rounded-2xl bg-white/12 ring-1 ring-white/20 active:scale-95" aria-label="به‌روزرسانی" @click="refreshAdminData">
            <UIcon name="i-lucide-refresh-cw" class="size-5" />
          </button>
        </div>

        <div class="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <div v-for="item in stats" :key="item.label" class="rounded-2xl bg-white/12 p-3 ring-1 ring-white/15">
            <UIcon :name="item.icon" class="size-4 text-amber-100" />
            <span class="mt-2 block text-[11px] font-bold text-white/68">{{ item.label }}</span>
            <strong class="mt-1 block text-lg font-black">{{ item.value }}</strong>
          </div>
        </div>
      </div>
    </section>

    <nav class="filter-summary lg:hidden">
      <div class="grid grid-cols-3 gap-2 rounded-2xl border border-teal-100 bg-white/94 p-2 shadow-lg shadow-teal-900/5 backdrop-blur">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          type="button"
          class="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl text-sm font-black transition"
          :class="activePanel === tab.key ? 'bg-teal-700 text-white shadow-lg shadow-teal-900/15' : 'text-slate-600'"
          @click="activePanel = tab.key"
        >
          <UIcon :name="tab.icon" class="size-4" />
          <span>{{ tab.label }}</span>
        </button>
      </div>
    </nav>

    <SharedLoadingState v-if="pending" title="در حال دریافت اطلاعات مدیریت" />

    <template v-else>
      <div class="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(360px,0.8fr)] lg:items-start">
        <section class="space-y-4">
          <div class="grid gap-3 sm:grid-cols-3" :class="panelClass('overview')">
            <article class="mobile-card p-4">
              <span class="text-xs font-black text-slate-500">درآمد کل ثبت‌شده</span>
              <strong class="money-value mt-2 block text-xl font-black text-emerald-700">{{ money(summary.incomeMinor) }}</strong>
            </article>
            <article class="mobile-card p-4">
              <span class="text-xs font-black text-slate-500">هزینه کل ثبت‌شده</span>
              <strong class="money-value mt-2 block text-xl font-black text-rose-700">{{ money(summary.expenseMinor) }}</strong>
            </article>
            <article class="mobile-card p-4">
              <span class="text-xs font-black text-slate-500">خالص سیستم</span>
              <strong class="money-value mt-2 block text-xl font-black text-teal-800">{{ money(netMinor) }}</strong>
            </article>
          </div>

          <section class="space-y-3" :class="panelClass('users')">
            <div class="flex items-center justify-between gap-3">
              <h2 class="text-lg font-black text-slate-950">کاربران اخیر</h2>
              <span class="rounded-full bg-teal-50 px-2.5 py-1 text-xs font-black text-teal-700">{{ number(users.length) }}</span>
            </div>
            <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              <button
                v-for="item in users"
                :key="item.id"
                type="button"
                class="mobile-card p-4 text-right transition hover:border-teal-200 hover:shadow-xl hover:shadow-teal-900/10"
                :class="{ 'border-teal-300 bg-teal-50/60': selectedUserId === item.id }"
                @click="selectUser(item.id)"
              >
                <span class="flex items-start gap-3">
                  <span class="inline-flex size-11 shrink-0 items-center justify-center rounded-2xl bg-teal-700 font-black text-white">{{ userInitial(item.name) }}</span>
                  <span class="min-w-0 flex-1">
                    <strong class="block truncate text-base font-black text-slate-950">{{ item.name }}</strong>
                    <span class="ltr mt-1 block truncate text-xs font-bold text-slate-500">{{ item.email }}</span>
                    <span class="ltr mt-1 block truncate text-xs font-bold text-slate-400">{{ item.phone || 'بدون موبایل' }}</span>
                  </span>
                </span>
                <span class="mt-4 grid grid-cols-3 gap-2 text-center">
                  <span class="rounded-xl bg-white p-2 text-xs font-black text-slate-600">{{ number(item.accountCount) }} حساب</span>
                  <span class="rounded-xl bg-white p-2 text-xs font-black text-slate-600">{{ number(item.transactionCount) }} تراکنش</span>
                  <span class="rounded-xl bg-white p-2 text-xs font-black text-slate-600">{{ number(item.groupCount) }} گروه</span>
                </span>
              </button>
            </div>
          </section>

          <section class="space-y-3" :class="panelClass('activity')">
            <h2 class="text-lg font-black text-slate-950">فعالیت‌های اخیر</h2>
            <div class="grid gap-3 xl:grid-cols-2">
              <article class="mobile-card p-4">
                <h3 class="font-black text-slate-950">تراکنش‌های اخیر</h3>
                <div class="mt-3 space-y-2">
                  <div v-for="item in recentTransactions" :key="item.id" class="rounded-2xl bg-slate-50 p-3">
                    <div class="flex items-center justify-between gap-3">
                      <span class="truncate font-black text-slate-950">{{ item.userName }}</span>
                      <span class="money-value shrink-0 font-black" :class="item.type === 'income' ? 'text-emerald-700' : 'text-rose-700'">{{ money(item.amountMinor) }}</span>
                    </div>
                    <p class="mt-1 truncate text-xs font-bold text-slate-500">{{ item.categoryName }} · {{ item.accountName }} · {{ date(item.date) }}</p>
                  </div>
                </div>
              </article>

              <article class="mobile-card p-4">
                <h3 class="font-black text-slate-950">گروه‌های اخیر</h3>
                <div class="mt-3 space-y-2">
                  <div v-for="item in recentGroups" :key="item.id" class="rounded-2xl bg-slate-50 p-3">
                    <div class="flex items-center justify-between gap-3">
                      <span class="truncate font-black text-slate-950">{{ item.name }}</span>
                      <span class="text-xs font-bold text-slate-500">{{ date(item.createdAt) }}</span>
                    </div>
                    <p class="mt-1 truncate text-xs font-bold text-slate-500">{{ item.ownerName }} · {{ item.ownerEmail }}</p>
                  </div>
                </div>
              </article>
            </div>
          </section>
        </section>

        <aside class="lg:sticky lg:top-5">
          <section class="mobile-card p-4">
            <div class="flex items-center justify-between gap-3">
              <h2 class="text-lg font-black text-slate-950">جزئیات کاربر</h2>
              <UIcon v-if="detailPending" name="i-lucide-loader-circle" class="size-5 animate-spin text-teal-700" />
            </div>
            <p v-if="detailError" class="mt-3 rounded-xl bg-rose-50 p-3 text-sm font-bold text-rose-700">{{ detailError }}</p>

            <template v-if="detail">
              <div class="mt-4 rounded-2xl bg-teal-50 p-3">
                <h3 class="font-black text-teal-950">{{ detail.user.name }}</h3>
                <p class="ltr mt-1 text-xs font-bold text-teal-800">{{ detail.user.email }}</p>
                <p class="ltr mt-1 text-xs font-bold text-teal-700">{{ detail.user.phone || 'بدون موبایل' }}</p>
              </div>

              <div class="mt-3 grid grid-cols-2 gap-2">
                <div class="rounded-2xl bg-slate-50 p-3">
                  <span class="text-xs font-bold text-slate-500">حساب</span>
                  <strong class="mt-1 block font-black text-slate-950">{{ number(detail.summary.accountCount) }}</strong>
                </div>
                <div class="rounded-2xl bg-slate-50 p-3">
                  <span class="text-xs font-bold text-slate-500">تراکنش</span>
                  <strong class="mt-1 block font-black text-slate-950">{{ number(detail.summary.transactionCount) }}</strong>
                </div>
                <div class="rounded-2xl bg-slate-50 p-3">
                  <span class="text-xs font-bold text-slate-500">دنگ pending</span>
                  <strong class="money-value mt-1 block font-black text-rose-700">{{ money(detail.summary.pendingShareMinor) }}</strong>
                </div>
                <div class="rounded-2xl bg-slate-50 p-3">
                  <span class="text-xs font-bold text-slate-500">گروه</span>
                  <strong class="mt-1 block font-black text-slate-950">{{ number(detail.summary.groupCount) }}</strong>
                </div>
              </div>

              <div class="mt-4 space-y-3">
                <div>
                  <h3 class="text-sm font-black text-slate-950">حساب‌ها</h3>
                  <div class="mt-2 space-y-2">
                    <div v-for="account in detail.accounts" :key="account.id" class="flex items-center justify-between gap-3 rounded-xl bg-slate-50 p-3">
                      <span class="truncate text-sm font-black text-slate-700">{{ account.name }}</span>
                      <span class="money-value shrink-0 text-sm font-black text-teal-800">{{ money(account.balanceMinor) }}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 class="text-sm font-black text-slate-950">آخرین تراکنش‌ها</h3>
                  <div class="mt-2 space-y-2">
                    <div v-for="item in detail.transactions.slice(0, 6)" :key="item.id" class="rounded-xl bg-slate-50 p-3">
                      <div class="flex items-center justify-between gap-3">
                        <span class="truncate text-sm font-black text-slate-700">{{ item.categoryName }}</span>
                        <span class="money-value shrink-0 text-sm font-black" :class="item.type === 'income' ? 'text-emerald-700' : 'text-rose-700'">{{ money(item.amountMinor) }}</span>
                      </div>
                      <p class="mt-1 truncate text-xs font-bold text-slate-500">{{ item.accountName }} · {{ date(item.date) }}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 class="text-sm font-black text-slate-950">گروه‌ها</h3>
                  <div class="mt-2 flex flex-wrap gap-2">
                    <span v-for="item in detail.memberships" :key="item.groupId" class="rounded-full bg-teal-50 px-3 py-1.5 text-xs font-black text-teal-800">{{ item.groupName }} · {{ item.role }}</span>
                  </div>
                </div>
              </div>
            </template>
          </section>
        </aside>
      </div>
    </template>
  </div>
</template>
