<script setup lang="ts">
const { money } = usePersian()
const { data: groupsData, pending: groupsPending, error: groupsError, refresh: refreshGroups } = useFetch('/api/groups', { credentials: 'include', lazy: true })
const { data: invitationsData, pending: invitationsPending, error: invitationsError, refresh: refreshInvitations } = useFetch('/api/group-invitations', { credentials: 'include', lazy: true })
const { data: notificationsData, pending: notificationsPending, error: notificationsError, refresh: refreshNotifications } = useFetch('/api/notifications', { credentials: 'include', lazy: true })

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

interface NotificationItem {
  id: string
  title: string
  body: string
  isRead: boolean
}

const groups = computed(() => (groupsData.value?.groups ?? []) as unknown as GroupItem[])
const invitations = computed(() => ((invitationsData.value?.invitations ?? []) as unknown as InvitationItem[]).filter((item) => item.status === 'pending'))
const notifications = computed(() => (notificationsData.value?.notifications ?? []) as unknown as NotificationItem[])
const pending = computed(() => groupsPending.value || invitationsPending.value || notificationsPending.value)
const loadError = computed(() => {
  const err = groupsError.value || invitationsError.value || notificationsError.value
  if (!err) return ''
  return err.statusMessage || err.message || 'دریافت اطلاعات گروه‌ها ناموفق بود.'
})

const form = reactive({ name: '', description: '' })
const loading = ref(false)
const error = ref('')

async function refreshAll() {
  await Promise.all([refreshGroups(), refreshInvitations(), refreshNotifications()])
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
  const response = await $fetch<{ groupId: string }>(`/api/group-invitations/${id}/accept`, { method: 'POST' })
  await refreshAll()
  await navigateTo(`/groups/${response.groupId}`)
}

async function rejectInvitation(id: string) {
  await $fetch(`/api/group-invitations/${id}/reject`, { method: 'POST' })
  await refreshAll()
}
</script>

<template>
  <div class="space-y-5">
    <div class="flex items-start justify-between gap-3">
      <div>
        <p class="text-sm font-semibold text-teal-700">مدیریت خرج‌های مشترک</p>
        <h1 class="text-2xl font-black text-slate-950">گروه‌ها</h1>
      </div>
      <span v-if="invitations.length" class="rounded-full bg-amber-50 px-3 py-1 text-xs font-black text-amber-700">
        {{ invitations.length }} دعوت
      </span>
    </div>

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
      <section v-if="invitations.length" class="space-y-3">
        <h2 class="text-lg font-black text-slate-950">دعوت‌های شما</h2>
        <article v-for="invitation in invitations" :key="invitation.id" class="mobile-card p-4">
          <div class="flex items-start gap-3">
            <span class="inline-flex size-11 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
              <UIcon name="i-lucide-mail-plus" class="size-5" />
            </span>
            <div class="min-w-0 flex-1">
              <h3 class="font-black text-slate-950">{{ invitation.groupName }}</h3>
              <p class="mt-1 text-sm text-slate-500">{{ invitation.inviterName }} شما را به این گروه دعوت کرده است.</p>
              <p v-if="invitation.groupDescription" class="mt-1 text-sm text-slate-500">{{ invitation.groupDescription }}</p>
              <div class="mt-4 grid grid-cols-2 gap-2">
                <button type="button" class="btn-primary" @click="acceptInvitation(invitation.id)">
                  <UIcon name="i-lucide-check" class="btn-icon" />
                  <span>پذیرفتن</span>
                </button>
                <button type="button" class="btn-secondary" @click="rejectInvitation(invitation.id)">
                  <UIcon name="i-lucide-x" class="btn-icon" />
                  <span>رد کردن</span>
                </button>
              </div>
            </div>
          </div>
        </article>
      </section>

      <section class="mobile-card p-4">
        <h2 class="text-lg font-black text-slate-950">ساخت گروه جدید</h2>
        <form class="mt-4 space-y-3" @submit.prevent="createGroup">
          <label class="block">
            <span class="text-sm font-medium">نام گروه</span>
            <input v-model="form.name" class="field mt-2" placeholder="مثلاً قهوه‌های شرکت" required>
          </label>
          <label class="block">
            <span class="text-sm font-medium">توضیح</span>
            <input v-model="form.description" class="field mt-2" placeholder="خرج‌های مشترک دوستان، خانه یا سفر">
          </label>
          <p v-if="error" class="rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{{ error }}</p>
          <button class="btn-primary w-full disabled:opacity-70" :disabled="loading">
            <UIcon :name="loading ? 'i-lucide-loader-circle' : 'i-lucide-users-round'" class="btn-icon" :class="{ 'animate-spin': loading }" />
            <span>{{ loading ? 'در حال ساخت...' : 'ساخت گروه' }}</span>
          </button>
        </form>
      </section>

      <section class="space-y-3">
        <h2 class="text-lg font-black text-slate-950">گروه‌های من</h2>
        <NuxtLink v-for="group in groups" :key="group.id" :to="`/groups/${group.id}`" class="mobile-card flex items-center justify-between gap-3 p-4">
          <span class="min-w-0">
            <span class="block truncate font-black text-slate-950">{{ group.name }}</span>
            <span class="mt-1 block text-sm text-slate-500">{{ group.memberCount }} عضو</span>
          </span>
          <span class="text-left">
            <span v-if="Number(group.myPendingMinor) > 0" class="money-value block font-black text-rose-700">{{ money(group.myPendingMinor) }}</span>
            <span class="mt-1 inline-flex items-center gap-1 text-xs font-black text-teal-700">
              <span>جزئیات</span>
              <UIcon name="i-lucide-chevron-left" class="size-4" />
            </span>
          </span>
        </NuxtLink>
        <p v-if="!groups.length" class="mobile-card p-6 text-center text-sm text-slate-500">هنوز گروهی ندارید.</p>
      </section>

      <section v-if="notifications.length" class="space-y-3">
        <h2 class="text-lg font-black text-slate-950">اعلان‌های اخیر</h2>
        <article v-for="notification in notifications.slice(0, 5)" :key="notification.id" class="mobile-card p-4" :class="{ 'opacity-70': notification.isRead }">
          <h3 class="font-black text-slate-950">{{ notification.title }}</h3>
          <p class="mt-1 text-sm text-slate-500">{{ notification.body }}</p>
        </article>
      </section>
    </template>
  </div>
</template>
