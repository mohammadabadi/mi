<script setup lang="ts">
const { money, date } = usePersian()
const { data, pending, error, refresh } = useFetch('/api/dashboard', { credentials: 'include', lazy: true })
</script>

<template>
  <div class="space-y-5">
    <div class="flex items-center justify-between gap-3">
      <div>
        <p class="text-sm font-semibold text-slate-500">نمای کلی امروز</p>
        <h1 class="text-2xl font-black text-slate-950">داشبورد</h1>
      </div>
      <button class="btn-secondary min-h-11 px-3 text-sm" @click="() => refresh()">
        <UIcon name="i-lucide-refresh-cw" class="btn-icon" />
        <span>به‌روزرسانی</span>
      </button>
    </div>

    <SharedLoadingState v-if="pending" title="در حال آماده‌سازی داشبورد" />
    <p v-else-if="error" class="mobile-card border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">دریافت داشبورد ناموفق بود.</p>

    <template v-else-if="data">
      <section class="finance-hero overflow-hidden rounded-xl p-5 text-white">
        <div class="text-sm text-slate-300">موجودی کل</div>
        <div class="money-value mt-3 text-3xl font-black leading-tight">{{ money(data.summary.totalBalanceMinor) }}</div>
        <div class="mt-5 grid grid-cols-2 gap-3 text-sm">
          <div class="rounded-lg bg-white/10 p-3">
            <div class="text-slate-300">درآمد ماه</div>
            <div class="money-value mt-1 font-bold text-emerald-100">{{ money(data.summary.monthlyIncomeMinor) }}</div>
          </div>
          <div class="rounded-lg bg-white/10 p-3">
            <div class="text-slate-300">هزینه ماه</div>
            <div class="money-value mt-1 font-bold text-rose-100">{{ money(data.summary.monthlyExpenseMinor) }}</div>
          </div>
        </div>
      </section>

      <section class="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <NuxtLink to="/transactions" class="btn-primary">
          <UIcon name="i-lucide-plus" class="btn-icon" />
          <span>ثبت تراکنش</span>
        </NuxtLink>
        <NuxtLink to="/accounts" class="btn-secondary">
          <UIcon name="i-lucide-wallet-cards" class="btn-icon" />
          <span>مدیریت حساب‌ها</span>
        </NuxtLink>
        <NuxtLink to="/reports" class="btn-secondary">
          <UIcon name="i-lucide-chart-no-axes-combined" class="btn-icon" />
          <span>دیدن گزارش‌ها</span>
        </NuxtLink>
      </section>

      <section class="mobile-card p-4">
        <div class="flex items-center justify-between gap-3">
          <h2 class="font-bold text-slate-950">جریان نقدی ماه</h2>
          <span class="money-value rounded-full bg-teal-50 px-3 py-1 text-sm font-bold text-teal-800">{{ money(data.summary.netCashFlowMinor) }}</span>
        </div>
      </section>

      <section class="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div class="mobile-card p-4">
          <div class="mb-2 flex items-center justify-between">
            <h2 class="font-bold">تراکنش‌های اخیر</h2>
            <NuxtLink to="/transactions" class="inline-flex items-center gap-1 text-sm font-semibold text-cyan-700">
              <UIcon name="i-lucide-list" class="size-4" />
              <span>همه</span>
            </NuxtLink>
          </div>
          <div class="divide-y divide-slate-100">
            <div v-for="item in data.recentTransactions" :key="item.id" class="flex min-h-16 items-center justify-between gap-3 py-3">
              <div class="min-w-0">
                <div class="truncate font-medium">{{ item.description || item.categoryName }}</div>
                <div class="mt-1 truncate text-xs text-slate-500">{{ item.accountName }} · {{ date(item.date) }}</div>
              </div>
              <div :class="item.type === 'income' ? 'text-emerald-700' : 'text-rose-700'" class="money-value shrink-0 text-sm font-black">
                {{ item.type === 'income' ? '+' : '-' }}{{ money(item.amountMinor) }}
              </div>
            </div>
            <p v-if="!data.recentTransactions.length" class="py-8 text-center text-sm text-slate-500">هنوز تراکنشی ثبت نشده است.</p>
          </div>
        </div>

        <div class="mobile-card p-4">
          <h2 class="font-bold">هزینه بر اساس دسته</h2>
          <div class="mt-4 space-y-4">
            <div v-for="item in data.categoryBreakdown" :key="item.categoryName">
              <div class="mb-2 flex justify-between gap-3 text-sm">
                <span class="truncate">{{ item.categoryName }}</span>
                <span class="money-value shrink-0 font-bold">{{ money(item.amountMinor) }}</span>
              </div>
              <div class="h-2.5 rounded-full bg-slate-100">
                <div class="h-2.5 rounded-full bg-teal-600" :style="{ width: `${Math.min(100, Number(item.amountMinor) / 1000000)}%` }" />
              </div>
            </div>
            <p v-if="!data.categoryBreakdown.length" class="py-8 text-center text-sm text-slate-500">داده‌ای برای ماه جاری وجود ندارد.</p>
          </div>
        </div>
      </section>
    </template>
  </div>
</template>
