<script setup lang="ts">
type GroupPanel = 'expenses' | 'new' | 'invite' | 'members'

const route = useRoute()
const groupId = computed(() => String(route.params.id))
const { money, date, number } = usePersian()
const { data: meData } = await useFetch('/api/auth/me', { key: 'current-user', credentials: 'include' })
const { data, pending, refresh } = useFetch(() => `/api/groups/${groupId.value}`, { credentials: 'include', lazy: true })
const { data: accountsData } = useFetch('/api/accounts', { credentials: 'include', lazy: true })

interface MemberItem {
  userId: string
  name: string
  email: string
  phone: string | null
  role: string
}

interface ExpenseShare {
  id: string
  userId: string
  userName: string
  amountMinor: string
  status: 'pending' | 'paid'
}

interface ExpenseItem {
  id: string
  title: string
  description: string
  amountMinor: string
  payerCardNumber: string | null
  payerCardNote: string
  date: string
  splitMode: 'equal' | 'custom'
  payerId: string
  creatorId: string
  payerName: string
  myShareId: string | null
  myShareMinor: string
  myShareStatus: 'pending' | 'paid' | null
  paidCount: number
  shareCount: number
  shares: ExpenseShare[]
}

interface SearchUser {
  id: string
  name: string
  email: string
  phone: string | null
}

interface AccountItem {
  id: string
  name: string
}

const currentUserId = computed(() => meData.value?.user?.id ?? '')
const group = computed(() => data.value?.group)
const members = computed(() => (data.value?.members ?? []) as unknown as MemberItem[])
const expenses = computed(() => (data.value?.expenses ?? []) as unknown as ExpenseItem[])
const memberOptions = computed(() => members.value.map((member) => ({ value: member.userId, label: member.name })))
const accounts = computed(() => (accountsData.value?.accounts ?? []) as unknown as AccountItem[])
const accountOptions = computed(() => accounts.value.map((account) => ({ value: account.id, label: account.name })))
const currentMember = computed(() => members.value.find((member) => member.userId === currentUserId.value))

const activePanel = ref<GroupPanel>('expenses')
const expandedExpenseId = ref('')
const inviteQuery = ref('')
const searchResults = ref<SearchUser[]>([])
const searchLoading = ref(false)
const invitingUserId = ref('')
const inviteError = ref('')
const inviteSuccess = ref('')

const expenseForm = reactive({
  payerId: '',
  title: '',
  description: '',
  amountMinor: '',
  date: new Date().toISOString().slice(0, 10),
  splitMode: 'equal',
  participantIds: [] as string[],
  shares: {} as Record<string, string>
})

const expenseLoading = ref(false)
const expenseError = ref('')
const payNotes = reactive<Record<string, string>>({})
const payAccountIds = reactive<Record<string, string>>({})
const payingShareId = ref('')
const confirmingShareId = ref('')
const editingExpenseId = ref('')
const editLoadingId = ref('')
const deletingExpenseId = ref('')
const editForms = reactive<Record<string, {
  splitMode: 'equal' | 'custom'
  participantIds: string[]
  shares: Record<string, string>
}>>({})
const cardForms = reactive<Record<string, { cardNumber: string; note: string }>>({})
const cardLoadingId = ref('')
const cardMessages = reactive<Record<string, string>>({})
const newExpenseSection = ref<HTMLElement | null>(null)
const expenseTitleInput = ref<HTMLInputElement | null>(null)

const settledExpenses = computed(() => expenses.value.filter((expense) => expenseSettled(expense)).length)
const totalPendingMinor = computed(() => expenses.value.reduce((total, expense) => total + BigInt(expensePendingMinor(expense)), BigInt(0)).toString())
const myPendingExpenses = computed(() => expenses.value.filter((expense) => expense.payerId !== currentUserId.value && expense.myShareStatus === 'pending'))
const tabs = computed(() => [
  { key: 'expenses' as const, label: 'خرج‌ها', icon: 'i-lucide-receipt-text', badge: expenses.value.length },
  { key: 'new' as const, label: 'ثبت خرج', icon: 'i-lucide-plus', badge: 0 },
  { key: 'invite' as const, label: 'دعوت', icon: 'i-lucide-user-plus', badge: searchResults.value.length },
  { key: 'members' as const, label: 'اعضا', icon: 'i-lucide-users', badge: members.value.length }
])

watch(members, () => {
  if (!expenseForm.payerId) expenseForm.payerId = currentUserId.value || members.value[0]?.userId || ''
  if (!expenseForm.participantIds.length) {
    expenseForm.participantIds = members.value.map((member) => member.userId)
  }
}, { immediate: true })

watch(accounts, () => {
  const firstAccountId = accounts.value[0]?.id || ''
  if (!firstAccountId) return
  for (const expense of expenses.value) {
    if (expense.myShareId && !payAccountIds[expense.myShareId]) {
      payAccountIds[expense.myShareId] = firstAccountId
    }
  }
}, { immediate: true })

watch(expenses, () => {
  const firstAccountId = accounts.value[0]?.id || ''
  if (!firstAccountId) return
  for (const expense of expenses.value) {
    if (expense.myShareId && !payAccountIds[expense.myShareId]) {
      payAccountIds[expense.myShareId] = firstAccountId
    }
  }
}, { immediate: true })

function panelClass(panel: GroupPanel) {
  return activePanel.value === panel ? 'block' : 'hidden lg:block'
}

function memberInitial(name: string) {
  return name.trim().slice(0, 1) || 'م'
}

function openNewExpensePanel() {
  activePanel.value = 'new'
  expenseError.value = ''
  nextTick(() => {
    newExpenseSection.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    expenseTitleInput.value?.focus({ preventScroll: true })
  })
}

function selectedPayAccountId(expense: ExpenseItem) {
  return expense.myShareId ? payAccountIds[expense.myShareId] || '' : ''
}

function setPayAccountId(expense: ExpenseItem, accountId: string) {
  if (expense.myShareId) payAccountIds[expense.myShareId] = accountId
}

function toggleExpense(id: string) {
  expandedExpenseId.value = expandedExpenseId.value === id ? '' : id
}

async function searchUsers() {
  inviteError.value = ''
  inviteSuccess.value = ''
  const q = inviteQuery.value.trim()
  const normalizedPhone = q.replace(/[^\d۰-۹٠-٩]/g, '')
  const looksLikePhone = /^(09|9|\+98|0098|98|۰۹|۹|٠٩|٩)/.test(q)
  if (q.length < 2 || (looksLikePhone && normalizedPhone.length < 10)) {
    searchResults.value = []
    return
  }

  searchLoading.value = true
  try {
    const response = await $fetch<{ users: SearchUser[] }>('/api/users/search', { query: { q }, credentials: 'include' })
    const existingIds = new Set(members.value.map((member) => member.userId))
    searchResults.value = response.users.filter((user) => !existingIds.has(user.id))
  } catch (err) {
    const apiError = err as { data?: { statusMessage?: string }; message?: string }
    inviteError.value = apiError.data?.statusMessage || apiError.message || 'جستجوی کاربر ناموفق بود.'
  } finally {
    searchLoading.value = false
  }
}

let searchTimer: ReturnType<typeof setTimeout> | undefined
watch(inviteQuery, () => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(searchUsers, 280)
})

async function inviteUser(user: SearchUser) {
  invitingUserId.value = user.id
  inviteError.value = ''
  inviteSuccess.value = ''
  try {
    await $fetch(`/api/groups/${groupId.value}/invitations`, { method: 'POST', body: { userId: user.id } })
    inviteSuccess.value = `${user.name} دعوت شد.`
    inviteQuery.value = ''
    searchResults.value = []
  } catch (err) {
    const apiError = err as { data?: { statusMessage?: string }; message?: string }
    inviteError.value = apiError.data?.statusMessage || apiError.message || 'دعوت کاربر ناموفق بود.'
  } finally {
    invitingUserId.value = ''
  }
}

function expenseSettled(expense: ExpenseItem) {
  return expense.shares.length > 0 && expense.shares.every((share) => share.status === 'paid')
}

function expensePendingMinor(expense: ExpenseItem) {
  return expense.shares
    .filter((share) => share.userId !== expense.payerId && share.status === 'pending')
    .reduce((total, share) => total + BigInt(share.amountMinor), BigInt(0))
    .toString()
}

function shareRoleLabel(expense: ExpenseItem, share: ExpenseShare) {
  if (share.userId === expense.payerId) return 'بستانکار'
  return share.status === 'paid' ? 'پرداخت کرده' : 'بدهکار'
}

function toggleParticipant(userId: string) {
  if (expenseForm.participantIds.includes(userId)) {
    expenseForm.participantIds = expenseForm.participantIds.filter((id) => id !== userId)
  } else {
    expenseForm.participantIds = [...expenseForm.participantIds, userId]
  }
}

function toggleEditParticipant(expenseId: string, userId: string) {
  const form = editForms[expenseId]
  if (!form) return
  form.participantIds = form.participantIds.includes(userId)
    ? form.participantIds.filter((id) => id !== userId)
    : [...form.participantIds, userId]
}

function canManageExpense(expense: ExpenseItem) {
  return expense.creatorId === currentUserId.value || ['owner', 'admin'].includes(currentMember.value?.role ?? '')
}

function openEditExpense(expense: ExpenseItem) {
  expandedExpenseId.value = expense.id
  editingExpenseId.value = editingExpenseId.value === expense.id ? '' : expense.id
  editForms[expense.id] = {
    splitMode: expense.splitMode,
    participantIds: expense.shares.map((share) => share.userId),
    shares: Object.fromEntries(expense.shares.map((share) => [share.userId, share.amountMinor]))
  }
}

function getEditForm(expenseId: string) {
  return editForms[expenseId] ?? (editForms[expenseId] = {
    splitMode: 'equal',
    participantIds: [],
    shares: {}
  })
}

function getCardForm(expense: ExpenseItem) {
  return cardForms[expense.id] ?? (cardForms[expense.id] = {
    cardNumber: expense.payerCardNumber ?? '',
    note: expense.payerCardNote ?? ''
  })
}

function resetExpenseForm() {
  expenseForm.title = ''
  expenseForm.description = ''
  expenseForm.amountMinor = ''
  expenseForm.shares = {}
  expenseForm.participantIds = members.value.map((member) => member.userId)
}

async function createExpense() {
  if (expenseLoading.value) return
  expenseLoading.value = true
  expenseError.value = ''
  try {
    const body = {
      payerId: expenseForm.payerId,
      title: expenseForm.title,
      description: expenseForm.description,
      amountMinor: expenseForm.amountMinor,
      date: expenseForm.date,
      splitMode: expenseForm.splitMode,
      participantIds: expenseForm.participantIds,
      shares: expenseForm.splitMode === 'custom'
        ? expenseForm.participantIds.map((userId) => ({ userId, amountMinor: expenseForm.shares[userId] || '0' }))
        : []
    }

    await $fetch(`/api/groups/${groupId.value}/expenses`, { method: 'POST', body })
    resetExpenseForm()
    activePanel.value = 'expenses'
    await refresh()
  } catch (err) {
    const apiError = err as { data?: { statusMessage?: string }; message?: string }
    expenseError.value = apiError.data?.statusMessage || apiError.message || 'ثبت خرج گروهی ناموفق بود.'
  } finally {
    expenseLoading.value = false
  }
}

async function updateExpenseShares(expense: ExpenseItem) {
  const form = editForms[expense.id]
  if (!form || editLoadingId.value) return
  editLoadingId.value = expense.id
  try {
    await $fetch(`/api/groups/${groupId.value}/expenses/${expense.id}`, {
      method: 'PATCH',
      body: {
        splitMode: form.splitMode,
        participantIds: form.participantIds,
        shares: form.splitMode === 'custom'
          ? form.participantIds.map((userId) => ({ userId, amountMinor: form.shares[userId] || '0' }))
          : []
      }
    })
    editingExpenseId.value = ''
    await refresh()
  } finally {
    editLoadingId.value = ''
  }
}

async function deleteExpense(expense: ExpenseItem) {
  if (deletingExpenseId.value) return
  deletingExpenseId.value = expense.id
  try {
    await $fetch(`/api/groups/${groupId.value}/expenses/${expense.id}`, { method: 'DELETE' })
    await refresh()
  } finally {
    deletingExpenseId.value = ''
  }
}

async function sendCard(expense: ExpenseItem) {
  const form = cardForms[expense.id]
  if (!form?.cardNumber || cardLoadingId.value) return
  cardLoadingId.value = expense.id
  cardMessages[expense.id] = ''
  try {
    const response = await $fetch<{ notifiedCount: number; cardNumber: string; note: string }>(`/api/groups/${groupId.value}/expenses/${expense.id}/card`, {
      method: 'POST',
      body: form
    })
    cardMessages[expense.id] = response.notifiedCount ? 'شماره کارت برای افراد بدهکار ارسال شد.' : 'فرد بدهکاری برای ارسال شماره کارت وجود ندارد.'
    form.cardNumber = response.cardNumber
    form.note = response.note
    await refresh()
  } finally {
    cardLoadingId.value = ''
  }
}

async function payShare(expense: ExpenseItem) {
  if (!expense.myShareId || payingShareId.value) return
  const accountId = payAccountIds[expense.myShareId]
  if (!accountId) return
  payingShareId.value = expense.myShareId
  try {
    await $fetch(`/api/group-shares/${expense.myShareId}/pay`, {
      method: 'POST',
      body: { note: payNotes[expense.myShareId] || '', accountId }
    })
    payNotes[expense.myShareId] = ''
    await refresh()
  } finally {
    payingShareId.value = ''
  }
}

async function confirmSharePayment(share: ExpenseShare) {
  if (confirmingShareId.value) return
  confirmingShareId.value = share.id
  try {
    await $fetch(`/api/group-shares/${share.id}/pay`, {
      method: 'POST',
      body: { note: 'پرداخت توسط دریافت‌کننده تایید شد.' }
    })
    await refresh()
  } finally {
    confirmingShareId.value = ''
  }
}
</script>

<template>
  <div class="space-y-4">
    <NuxtLink to="/groups" class="inline-flex min-h-10 items-center gap-2 text-sm font-black text-teal-700">
      <UIcon name="i-lucide-chevron-right" class="size-4" />
      <span>بازگشت به گروه‌ها</span>
    </NuxtLink>

    <SharedLoadingState v-if="pending" title="در حال دریافت گروه" />

    <template v-else-if="group">
      <section class="overflow-hidden rounded-[20px] bg-[linear-gradient(135deg,#063c36,#0f766e_58%,#d99b2b_135%)] text-white shadow-xl shadow-teal-900/15">
        <div class="p-4 sm:p-5">
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0">
              <p class="text-xs font-black text-white/70">خرج‌های مشترک</p>
              <h1 class="mt-1 truncate text-2xl font-black">{{ group.name }}</h1>
              <p v-if="group.description" class="mt-2 line-clamp-2 text-sm leading-6 text-white/78">{{ group.description }}</p>
            </div>
            <button type="button" class="inline-flex size-11 shrink-0 items-center justify-center rounded-2xl bg-white/12 ring-1 ring-white/20 active:scale-95" aria-label="ثبت خرج جدید" @click="openNewExpensePanel">
              <UIcon name="i-lucide-plus" class="size-5" />
            </button>
          </div>

          <div class="mt-4 grid grid-cols-3 gap-2">
            <div class="rounded-2xl bg-white/12 p-3 ring-1 ring-white/15">
              <span class="block text-[11px] font-bold text-white/68">خرج</span>
              <strong class="mt-1 block text-lg font-black">{{ number(expenses.length) }}</strong>
            </div>
            <div class="rounded-2xl bg-white/12 p-3 ring-1 ring-white/15">
              <span class="block text-[11px] font-bold text-white/68">تسویه</span>
              <strong class="mt-1 block text-lg font-black">{{ number(settledExpenses) }}</strong>
            </div>
            <div class="rounded-2xl bg-white/12 p-3 ring-1 ring-white/15">
              <span class="block text-[11px] font-bold text-white/68">مانده</span>
              <strong class="money-value mt-1 block truncate text-sm font-black text-amber-100">{{ money(totalPendingMinor) }}</strong>
            </div>
          </div>

          <div v-if="myPendingExpenses.length" class="mt-3 rounded-2xl bg-white/12 p-3 ring-1 ring-white/15">
            <div class="flex items-center justify-between gap-3">
              <span class="text-xs font-black text-white/75">پرداخت‌های منتظر شما</span>
              <span class="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-black text-amber-900">{{ number(myPendingExpenses.length) }} مورد</span>
            </div>
          </div>
        </div>
      </section>

      <nav class="filter-summary lg:hidden">
        <div class="hide-scrollbar flex gap-2 overflow-x-auto rounded-2xl border border-teal-100 bg-white/94 p-2 shadow-lg shadow-teal-900/5 backdrop-blur">
          <button
            v-for="tab in tabs"
            :key="tab.key"
            type="button"
            class="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-xl px-3 text-sm font-black transition"
            :class="activePanel === tab.key ? 'bg-teal-700 text-white shadow-lg shadow-teal-900/15' : 'text-slate-600'"
            @click="activePanel = tab.key"
          >
            <UIcon :name="tab.icon" class="size-4" />
            <span>{{ tab.label }}</span>
            <span v-if="tab.badge" class="rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-black text-amber-800">{{ number(tab.badge) }}</span>
          </button>
        </div>
      </nav>

      <div class="grid gap-4 lg:grid-cols-[minmax(0,1.45fr)_minmax(340px,0.8fr)] lg:items-start">
        <section class="space-y-3" :class="panelClass('expenses')">
          <div class="flex items-center justify-between gap-3">
            <h2 class="text-lg font-black text-slate-950">خرج‌های گروه</h2>
            <button type="button" class="btn-primary min-h-10 px-3 py-2 text-sm lg:hidden" @click="openNewExpensePanel">
              <UIcon name="i-lucide-plus" class="btn-icon" />
              <span>ثبت خرج</span>
            </button>
          </div>

          <article v-for="expense in expenses" :key="expense.id" class="mobile-card group overflow-hidden transition hover:border-teal-200 hover:shadow-xl hover:shadow-teal-900/10">
            <button type="button" class="flex w-full items-start justify-between gap-3 p-4 text-right" :aria-expanded="expandedExpenseId === expense.id" @click="toggleExpense(expense.id)">
              <span class="min-w-0 flex-1">
                <span class="flex flex-wrap items-center gap-2">
                  <span class="truncate font-black text-slate-950">{{ expense.title }}</span>
                  <span class="rounded-full px-2.5 py-1 text-xs font-black" :class="expenseSettled(expense) ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'">
                    {{ expenseSettled(expense) ? 'تسویه شده' : 'منتظر پرداخت' }}
                  </span>
                </span>
                <span class="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-bold text-slate-500">
                  <span class="inline-flex items-center gap-1 rounded-full bg-teal-50 px-2 py-1 text-teal-800">
                    <UIcon name="i-lucide-user" class="size-3.5" />
                    <span class="text-teal-600">پرداخت‌کننده:</span>
                    {{ expense.payerName }}
                  </span>
                  <span>{{ date(expense.date) }}</span>
                  <span>{{ number(expense.paidCount) }}/{{ number(expense.shareCount) }} پرداخت</span>
                </span>
              </span>
              <span class="shrink-0 text-left">
                <span class="money-value block font-black text-slate-950">{{ money(expense.amountMinor) }}</span>
                <span v-if="!expenseSettled(expense)" class="money-value mt-1 block text-xs font-black text-rose-700">{{ money(expensePendingMinor(expense)) }}</span>
              </span>
            </button>

            <div class="border-t border-slate-100 px-4 py-3">
              <div class="hide-scrollbar flex gap-2 overflow-x-auto pb-1">
                <span
                  v-for="share in expense.shares"
                  :key="share.id"
                  class="grid min-w-[132px] shrink-0 gap-1 rounded-2xl border bg-white px-3 py-2 text-xs"
                  :class="share.userId === expense.payerId ? 'border-teal-200 bg-teal-50/70' : share.status === 'paid' ? 'border-emerald-200 bg-emerald-50/60' : 'border-rose-200 bg-rose-50/60'"
                >
                  <span class="flex min-w-0 items-center justify-between gap-2">
                    <span class="truncate font-black text-slate-950">{{ share.userName }}</span>
                    <span class="shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-black" :class="share.userId === expense.payerId ? 'bg-teal-100 text-teal-800' : share.status === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'">
                      {{ shareRoleLabel(expense, share) }}
                    </span>
                  </span>
                  <span class="money-value text-sm font-black" :class="share.userId === expense.payerId ? 'text-teal-800' : share.status === 'paid' ? 'text-emerald-800' : 'text-rose-800'">{{ money(share.amountMinor) }}</span>
                </span>
              </div>
              <button type="button" class="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-xs font-black text-teal-700 transition group-hover:bg-teal-50" @click="toggleExpense(expense.id)">
                <UIcon :name="expandedExpenseId === expense.id ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'" class="size-4" />
                <span>{{ expandedExpenseId === expense.id ? 'بستن جزئیات' : 'مشاهده جزئیات خرجکرد' }}</span>
              </button>
            </div>

            <div v-if="expandedExpenseId === expense.id" class="space-y-3 border-t border-slate-100 bg-slate-50/75 p-4">
              <p v-if="expense.description" class="text-sm leading-6 text-slate-600">{{ expense.description }}</p>

              <div v-if="expense.payerCardNumber" class="rounded-2xl bg-white p-3">
                <div class="flex items-center justify-between gap-3">
                  <span class="text-xs font-black text-slate-500">شماره کارت پرداخت‌کننده</span>
                  <span class="ltr text-sm font-black text-slate-950">{{ expense.payerCardNumber }}</span>
                </div>
                <p v-if="expense.payerCardNote" class="mt-2 text-xs font-bold text-slate-500">{{ expense.payerCardNote }}</p>
              </div>

              <div class="grid gap-2">
                <div v-for="share in expense.shares" :key="share.id" class="rounded-2xl border border-white bg-white p-3">
                  <div class="flex items-center justify-between gap-3">
                    <div class="min-w-0">
                      <div class="flex flex-wrap items-center gap-2">
                        <span class="font-black text-slate-950">{{ share.userName }}</span>
                        <span class="rounded-full px-2 py-0.5 text-xs font-black" :class="share.userId === expense.payerId ? 'bg-teal-50 text-teal-700' : share.status === 'paid' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'">
                          {{ shareRoleLabel(expense, share) }}
                        </span>
                      </div>
                    </div>
                    <span class="money-value shrink-0 font-black text-slate-950">{{ money(share.amountMinor) }}</span>
                  </div>
                  <button
                    v-if="expense.payerId === currentUserId && share.userId !== currentUserId && share.status === 'pending'"
                    class="btn-primary mt-3 w-full disabled:opacity-70"
                    :disabled="confirmingShareId === share.id"
                    @click="confirmSharePayment(share)"
                  >
                    <UIcon :name="confirmingShareId === share.id ? 'i-lucide-loader-circle' : 'i-lucide-check-check'" class="btn-icon" :class="{ 'animate-spin': confirmingShareId === share.id }" />
                    <span>{{ confirmingShareId === share.id ? 'در حال تایید...' : 'پرداخت را تایید می‌کنم' }}</span>
                  </button>
                </div>
              </div>

              <div v-if="expense.payerId === currentUserId" class="rounded-2xl bg-teal-50 p-3">
                <p class="text-sm font-black text-teal-900">ارسال شماره کارت به بدهکارها</p>
                <div class="mt-3 grid gap-2 sm:grid-cols-2">
                  <input v-model="getCardForm(expense).cardNumber" class="field ltr" inputmode="numeric" placeholder="6037 0000 0000 0000">
                  <input v-model="getCardForm(expense).note" class="field" placeholder="یادداشت اختیاری">
                </div>
                <button class="btn-secondary mt-3 w-full disabled:opacity-70" :disabled="cardLoadingId === expense.id" @click="sendCard(expense)">
                  <UIcon :name="cardLoadingId === expense.id ? 'i-lucide-loader-circle' : 'i-lucide-credit-card'" class="btn-icon" :class="{ 'animate-spin': cardLoadingId === expense.id }" />
                  <span>{{ expense.payerCardNumber ? 'به‌روزرسانی و ارسال شماره کارت' : 'ارسال شماره کارت' }}</span>
                </button>
                <p v-if="cardMessages[expense.id]" class="mt-2 text-xs font-bold text-teal-700">{{ cardMessages[expense.id] }}</p>
              </div>

              <div v-if="expense.myShareId && expense.payerId !== currentUserId" class="rounded-2xl bg-white p-3">
                <div class="flex items-center justify-between gap-3">
                  <span class="text-sm font-bold text-slate-600">دنگ شما</span>
                  <span class="money-value font-black" :class="expense.myShareStatus === 'paid' ? 'text-emerald-700' : 'text-rose-700'">{{ money(expense.myShareMinor) }}</span>
                </div>
                <template v-if="expense.myShareStatus === 'pending'">
                  <template v-if="accounts.length">
                    <label class="mt-3 block">
                      <span class="text-sm font-medium">حساب پرداخت</span>
                      <SharedSelect
                        :model-value="selectedPayAccountId(expense)"
                        :options="accountOptions"
                        class="mt-2"
                        @update:model-value="setPayAccountId(expense, $event)"
                      />
                    </label>
                    <input v-model="payNotes[expense.myShareId || '']" class="field mt-3" placeholder="جزئیات پرداخت، مثلا کارت به کارت شد">
                    <p class="mt-2 rounded-xl bg-teal-50 p-3 text-xs font-bold leading-5 text-teal-800">با تایید پرداخت، یک تراکنش هزینه برای همین دنگ در حساب انتخاب‌شده ثبت می‌شود.</p>
                    <button class="btn-primary mt-3 w-full disabled:opacity-70" :disabled="payingShareId === expense.myShareId || !payAccountIds[expense.myShareId || '']" @click="payShare(expense)">
                      <UIcon :name="payingShareId === expense.myShareId ? 'i-lucide-loader-circle' : 'i-lucide-check'" class="btn-icon" :class="{ 'animate-spin': payingShareId === expense.myShareId }" />
                      <span>{{ payingShareId === expense.myShareId ? 'در حال ثبت...' : 'پرداخت کردم' }}</span>
                    </button>
                  </template>
                  <div v-else class="mt-3 rounded-2xl border border-amber-100 bg-amber-50 p-3">
                    <p class="text-sm font-black text-amber-900">برای ثبت پرداخت، اول یک حساب بساز.</p>
                    <p class="mt-1 text-xs font-bold leading-5 text-amber-800">پرداخت دنگ باید در گزارش‌های مالی شما هم ثبت شود.</p>
                    <NuxtLink to="/accounts" class="btn-primary mt-3 w-full min-h-10 text-sm">
                      <UIcon name="i-lucide-wallet-cards" class="btn-icon" />
                      <span>ساخت حساب</span>
                    </NuxtLink>
                  </div>
                </template>
                <p v-else class="mt-3 rounded-xl bg-emerald-50 p-3 text-sm font-bold text-emerald-700">پرداخت شده</p>
              </div>

              <div v-if="canManageExpense(expense)" class="flex gap-2">
                <button class="btn-secondary flex-1" @click="openEditExpense(expense)">
                  <UIcon name="i-lucide-users-round" class="btn-icon" />
                  <span>محاسبه سهم‌ها</span>
                </button>
                <button class="grid size-11 place-items-center rounded-xl border border-rose-200 bg-rose-50 text-rose-700 disabled:opacity-70" :disabled="deletingExpenseId === expense.id" aria-label="حذف خرج" @click="deleteExpense(expense)">
                  <UIcon :name="deletingExpenseId === expense.id ? 'i-lucide-loader-circle' : 'i-lucide-trash-2'" class="size-5" :class="{ 'animate-spin': deletingExpenseId === expense.id }" />
                </button>
              </div>

              <div v-if="editingExpenseId === expense.id && editForms[expense.id]" class="rounded-2xl border border-slate-200 bg-white p-3">
                <div class="grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1">
                  <button type="button" class="min-h-10 rounded-lg text-sm font-bold" :class="getEditForm(expense.id).splitMode === 'equal' ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-500'" @click="getEditForm(expense.id).splitMode = 'equal'">
                    <UIcon name="i-lucide-divide" class="inline-block size-4 align-middle" />
                    <span class="align-middle">مساوی</span>
                  </button>
                  <button type="button" class="min-h-10 rounded-lg text-sm font-bold" :class="getEditForm(expense.id).splitMode === 'custom' ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-500'" @click="getEditForm(expense.id).splitMode = 'custom'">
                    <UIcon name="i-lucide-sliders-horizontal" class="inline-block size-4 align-middle" />
                    <span class="align-middle">سفارشی</span>
                  </button>
                </div>
                <div class="mt-3 grid grid-cols-2 gap-2">
                  <button
                    v-for="member in members"
                    :key="member.userId"
                    type="button"
                    class="min-h-11 rounded-xl border px-2.5 py-2 text-right text-xs font-black sm:p-3 sm:text-sm"
                    :class="getEditForm(expense.id).participantIds.includes(member.userId) ? 'border-teal-700 bg-teal-50 text-teal-900' : 'border-slate-200 bg-white text-slate-600'"
                    @click="toggleEditParticipant(expense.id, member.userId)"
                  >
                    <UIcon :name="getEditForm(expense.id).participantIds.includes(member.userId) ? 'i-lucide-check-circle' : 'i-lucide-circle'" class="ms-2 inline-block size-4 align-middle" />
                    <span class="align-middle">{{ member.name }}</span>
                  </button>
                </div>
                <div v-if="getEditForm(expense.id).splitMode === 'custom'" class="mt-3 space-y-2">
                  <label v-for="member in members.filter((item) => getEditForm(expense.id).participantIds.includes(item.userId))" :key="member.userId" class="block">
                    <span class="text-sm font-medium">سهم {{ member.name }}</span>
                    <input v-model="getEditForm(expense.id).shares[member.userId]" inputmode="numeric" class="field ltr mt-2" placeholder="مثلا 500000">
                  </label>
                </div>
                <button class="btn-primary mt-3 w-full disabled:opacity-70" :disabled="editLoadingId === expense.id" @click="updateExpenseShares(expense)">
                  <UIcon :name="editLoadingId === expense.id ? 'i-lucide-loader-circle' : 'i-lucide-refresh-cw'" class="btn-icon" :class="{ 'animate-spin': editLoadingId === expense.id }" />
                  <span>ذخیره محاسبه جدید</span>
                </button>
              </div>
            </div>
          </article>

          <div v-if="!expenses.length" class="mobile-card p-6 text-center">
            <UIcon name="i-lucide-receipt-text" class="mx-auto size-9 text-teal-700" />
            <p class="mt-2 text-sm font-black text-slate-950">هنوز خرجی ثبت نشده است.</p>
            <button type="button" class="btn-primary mt-4 w-full sm:w-auto" @click="openNewExpensePanel">
              <UIcon name="i-lucide-plus" class="btn-icon" />
              <span>ثبت اولین خرج</span>
            </button>
          </div>
        </section>

        <aside class="space-y-4 lg:sticky lg:top-5">
          <section ref="newExpenseSection" class="mobile-card p-4 scroll-mt-24" :class="panelClass('new')">
            <h2 class="text-lg font-black text-slate-950">ثبت خرج گروهی</h2>
            <form class="mt-4 space-y-4" @submit.prevent="createExpense">
              <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                <label class="block">
                  <span class="text-sm font-medium">عنوان خرج</span>
                  <input ref="expenseTitleInput" v-model="expenseForm.title" class="field mt-2" placeholder="مثلا قهوه" required>
                </label>
                <SharedMoneyInput v-model="expenseForm.amountMinor" label="مبلغ کل" required />
              </div>
              <label class="block">
                <span class="text-sm font-medium">پرداخت‌کننده</span>
                <SharedSelect v-model="expenseForm.payerId" :options="memberOptions" class="mt-2" required />
              </label>
              <SharedJalaliDatePicker v-model="expenseForm.date" label="تاریخ" required />
              <label class="block">
                <span class="text-sm font-medium">شرح</span>
                <input v-model="expenseForm.description" class="field mt-2" placeholder="توضیح اختیاری">
              </label>

              <div>
                <div class="flex items-center justify-between gap-2">
                  <span class="text-sm font-medium">افراد سهیم</span>
                  <button type="button" class="inline-flex items-center gap-1 text-xs font-black text-teal-700" @click="expenseForm.participantIds = members.map((member) => member.userId)">
                    <UIcon name="i-lucide-users" class="size-4" />
                    <span>همه</span>
                  </button>
                </div>
                <div class="mt-2 grid grid-cols-2 gap-2">
                  <button
                    v-for="member in members"
                    :key="member.userId"
                    type="button"
                    class="min-h-11 rounded-xl border px-2.5 py-2 text-right text-xs font-black sm:p-3 sm:text-sm"
                    :class="expenseForm.participantIds.includes(member.userId) ? 'border-teal-700 bg-teal-50 text-teal-900' : 'border-slate-200 bg-white text-slate-600'"
                    @click="toggleParticipant(member.userId)"
                  >
                    <UIcon :name="expenseForm.participantIds.includes(member.userId) ? 'i-lucide-check-circle' : 'i-lucide-circle'" class="ms-2 inline-block size-4 align-middle" />
                    <span class="align-middle">{{ member.name }}</span>
                  </button>
                </div>
              </div>

              <div class="grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1">
                <button type="button" class="min-h-11 rounded-lg text-sm font-bold" :class="expenseForm.splitMode === 'equal' ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-500'" @click="expenseForm.splitMode = 'equal'">
                  <UIcon name="i-lucide-divide" class="inline-block size-4 align-middle" />
                  <span class="align-middle">مساوی</span>
                </button>
                <button type="button" class="min-h-11 rounded-lg text-sm font-bold" :class="expenseForm.splitMode === 'custom' ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-500'" @click="expenseForm.splitMode = 'custom'">
                  <UIcon name="i-lucide-sliders-horizontal" class="inline-block size-4 align-middle" />
                  <span class="align-middle">سفارشی</span>
                </button>
              </div>

              <div v-if="expenseForm.splitMode === 'custom'" class="space-y-2">
                <label v-for="member in members.filter((item) => expenseForm.participantIds.includes(item.userId))" :key="member.userId" class="block">
                  <span class="text-sm font-medium">سهم {{ member.name }}</span>
                  <input v-model="expenseForm.shares[member.userId]" inputmode="numeric" class="field ltr mt-2" placeholder="مثلا 500000">
                </label>
              </div>

              <p v-if="expenseError" class="rounded-xl bg-rose-50 p-3 text-sm font-bold text-rose-700">{{ expenseError }}</p>
              <button class="btn-primary w-full disabled:opacity-70" :disabled="expenseLoading">
                <UIcon :name="expenseLoading ? 'i-lucide-loader-circle' : 'i-lucide-receipt-text'" class="btn-icon" :class="{ 'animate-spin': expenseLoading }" />
                <span>{{ expenseLoading ? 'در حال ثبت...' : 'ثبت خرج گروهی' }}</span>
              </button>
            </form>
          </section>

          <section class="mobile-card p-4" :class="panelClass('invite')">
            <h2 class="text-lg font-black text-slate-950">دعوت عضو</h2>
            <label class="mt-3 block">
              <span class="text-sm font-medium">ایمیل یا شماره موبایل کامل</span>
              <input v-model="inviteQuery" class="field ltr mt-2" placeholder="m@example.com یا 09123456789">
            </label>
            <p class="mt-2 text-xs font-medium text-slate-500">برای حفظ حریم خصوصی، شماره موبایل باید کامل وارد شود.</p>
            <p v-if="inviteError" class="mt-3 rounded-xl bg-rose-50 p-3 text-sm font-bold text-rose-700">{{ inviteError }}</p>
            <p v-if="inviteSuccess" class="mt-3 rounded-xl bg-emerald-50 p-3 text-sm font-bold text-emerald-700">{{ inviteSuccess }}</p>
            <div v-if="searchLoading" class="mt-3 flex items-center gap-2 rounded-xl bg-slate-50 p-3 text-sm font-bold text-slate-600">
              <UIcon name="i-lucide-loader-circle" class="size-4 animate-spin text-teal-700" />
              <span>در حال جستجوی عضو...</span>
            </div>
            <div v-if="searchResults.length" class="mt-3 space-y-2">
              <article v-for="user in searchResults" :key="user.id" class="rounded-2xl border border-slate-100 bg-slate-50/70 p-3">
                <div class="flex items-center justify-between gap-3">
                  <div class="min-w-0">
                    <span class="block truncate font-black text-slate-950">{{ user.name }}</span>
                    <span class="mt-1 block truncate text-xs text-slate-500 ltr">{{ user.email }} · {{ user.phone }}</span>
                  </div>
                  <button type="button" class="btn-primary min-h-10 shrink-0 px-3 text-xs disabled:opacity-70" :disabled="!!invitingUserId" @click="inviteUser(user)">
                    <UIcon :name="invitingUserId === user.id ? 'i-lucide-loader-circle' : 'i-lucide-user-plus'" class="btn-icon" :class="{ 'animate-spin': invitingUserId === user.id }" />
                    <span>{{ invitingUserId === user.id ? 'ارسال...' : 'دعوت' }}</span>
                  </button>
                </div>
              </article>
            </div>
          </section>

          <section class="mobile-card p-4" :class="panelClass('members')">
            <div class="flex items-center justify-between gap-3">
              <h2 class="text-lg font-black text-slate-950">اعضا</h2>
              <span class="rounded-full bg-teal-50 px-2.5 py-1 text-xs font-black text-teal-700">{{ number(members.length) }}</span>
            </div>
            <div class="mt-4 grid gap-2">
              <article v-for="member in members" :key="member.userId" class="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 p-3">
                <span class="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-teal-700 font-black text-white">{{ memberInitial(member.name) }}</span>
                <div class="min-w-0 flex-1">
                  <h3 class="truncate font-black text-slate-950">{{ member.name }}</h3>
                  <p class="mt-1 truncate text-xs text-slate-500 ltr">{{ member.email }} · {{ member.phone }}</p>
                </div>
                <span class="rounded-full bg-white px-2.5 py-1 text-xs font-black text-teal-700">{{ member.role }}</span>
              </article>
            </div>
          </section>
        </aside>
      </div>
    </template>
  </div>
</template>
