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

interface ExpenseItem {
  id: string
  title: string
  description: string
  amountMinor: string
  date: string
  payerId: string
  payerName: string
  myShareId: string | null
  myShareMinor: string
  myShareStatus: 'pending' | 'paid' | null
  paidCount: number
  shareCount: number
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

const inviteQuery = ref('')
const searchResults = ref<SearchUser[]>([])
const inviteLoading = ref(false)
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
  if (q.length < 2) {
    searchResults.value = []
    return
  }

  inviteLoading.value = true
  try {
    const response = await $fetch<{ users: SearchUser[] }>('/api/users/search', { query: { q }, credentials: 'include' })
    const existingIds = new Set(members.value.map((member) => member.userId))
    searchResults.value = response.users.filter((user) => !existingIds.has(user.id))
  } catch (err) {
    const apiError = err as { data?: { statusMessage?: string }; message?: string }
    inviteError.value = apiError.data?.statusMessage || apiError.message || 'جستجوی کاربر ناموفق بود.'
  } finally {
    inviteLoading.value = false
  }
}

let searchTimer: ReturnType<typeof setTimeout> | undefined
watch(inviteQuery, () => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(searchUsers, 280)
})

async function inviteUser(user: SearchUser) {
  inviteLoading.value = true
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
    inviteLoading.value = false
  }
}

function toggleParticipant(userId: string) {
  if (expenseForm.participantIds.includes(userId)) {
    expenseForm.participantIds = expenseForm.participantIds.filter((id) => id !== userId)
  } else {
    expenseForm.participantIds = [...expenseForm.participantIds, userId]
  }
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
    expenseForm.title = ''
    expenseForm.description = ''
    expenseForm.amountMinor = ''
    expenseForm.shares = {}
    await refresh()
  } catch (err) {
    const apiError = err as { data?: { statusMessage?: string }; message?: string }
    expenseError.value = apiError.data?.statusMessage || apiError.message || 'ثبت خرج گروهی ناموفق بود.'
  } finally {
    expenseLoading.value = false
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
          <input v-model="inviteQuery" class="field ltr mt-2" placeholder="email@example.com یا 09123456789">
        </label>
        <p v-if="inviteError" class="mt-3 rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{{ inviteError }}</p>
        <p v-if="inviteSuccess" class="mt-3 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">{{ inviteSuccess }}</p>
        <div v-if="searchResults.length" class="mt-3 space-y-2">
          <button v-for="user in searchResults" :key="user.id" type="button" class="w-full rounded-xl border border-slate-200 bg-white p-3 text-right" @click="inviteUser(user)">
            <span class="block font-black text-slate-950">{{ user.name }}</span>
            <span class="mt-1 block text-xs text-slate-500 ltr">{{ user.email }} · {{ user.phone }}</span>
          </button>
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
            <span class="text-sm font-medium">افراد درگیر</span>
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
              <h3 class="font-black text-slate-950">{{ expense.title }}</h3>
              <p class="mt-1 text-sm text-slate-500">پرداخت‌کننده: {{ expense.payerName }}</p>
              <p class="mt-1 text-xs text-slate-400">{{ date(expense.date) }} · {{ expense.paidCount }}/{{ expense.shareCount }} پرداخت شده</p>
            </div>
            <div class="money-value shrink-0 text-left font-black text-slate-950">{{ money(expense.amountMinor) }}</div>
          </div>

          <div v-if="expense.myShareId && expense.payerId !== currentUserId" class="mt-4 rounded-xl bg-slate-50 p-3">
            <div class="flex items-center justify-between gap-3">
              <span class="text-sm font-bold text-slate-600">دنگ شما</span>
              <span class="money-value font-black" :class="expense.myShareStatus === 'paid' ? 'text-emerald-700' : 'text-rose-700'">{{ money(expense.myShareMinor) }}</span>
            </div>
            <template v-if="expense.myShareStatus === 'pending'">
              <input v-model="payNotes[expense.myShareId]" class="field mt-3" placeholder="جزئیات پرداخت، مثلا کارت به کارت شد">
              <button class="btn-primary mt-3 w-full disabled:opacity-70" :disabled="payingShareId === expense.myShareId" @click="payShare(expense)">
                <UIcon :name="payingShareId === expense.myShareId ? 'i-lucide-loader-circle' : 'i-lucide-check'" class="btn-icon" :class="{ 'animate-spin': payingShareId === expense.myShareId }" />
                <span>پرداخت کردم</span>
              </button>
            </template>
            <p v-else class="mt-3 rounded-lg bg-emerald-50 p-3 text-sm font-bold text-emerald-700">پرداخت شده</p>
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
