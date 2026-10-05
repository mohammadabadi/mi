<script setup lang="ts">
const { money } = usePersian()
const { data: monthly, pending: monthlyPending } = useFetch('/api/reports/monthly', { credentials: 'include', lazy: true })
const { data: expenses, pending: expensesPending } = useFetch('/api/reports/expenses', { credentials: 'include', lazy: true })
const { data: income, pending: incomePending } = useFetch('/api/reports/income', { credentials: 'include', lazy: true })
const pending = computed(() => monthlyPending.value || expensesPending.value || incomePending.value)
</script>

<template>
  <div class="space-y-5">
    <div>
      <p class="text-sm font-semibold text-slate-500">تحلیل درآمد و هزینه</p>
      <h1 class="text-2xl font-black text-slate-950">گزارش‌ها</h1>
    </div>

    <SharedLoadingState v-if="pending" title="در حال ساخت گزارش‌ها" :rows="4" />

    <section v-else class="mobile-card p-4">
      <h2 class="font-bold">درآمد، هزینه و خالص ماهانه</h2>

      <div class="mt-4 space-y-3 md:hidden">
        <article v-for="row in monthly?.rows" :key="row.month" class="rounded-xl border border-slate-100 bg-slate-50 p-4">
          <div class="ltr text-right text-sm font-bold text-slate-700">{{ row.month }}</div>
          <div class="mt-3 grid grid-cols-3 gap-2 text-xs">
            <div>
              <div class="text-slate-500">درآمد</div>
              <div class="money-value mt-1 font-bold text-emerald-700">{{ money(row.incomeMinor) }}</div>
            </div>
            <div>
              <div class="text-slate-500">هزینه</div>
              <div class="money-value mt-1 font-bold text-rose-700">{{ money(row.expenseMinor) }}</div>
            </div>
            <div>
              <div class="text-slate-500">خالص</div>
              <div class="money-value mt-1 font-bold text-slate-950">{{ money(row.netMinor) }}</div>
            </div>
          </div>
        </article>
      </div>

      <div class="mt-4 hidden overflow-auto md:block">
        <table class="w-full min-w-[620px] text-sm">
          <thead class="text-slate-500">
            <tr>
              <th class="p-3 text-right">ماه</th>
              <th class="p-3 text-right">درآمد</th>
              <th class="p-3 text-right">هزینه</th>
              <th class="p-3 text-right">خالص</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="row in monthly?.rows" :key="row.month">
              <td class="p-3 ltr text-right">{{ row.month }}</td>
              <td class="money-value p-3 text-emerald-700">{{ money(row.incomeMinor) }}</td>
              <td class="money-value p-3 text-rose-700">{{ money(row.expenseMinor) }}</td>
              <td class="money-value p-3 font-bold">{{ money(row.netMinor) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <p v-if="!monthly?.rows?.length" class="p-8 text-center text-sm text-slate-500">گزارشی وجود ندارد.</p>
    </section>

    <section v-if="!pending" class="grid gap-4 lg:grid-cols-2">
      <div class="mobile-card p-4">
        <h2 class="font-bold">هزینه بر اساس دسته</h2>
        <div class="mt-4 space-y-3">
          <div v-for="row in expenses?.rows" :key="row.categoryId" class="flex min-h-12 items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <span class="truncate">{{ row.categoryName }}</span>
            <strong class="money-value shrink-0 text-rose-700">{{ money(row.amountMinor) }}</strong>
          </div>
          <p v-if="!expenses?.rows?.length" class="py-8 text-center text-sm text-slate-500">هزینه‌ای ثبت نشده است.</p>
        </div>
      </div>
      <div class="mobile-card p-4">
        <h2 class="font-bold">درآمد بر اساس دسته</h2>
        <div class="mt-4 space-y-3">
          <div v-for="row in income?.rows" :key="row.categoryId" class="flex min-h-12 items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <span class="truncate">{{ row.categoryName }}</span>
            <strong class="money-value shrink-0 text-emerald-700">{{ money(row.amountMinor) }}</strong>
          </div>
          <p v-if="!income?.rows?.length" class="py-8 text-center text-sm text-slate-500">درآمدی ثبت نشده است.</p>
        </div>
      </div>
    </section>
  </div>
</template>
