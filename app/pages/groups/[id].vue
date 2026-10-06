<script setup lang="ts">
const route = useRoute()
const groupId = computed(() => String(route.params.id))
const { money, date } = usePersian()
const { data: meData } = await useFetch('/api/auth/me', { key: 'current-user', credentials: 'include' })
const { data, pending, refresh } = useFetch(() => `/api/groups/${groupId.value}`, { credentials: 'include', lazy: true })

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

const currentUserId = computed(() => meData.value?.user?.id ?? '')
const group = computed(() => data.value?.group)
const members = computed(() => (data.value?.members ?? []) as unknown as MemberItem[])
const expenses = computed(() => (data.value?.expenses ?? []) as unknown as ExpenseItem[])
const memberOptions = computed(() => members.value.map((member) => ({ value: member.userId, label: member.name })))
const currentMember = computed(() => members.value.find((member) => member.userId === currentUserId.value))

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
const payingShareId = ref('')
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

watch(members, () => {
  if (!expenseForm.payerId) expenseForm.payerId = currentUserId.value || members.value[0]?.userId || ''
  if (!expenseForm.participantIds.length) {
    expenseForm.participantIds = members.value.map((member) => member.userId)
  }
}, { immediate: true })

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

function getCardForm(expenseId: string) {
  return cardForms[expenseId] ?? (cardForms[expenseId] = { cardNumber: '', note: '' })
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
    const response = await $fetch<{ notifiedCount: number }>(`/api/groups/${groupId.value}/expenses/${expense.id}/card`, {
      method: 'POST',
      body: form
    })
    cardMessages[expense.id] = response.notifiedCount ? 'شماره کارت برای افراد بدهکار ارسال شد.' : 'فرد بدهکاری برای ارسال شماره کارت وجود ندارد.'
    form.cardNumber = ''
    form.note = ''
    await refresh()
  } finally {
    cardLoadingId.value = ''
  }
}

async function payShare(expense: ExpenseItem) {
  if (!expense.myShareId || payingShareId.value) return
  payingShareId.value = expense.myShareId
  try {
    await $fetch(`/api/group-shares/${expense.myShareId}/pay`, {
      method: 'POST',
      body: { note: payNotes[expense.myShareId] || '' }
    })
    payNotes[expense.myShareId] = ''
    await refresh()
  } finally {
    payingShareId.value = ''
  }
}
</script>

<template>
  <div class="space-y-5">
    <NuxtLink to="/groups" class="inline-flex min-h-10 items-center gap-2 text-sm font-black text-teal-700">
      <UIcon name="i-lucide-chevron-right" class="size-4" />
      <span>بازگشت به گروه‌ها</span>
    </NuxtLink>

    <SharedLoadingState v-if="pending" title="در حال دریافت گروه" />

    <template v-else-if="group">
      <div>
        <p class="text-sm font-semibold text-teal-700">خرج‌های مشترک</p>
        <h1 class="text-2xl font-black text-slate-950">{{ group.name }}</h1>
        <p v-if="group.description" class="mt-1 text-sm text-slate-500">{{ group.description }}</p>
      </div>

      <section class="mobile-card p-4">
        <h2 class="text-lg font-black text-slate-950">دعوت عضو</h2>
        <label class="mt-3 block">
          <span class="text-sm font-medium">جستجو با ایمیل یا شماره موبایل</span>
          <input v-model="inviteQuery" class="field ltr mt-2" placeholder="ایمیل یا شماره کامل 09123456789">
        </label>
        <p class="mt-2 text-xs font-medium text-slate-500">برای حفظ حریم خصوصی، شماره موبایل فقط بعد از وارد شدن کامل جستجو می‌شود.</p>
        <p v-if="inviteError" class="mt-3 rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{{ inviteError }}</p>
        <p v-if="inviteSuccess" class="mt-3 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">{{ inviteSuccess }}</p>
        <div v-if="searchLoading" class="mt-3 flex items-center gap-2 rounded-xl bg-slate-50 p-3 text-sm font-bold text-slate-600">
          <UIcon name="i-lucide-loader-circle" class="size-4 animate-spin text-teal-700" />
          <span>در حال جستجوی عضو...</span>
        </div>
        <div v-if="searchResults.length" class="mt-3 space-y-2">
          <article v-for="user in searchResults" :key="user.id" class="rounded-xl border border-slate-200 bg-white p-3">
            <div class="flex items-center justify-between gap-3">
              <div class="min-w-0">
                <span class="block font-black text-slate-950">{{ user.name }}</span>
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

      <section class="mobile-card p-4">
        <h2 class="text-lg font-black text-slate-950">ثبت خرج گروهی</h2>
        <form class="mt-4 space-y-4" @submit.prevent="createExpense">
          <div class="grid gap-3 sm:grid-cols-2">
            <label class="block">
              <span class="text-sm font-medium">عنوان خرج</span>
              <input v-model="expenseForm.title" class="field mt-2" placeholder="مثلاً قهوه" required>
            </label>
            <SharedMoneyInput v-model="expenseForm.amountMinor" label="مبلغ کل" required />
          </div>
          <div class="grid gap-3 sm:grid-cols-2">
            <label class="block">
              <span class="text-sm font-medium">پرداخت‌کننده</span>
              <SharedSelect v-model="expenseForm.payerId" :options="memberOptions" class="mt-2" required />
            </label>
            <SharedJalaliDatePicker v-model="expenseForm.date" label="تاریخ" required />
          </div>
          <label class="block">
            <span class="text-sm font-medium">شرح</span>
            <input v-model="expenseForm.description" class="field mt-2" placeholder="توضیح اختیاری">
          </label>

          <div>
            <div class="flex items-center justify-between gap-2">
              <span class="text-sm font-medium">این خرج مربوط به</span>
              <button type="button" class="inline-flex items-center gap-1 text-xs font-black text-teal-700" @click="expenseForm.participantIds = members.map((member) => member.userId)">
                <UIcon name="i-lucide-users" class="size-4" />
                <span>همه اعضا</span>
              </button>
            </div>
            <div class="mt-2 grid gap-2 sm:grid-cols-2">
              <button
                v-for="member in members"
                :key="member.userId"
                type="button"
                class="rounded-xl border p-3 text-right text-sm font-black"
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
              <input v-model="expenseForm.shares[member.userId]" inputmode="numeric" class="field ltr mt-2" placeholder="مثلاً 500000">
            </label>
          </div>

          <p v-if="expenseError" class="rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{{ expenseError }}</p>
          <button class="btn-primary w-full disabled:opacity-70" :disabled="expenseLoading">
            <UIcon :name="expenseLoading ? 'i-lucide-loader-circle' : 'i-lucide-receipt-text'" class="btn-icon" :class="{ 'animate-spin': expenseLoading }" />
            <span>{{ expenseLoading ? 'در حال ثبت...' : 'ثبت خرج گروهی' }}</span>
          </button>
        </form>
      </section>

      <section class="space-y-3">
        <h2 class="text-lg font-black text-slate-950">خرج‌های گروه</h2>
        <article v-for="expense in expenses" :key="expense.id" class="mobile-card p-4">
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0">
              <div class="flex flex-wrap items-center gap-2">
                <h3 class="font-black text-slate-950">{{ expense.title }}</h3>
                <span class="rounded-full px-2.5 py-1 text-xs font-black" :class="expenseSettled(expense) ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'">
                  {{ expenseSettled(expense) ? 'تسویه شده' : 'در انتظار پرداخت' }}
                </span>
              </div>
              <p class="mt-1 text-sm text-slate-500">پرداخت‌کننده: {{ expense.payerName }}</p>
              <p v-if="expense.description" class="mt-1 text-sm text-slate-500">{{ expense.description }}</p>
              <p class="mt-1 text-xs text-slate-400">{{ date(expense.date) }} · {{ expense.paidCount }}/{{ expense.shareCount }} پرداخت شده</p>
            </div>
            <div class="money-value shrink-0 text-left font-black text-slate-950">{{ money(expense.amountMinor) }}</div>
          </div>

          <div class="mt-3 grid gap-2 rounded-xl bg-slate-50 p-3">
            <div class="flex items-center justify-between gap-3">
              <span class="text-sm font-black text-slate-700">مانده قابل دریافت پرداخت‌کننده</span>
              <span class="money-value font-black" :class="expenseSettled(expense) ? 'text-emerald-700' : 'text-rose-700'">{{ money(expensePendingMinor(expense)) }}</span>
            </div>
            <div v-if="expense.payerCardNumber" class="rounded-lg bg-white p-3">
              <div class="flex items-center justify-between gap-3">
                <span class="text-xs font-black text-slate-500">شماره کارت پرداخت‌کننده</span>
                <span class="ltr text-sm font-black text-slate-950">{{ expense.payerCardNumber }}</span>
              </div>
              <p v-if="expense.payerCardNote" class="mt-2 text-xs font-bold text-slate-500">{{ expense.payerCardNote }}</p>
            </div>
          </div>

          <div class="mt-3 space-y-2">
            <div v-for="share in expense.shares" :key="share.id" class="rounded-xl border border-slate-100 bg-white p-3">
              <div class="flex items-center justify-between gap-3">
                <div class="min-w-0">
                  <div class="flex flex-wrap items-center gap-2">
                    <span class="font-black text-slate-950">{{ share.userName }}</span>
                    <span class="rounded-full px-2 py-0.5 text-xs font-black" :class="share.userId === expense.payerId ? 'bg-teal-50 text-teal-700' : share.status === 'paid' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'">
                      {{ shareRoleLabel(expense, share) }}
                    </span>
                  </div>
                  <p class="mt-1 text-xs font-bold" :class="share.status === 'paid' ? 'text-emerald-600' : 'text-amber-600'">
                    {{ share.status === 'paid' ? 'پرداخت شده' : 'در انتظار پرداخت' }}
                  </p>
                </div>
                <span class="money-value shrink-0 font-black text-slate-950">{{ money(share.amountMinor) }}</span>
              </div>
            </div>
          </div>

          <div v-if="expense.payerId === currentUserId" class="mt-4 rounded-xl bg-teal-50 p-3">
            <p class="text-sm font-black text-teal-900">ارسال شماره کارت به افراد بدهکار</p>
            <div class="mt-3 grid gap-2 sm:grid-cols-2">
              <input v-model="getCardForm(expense.id).cardNumber" class="field ltr" inputmode="numeric" placeholder="6037 0000 0000 0000">
              <input v-model="getCardForm(expense.id).note" class="field" placeholder="یادداشت اختیاری">
            </div>
            <button class="btn-secondary mt-3 w-full disabled:opacity-70" :disabled="cardLoadingId === expense.id" @click="sendCard(expense)">
              <UIcon :name="cardLoadingId === expense.id ? 'i-lucide-loader-circle' : 'i-lucide-credit-card'" class="btn-icon" :class="{ 'animate-spin': cardLoadingId === expense.id }" />
              <span>{{ expense.payerCardNumber ? 'به‌روزرسانی و ارسال شماره کارت' : 'ارسال شماره کارت' }}</span>
            </button>
            <p v-if="cardMessages[expense.id]" class="mt-2 text-xs font-bold text-teal-700">{{ cardMessages[expense.id] }}</p>
          </div>

          <div v-if="expense.myShareId && expense.payerId !== currentUserId" class="mt-4 rounded-xl bg-slate-50 p-3">
            <div class="flex items-center justify-between gap-3">
              <span class="text-sm font-bold text-slate-600">دنگ شما</span>
              <span class="money-value font-black" :class="expense.myShareStatus === 'paid' ? 'text-emerald-700' : 'text-rose-700'">{{ money(expense.myShareMinor) }}</span>
            </div>
            <template v-if="expense.myShareStatus === 'pending'">
              <input v-model="payNotes[expense.myShareId]" class="field mt-3" placeholder="جزئیات پرداخت، مثلاً کارت به کارت شد">
              <button class="btn-primary mt-3 w-full disabled:opacity-70" :disabled="payingShareId === expense.myShareId" @click="payShare(expense)">
                <UIcon :name="payingShareId === expense.myShareId ? 'i-lucide-loader-circle' : 'i-lucide-check'" class="btn-icon" :class="{ 'animate-spin': payingShareId === expense.myShareId }" />
                <span>پرداخت کردم</span>
              </button>
            </template>
            <p v-else class="mt-3 rounded-lg bg-emerald-50 p-3 text-sm font-bold text-emerald-700">پرداخت شده</p>
          </div>

          <div v-if="canManageExpense(expense)" class="mt-4 flex gap-2">
            <button class="btn-secondary flex-1" @click="openEditExpense(expense)">
              <UIcon name="i-lucide-users-round" class="btn-icon" />
              <span>محاسبه سهم‌ها</span>
            </button>
            <button class="grid size-11 place-items-center rounded-xl border border-rose-200 bg-rose-50 text-rose-700 disabled:opacity-70" :disabled="deletingExpenseId === expense.id" aria-label="حذف خرج" @click="deleteExpense(expense)">
              <UIcon :name="deletingExpenseId === expense.id ? 'i-lucide-loader-circle' : 'i-lucide-trash-2'" class="size-5" :class="{ 'animate-spin': deletingExpenseId === expense.id }" />
            </button>
          </div>

          <div v-if="editingExpenseId === expense.id && editForms[expense.id]" class="mt-4 rounded-xl border border-slate-200 bg-white p-3">
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
            <div class="mt-3 grid gap-2 sm:grid-cols-2">
              <button
                v-for="member in members"
                :key="member.userId"
                type="button"
                class="rounded-xl border p-3 text-right text-sm font-black"
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
                <input v-model="getEditForm(expense.id).shares[member.userId]" inputmode="numeric" class="field ltr mt-2" placeholder="مثلاً 500000">
              </label>
            </div>
            <button class="btn-primary mt-3 w-full disabled:opacity-70" :disabled="editLoadingId === expense.id" @click="updateExpenseShares(expense)">
              <UIcon :name="editLoadingId === expense.id ? 'i-lucide-loader-circle' : 'i-lucide-refresh-cw'" class="btn-icon" :class="{ 'animate-spin': editLoadingId === expense.id }" />
              <span>ذخیره محاسبه جدید</span>
            </button>
          </div>
        </article>
        <p v-if="!expenses.length" class="mobile-card p-6 text-center text-sm text-slate-500">هنوز خرجی ثبت نشده است.</p>
      </section>

      <section class="space-y-3">
        <h2 class="text-lg font-black text-slate-950">اعضا</h2>
        <div class="grid gap-2 sm:grid-cols-2">
          <article v-for="member in members" :key="member.userId" class="mobile-card p-4">
            <h3 class="font-black text-slate-950">{{ member.name }}</h3>
            <p class="mt-1 text-xs text-slate-500 ltr">{{ member.email }} · {{ member.phone }}</p>
            <span class="mt-3 inline-flex rounded-full bg-teal-50 px-3 py-1 text-xs font-black text-teal-700">{{ member.role }}</span>
          </article>
        </div>
      </section>
    </template>
  </div>
</template>
