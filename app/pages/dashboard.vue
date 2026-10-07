<script setup lang="ts">
const { money, date, number } = usePersian()
const { data, pending, error, refresh } = useFetch('/api/dashboard', { credentials: 'include', lazy: true })

const recentCount = computed(() => data.value?.recentTransactions?.length ?? 0)
const categoryCount = computed(() => data.value?.categoryBreakdown?.length ?? 0)

function categoryWidth(amountMinor?: string) {
  const rows = data.value?.categoryBreakdown ?? []
  const max = Math.max(...rows.map((item) => Number(item.amountMinor || 0)), 1)
  return `${Math.max(8, Math.min(100, (Number(amountMinor || 0) / max) * 100))}%`
}
</script>

<template>
  <div class="space-y-4">
    <section class="overflow-hidden rounded-[20px] bg-[linear-gradient(135deg,#063c36,#0f766e_58%,#d99b2b_135%)] text-white shadow-xl shadow-teal-900/15">
      <div class="p-4 sm:p-5">
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <p class="text-xs font-black text-white/70">نمای کلی امروز</p>
            <h1 class="mt-1 text-2xl font-black">داشبورد</h1>
            <p class="mt-2 max-w-xl text-sm leading-6 text-white/78">تصویر سریع از موجودی، جریان نقدی ماه و آخرین اتفاق‌های مالی.</p>
          </div>
          <button class="inline-flex size-11 shrink-0 items-center justify-center rounded-2xl bg-white/12 ring-1 ring-white/20 active:scale-95" type="button" aria-label="به‌روزرسانی داشبورد" @click="() => refresh()">
            <UIcon name="i-lucide-refresh-cw" class="size-5" />
          </button>
        </div>

        <SharedLoadingState v-if="pending" title="در حال آماده‌سازی داشبورد" />

        <p v-else-if="error" class="mt-4 rounded-2xl bg-rose-50 p-4 text-sm font-bold text-rose-700">دریافت داشبورد ناموفق بود.</p>

        <template v-else-if="data">
          <div class="mt-5 rounded-3xl bg-white/12 p-4 ring-1 ring-white/15">
            <span class="text-xs font-black text-white/70">موجودی کل</span>
            <strong class="money-value mt-2 block text-3xl font-black leading-tight text-amber-100">{{ money(data.summary.totalBalanceMinor) }}</strong>
          </div>

          <div class="mt-3 grid grid-cols-2 gap-2">
            <div class="rounded-2xl bg-white/12 p-3 ring-1 ring-white/15">
              <span class="block text-[11px] font-bold text-white/68">درآمد ماه</span>
              <strong class="money-value mt-1 block truncate text-sm font-black text-emerald-100">{{ money(data.summary.monthlyIncomeMinor) }}</strong>
            </div>
            <div class="rounded-2xl bg-white/12 p-3 ring-1 ring-white/15">
              <span class="block text-[11px] font-bold text-white/68">هزینه ماه</span>
              <strong class="money-value mt-1 block truncate text-sm font-black text-rose-100">{{ money(data.summary.monthlyExpenseMinor) }}</strong>
            </div>
          </div>
        </template>
      </div>
    </section>

    <template v-if="!pending && data">
      <section class="grid grid-cols-3 gap-2">
        <NuxtLink to="/transactions" class="btn-primary min-h-12 px-2 text-sm">
          <UIcon name="i-lucide-plus" class="btn-icon" />
          <span>ثبت</span>
        </NuxtLink>
        <NuxtLink to="/accounts" class="btn-secondary min-h-12 px-2 text-sm">
          <UIcon name="i-lucide-wallet-cards" class="btn-icon" />
          <span>حساب‌ها</span>
        </NuxtLink>
        <NuxtLink to="/reports" class="btn-secondary min-h-12 px-2 text-sm">
          <UIcon name="i-lucide-chart-no-axes-combined" class="btn-icon" />
          <span>گزارش</span>
        </NuxtLink>
      </section>

      <section class="mobile-card p-4">
        <div class="flex items-center justify-between gap-3">
          <div>
            <p class="text-xs font-black text-teal-700">جریان نقدی ماه</p>
            <h2 class="mt-1 text-lg font-black text-slate-950">خالص درآمد و هزینه</h2>
          </div>
          <span class="money-value rounded-full bg-teal-50 px-3 py-1 text-sm font-black text-teal-800">{{ money(data.summary.netCashFlowMinor) }}</span>
        </div>
      </section>

      <section class="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div class="mobile-card p-4">
          <div class="mb-3 flex items-center justify-between gap-3">
            <div>
              <p class="text-xs font-black text-teal-700">{{ number(recentCount) }} مورد</p>
              <h2 class="text-lg font-black text-slate-950">تراکنش‌های اخیر</h2>
            </div>
            <NuxtLink to="/transactions" class="inline-flex min-h-9 items-center gap-1 rounded-xl bg-teal-50 px-3 text-xs font-black text-teal-700">
              <UIcon name="i-lucide-list" class="size-4" />
              <span>همه</span>
            </NuxtLink>
          </div>

          <div class="space-y-2">
            <article v-for="item in data.recentTransactions" :key="item.id" class="rounded-2xl border border-slate-100 bg-slate-50/70 p-3">
              <div class="flex items-start justify-between gap-3">
                <div class="min-w-0">
                  <h3 class="truncate font-black text-slate-950">{{ item.description || item.categoryName }}</h3>
                  <p class="mt-1 truncate text-xs font-bold text-slate-500">{{ item.accountName }} · {{ date(item.date) }}</p>
                </div>
                <strong :class="item.type === 'income' ? 'text-emerald-700' : 'text-rose-700'" class="money-value shrink-0 text-sm font-black">
                  {{ item.type === 'income' ? '+' : '-' }}{{ money(item.amountMinor) }}
                </strong>
              </div>
            </article>
            <p v-if="!data.recentTransactions.length" class="rounded-2xl bg-slate-50 p-6 text-center text-sm font-bold text-slate-500">هنوز تراکنشی ثبت نشده است.</p>
          </div>
        </div>

        <div class="mobile-card p-4">
          <div class="mb-3">
            <p class="text-xs font-black text-teal-700">{{ number(categoryCount) }} دسته</p>
            <h2 class="text-lg font-black text-slate-950">هزینه بر اساس دسته</h2>
          </div>

          <div class="space-y-4">
            <div v-for="item in data.categoryBreakdown" :key="item.categoryName">
              <div class="mb-2 flex justify-between gap-3 text-sm">
                <span class="truncate font-black text-slate-800">{{ item.categoryName }}</span>
                <span class="money-value shrink-0 font-black text-rose-700">{{ money(item.amountMinor) }}</span>
              </div>
              <div class="h-2.5 overflow-hidden rounded-full bg-slate-100">
                <div class="h-full rounded-full bg-teal-600" :style="{ width: categoryWidth(item.amountMinor) }" />
              </div>
            </div>
            <p v-if="!data.categoryBreakdown.length" class="rounded-2xl bg-slate-50 p-6 text-center text-sm font-bold text-slate-500">داده‌ای برای ماه جاری وجود ندارد.</p>
          </div>
        </div>
      </section>
    </template>
  </div>
</template>
