<script setup lang="ts">
type ActivePanel = 'groups' | 'invites' | 'new'
type InvitationAction = 'accept' | 'reject'

const { money, number } = usePersian()
const { data: groupsData, pending: groupsPending, error: groupsError, refresh: refreshGroups } = useFetch('/api/groups', { credentials: 'include', lazy: true })
const { data: invitationsData, pending: invitationsPending, error: invitationsError, refresh: refreshInvitations } = useFetch('/api/group-invitations', { credentials: 'include', lazy: true })

interface GroupItem {
  id: string
  name: string
  description: string
  role: string
  memberCount: number
  myPendingMinor: string
}

interface InvitationItem {
  id: string
  status: 'pending' | 'accepted' | 'rejected'
  groupId: string
  groupName: string
  groupDescription: string
  inviterName: string
}

const groups = computed(() => (groupsData.value?.groups ?? []) as unknown as GroupItem[])
const invitations = computed(() => ((invitationsData.value?.invitations ?? []) as unknown as InvitationItem[]).filter((item) => item.status === 'pending'))
const pendingAmountMinor = computed(() => groups.value.reduce((sum, group) => sum + Number(group.myPendingMinor ?? 0), 0))
const pending = computed(() => groupsPending.value || invitationsPending.value)
const loadError = computed(() => {
  const err = groupsError.value || invitationsError.value
  if (!err) return ''
  return err.statusMessage || err.message || 'دریافت اطلاعات گروه‌ها ناموفق بود.'
})

const activePanel = ref<ActivePanel>('groups')
const form = reactive({ name: '', description: '' })
const loading = ref(false)
const error = ref('')
const invitationAction = reactive<{ id: string; type: InvitationAction | '' }>({ id: '', type: '' })

const tabs = computed(() => [
  { key: 'groups' as const, label: 'گروه‌ها', icon: 'i-lucide-users-round', badge: groups.value.length },
  { key: 'invites' as const, label: 'دعوت‌ها', icon: 'i-lucide-mail-plus', badge: invitations.value.length },
  { key: 'new' as const, label: 'جدید', icon: 'i-lucide-plus', badge: 0 }
])

watch(invitations, (items) => {
  if (items.length && !groups.value.length) activePanel.value = 'invites'
}, { immediate: true })

function panelClass(panel: ActivePanel) {
  return activePanel.value === panel ? 'block' : 'hidden md:block'
}

function groupInitial(name: string) {
  return name.trim().slice(0, 1) || 'گ'
}

async function refreshAll() {
  await Promise.all([refreshGroups(), refreshInvitations()])
}

async function createGroup() {
  if (loading.value) return
  loading.value = true
  error.value = ''
  try {
    const response = await $fetch<{ group: { id: string } }>('/api/groups', { method: 'POST', body: form })
    form.name = ''
    form.description = ''
    await refreshGroups()
    await navigateTo(`/groups/${response.group.id}`)
  } catch (err) {
    const apiError = err as { data?: { statusMessage?: string }; message?: string }
    error.value = apiError.data?.statusMessage || apiError.message || 'ساخت گروه ناموفق بود.'
  } finally {
    loading.value = false
  }
}

async function acceptInvitation(id: string) {
  if (invitationAction.id) return
  invitationAction.id = id
  invitationAction.type = 'accept'
  try {
    const response = await $fetch<{ groupId: string }>(`/api/group-invitations/${id}/accept`, { method: 'POST' })
    await refreshAll()
    await navigateTo(`/groups/${response.groupId}`)
  } finally {
    invitationAction.id = ''
    invitationAction.type = ''
  }
}

async function rejectInvitation(id: string) {
  if (invitationAction.id) return
  invitationAction.id = id
  invitationAction.type = 'reject'
  try {
    await $fetch(`/api/group-invitations/${id}/reject`, { method: 'POST' })
    await refreshAll()
  } finally {
    invitationAction.id = ''
    invitationAction.type = ''
  }
}
</script>

<template>
  <div class="space-y-4">
    <section class="overflow-hidden rounded-[18px] bg-[linear-gradient(135deg,#063c36,#0f766e_58%,#d99b2b_135%)] text-white shadow-xl shadow-teal-900/15">
      <div class="p-4 sm:p-5">
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <p class="text-xs font-black text-white/72">مدیریت خرج‌های مشترک</p>
            <h1 class="mt-1 text-2xl font-black">گروه‌ها</h1>
            <p class="mt-2 max-w-xl text-sm leading-6 text-white/78">دعوت‌ها، سهم‌ها و پرداخت‌های گروهی را از همین صفحه دنبال کن. اعلان‌ها از هدر همیشه در دسترس‌اند.</p>
          </div>
          <button type="button" class="inline-flex size-11 shrink-0 items-center justify-center rounded-2xl bg-white/12 ring-1 ring-white/20 transition active:scale-95" aria-label="ساخت گروه جدید" @click="activePanel = 'new'">
            <UIcon name="i-lucide-plus" class="size-5" />
          </button>
        </div>

        <div class="mt-4 grid grid-cols-3 gap-2">
          <div class="rounded-2xl bg-white/12 p-3 ring-1 ring-white/15">
            <span class="block text-[11px] font-bold text-white/68">گروه</span>
            <strong class="mt-1 block text-lg font-black">{{ number(groups.length) }}</strong>
          </div>
          <div class="rounded-2xl bg-white/12 p-3 ring-1 ring-white/15">
            <span class="block text-[11px] font-bold text-white/68">دعوت</span>
            <strong class="mt-1 block text-lg font-black">{{ number(invitations.length) }}</strong>
          </div>
          <div class="rounded-2xl bg-white/12 p-3 ring-1 ring-white/15">
            <span class="block text-[11px] font-bold text-white/68">بدهی</span>
            <strong class="money-value mt-1 block truncate text-sm font-black text-amber-100">{{ money(pendingAmountMinor) }}</strong>
          </div>
        </div>
      </div>
    </section>

    <SharedLoadingState v-if="pending" title="در حال آماده‌سازی گروه‌ها" />

    <div v-else-if="loadError" class="mobile-card p-5">
      <div class="flex items-start gap-3">
        <span class="inline-flex size-11 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-700">
          <UIcon name="i-lucide-triangle-alert" class="size-5" />
        </span>
        <div>
          <h2 class="font-black text-slate-950">دریافت گروه‌ها ناموفق بود</h2>
          <p class="mt-1 text-sm text-slate-500">{{ loadError }}</p>
          <button type="button" class="btn-secondary mt-4" @click="refreshAll">
            <UIcon name="i-lucide-rotate-ccw" class="btn-icon" />
            <span>تلاش دوباره</span>
          </button>
        </div>
      </div>
    </div>

    <template v-else>
      <nav class="filter-summary md:hidden">
        <div class="hide-scrollbar flex gap-2 overflow-x-auto rounded-2xl border border-teal-100 bg-white/92 p-2 shadow-lg shadow-teal-900/5 backdrop-blur">
          <button
            v-for="tab in tabs"
            :key="tab.key"
            type="button"
            class="relative inline-flex min-h-11 shrink-0 items-center gap-2 rounded-xl px-3 text-sm font-black transition"
            :class="activePanel === tab.key ? 'bg-teal-700 text-white shadow-lg shadow-teal-900/15' : 'text-slate-600'"
            @click="activePanel = tab.key"
          >
            <UIcon :name="tab.icon" class="size-4" />
            <span>{{ tab.label }}</span>
            <span v-if="tab.badge" class="inline-flex min-w-5 items-center justify-center rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-black text-amber-800">
              {{ number(tab.badge) }}
            </span>
          </button>
        </div>
      </nav>

      <div class="grid gap-4 md:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.75fr)] md:items-start">
        <section class="mobile-card p-4" :class="panelClass('groups')">
          <div class="flex items-center justify-between gap-3">
            <div>
              <h2 class="text-lg font-black text-slate-950">گروه‌های من</h2>
              <p class="mt-1 text-xs font-bold text-slate-500">برای دیدن خرج‌ها وارد گروه شو.</p>
            </div>
            <button type="button" class="btn-secondary hidden min-h-10 px-3 py-2 text-sm md:inline-flex" @click="activePanel = 'new'">
              <UIcon name="i-lucide-plus" class="btn-icon" />
              <span>گروه جدید</span>
            </button>
          </div>

          <div v-if="groups.length" class="mt-4 grid gap-2 xl:grid-cols-2">
            <NuxtLink
              v-for="group in groups"
              :key="group.id"
              :to="`/groups/${group.id}`"
              class="group flex min-h-[92px] items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 p-3 transition hover:border-teal-200 hover:bg-teal-50/45"
            >
              <span class="inline-flex size-12 shrink-0 items-center justify-center rounded-2xl bg-teal-700 text-lg font-black text-white shadow-lg shadow-teal-900/12">
                {{ groupInitial(group.name) }}
              </span>
              <span class="min-w-0 flex-1">
                <span class="block truncate font-black text-slate-950">{{ group.name }}</span>
                <span class="mt-1 flex flex-wrap items-center gap-2 text-xs font-bold text-slate-500">
                  <span class="inline-flex items-center gap-1">
                    <UIcon name="i-lucide-users" class="size-3.5" />
                    {{ number(group.memberCount) }} عضو
                  </span>
                  <span v-if="group.role === 'owner'" class="rounded-full bg-amber-50 px-2 py-0.5 text-amber-700">سازنده</span>
                </span>
                <span v-if="Number(group.myPendingMinor) > 0" class="money-value mt-2 inline-flex rounded-full bg-rose-50 px-2.5 py-1 text-xs font-black text-rose-700">
                  {{ money(group.myPendingMinor) }}
                </span>
              </span>
              <span class="inline-flex size-9 shrink-0 items-center justify-center rounded-xl bg-white text-teal-700 shadow-sm transition group-hover:bg-teal-700 group-hover:text-white">
                <UIcon name="i-lucide-chevron-left" class="size-4" />
              </span>
            </NuxtLink>
          </div>

          <div v-else class="mt-4 rounded-2xl border border-dashed border-teal-200 bg-teal-50/55 p-5 text-center">
            <UIcon name="i-lucide-users-round" class="mx-auto size-8 text-teal-700" />
            <p class="mt-2 text-sm font-black text-slate-950">هنوز گروهی نداری.</p>
            <button type="button" class="btn-primary mt-4 w-full sm:w-auto" @click="activePanel = 'new'">
              <UIcon name="i-lucide-plus" class="btn-icon" />
              <span>ساخت اولین گروه</span>
            </button>
          </div>
        </section>

        <aside class="space-y-4 md:sticky md:top-5">
          <section class="mobile-card p-4" :class="panelClass('invites')">
            <div class="flex items-center justify-between">
              <h2 class="text-lg font-black text-slate-950">دعوت‌ها</h2>
              <span class="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-black text-amber-700">{{ number(invitations.length) }}</span>
            </div>

            <div v-if="invitations.length" class="mt-4 space-y-2">
              <article v-for="invitation in invitations" :key="invitation.id" class="rounded-2xl border border-amber-100 bg-amber-50/45 p-3">
                <div class="flex gap-3">
                  <span class="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-white text-amber-700 shadow-sm">
                    <UIcon name="i-lucide-mail-plus" class="size-5" />
                  </span>
                  <div class="min-w-0 flex-1">
                    <h3 class="truncate font-black text-slate-950">{{ invitation.groupName }}</h3>
                    <p class="mt-1 text-xs font-bold leading-5 text-slate-500">{{ invitation.inviterName }} شما را دعوت کرده است.</p>
                    <p v-if="invitation.groupDescription" class="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">{{ invitation.groupDescription }}</p>
                  </div>
                </div>
                <div class="mt-3 grid grid-cols-2 gap-2">
                  <button type="button" class="btn-primary min-h-10 px-3 py-2 text-sm disabled:opacity-70" :disabled="Boolean(invitationAction.id)" @click="acceptInvitation(invitation.id)">
                    <UIcon :name="invitationAction.id === invitation.id && invitationAction.type === 'accept' ? 'i-lucide-loader-circle' : 'i-lucide-check'" class="btn-icon" :class="{ 'animate-spin': invitationAction.id === invitation.id && invitationAction.type === 'accept' }" />
                    <span>پذیرش</span>
                  </button>
                  <button type="button" class="btn-secondary min-h-10 px-3 py-2 text-sm disabled:opacity-70" :disabled="Boolean(invitationAction.id)" @click="rejectInvitation(invitation.id)">
                    <UIcon :name="invitationAction.id === invitation.id && invitationAction.type === 'reject' ? 'i-lucide-loader-circle' : 'i-lucide-x'" class="btn-icon" :class="{ 'animate-spin': invitationAction.id === invitation.id && invitationAction.type === 'reject' }" />
                    <span>رد</span>
                  </button>
                </div>
              </article>
            </div>
            <p v-else class="mt-4 rounded-2xl bg-slate-50 p-4 text-center text-sm font-bold text-slate-500">دعوت فعالی نداری.</p>
          </section>

          <section class="mobile-card p-4" :class="panelClass('new')">
            <h2 class="text-lg font-black text-slate-950">ساخت گروه جدید</h2>
            <form class="mt-4 space-y-3" @submit.prevent="createGroup">
              <label class="block">
                <span class="text-sm font-medium">نام گروه</span>
                <input v-model="form.name" class="field mt-2" placeholder="مثلا قهوه‌های شرکت" required>
              </label>
              <label class="block">
                <span class="text-sm font-medium">توضیح</span>
                <input v-model="form.description" class="field mt-2" placeholder="خرج‌های مشترک دوستان، خانه یا سفر">
              </label>
              <p v-if="error" class="rounded-xl bg-rose-50 p-3 text-sm font-bold text-rose-700">{{ error }}</p>
              <button class="btn-primary w-full disabled:opacity-70" :disabled="loading">
                <UIcon :name="loading ? 'i-lucide-loader-circle' : 'i-lucide-users-round'" class="btn-icon" :class="{ 'animate-spin': loading }" />
                <span>{{ loading ? 'در حال ساخت...' : 'ساخت گروه' }}</span>
              </button>
            </form>
          </section>
        </aside>
      </div>
    </template>
  </div>
</template>
