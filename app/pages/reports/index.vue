<script setup lang="ts">
const { money, number } = usePersian()
const { data: monthly, pending: monthlyPending } = useFetch('/api/reports/monthly', { credentials: 'include', lazy: true })
const { data: expenses, pending: expensesPending } = useFetch('/api/reports/expenses', { credentials: 'include', lazy: true })
const { data: income, pending: incomePending } = useFetch('/api/reports/income', { credentials: 'include', lazy: true })
const pending = computed(() => monthlyPending.value || expensesPending.value || incomePending.value)
const monthRows = computed(() => monthly.value?.rows ?? [])
const expenseRows = computed(() => expenses.value?.rows ?? [])
const incomeRows = computed(() => income.value?.rows ?? [])
const latestMonth = computed(() => monthRows.value[0])
const totalExpenseMinor = computed(() => expenseRows.value.reduce((sum, row) => sum + BigInt(row.amountMinor || '0'), BigInt(0)).toString())
const totalIncomeMinor = computed(() => incomeRows.value.reduce((sum, row) => sum + BigInt(row.amountMinor || '0'), BigInt(0)).toString())

function barWidth(amountMinor: string | undefined, rows: Array<{ amountMinor?: string }>) {
  const max = Math.max(...rows.map((item) => Number(item.amountMinor || 0)), 1)
  return `${Math.max(8, Math.min(100, (Number(amountMinor || 0) / max) * 100))}%`
}
</script>

<template>
  <div class="space-y-4">
    <section class="overflow-hidden rounded-[20px] bg-[linear-gradient(135deg,#063c36,#0f766e_58%,#d99b2b_135%)] text-white shadow-xl shadow-teal-900/15">
      <div class="p-4 sm:p-5">
        <div class="min-w-0">
          <p class="text-xs font-black text-white/70">تحلیل درآمد و هزینه</p>
          <h1 class="mt-1 text-2xl font-black">گزارش‌ها</h1>
          <p class="mt-2 max-w-xl text-sm leading-6 text-white/78">اعداد مهم را سریع ببین؛ از روند ماهانه تا دسته‌هایی که بیشتر پول را مصرف کرده‌اند.</p>
        </div>

        <div class="mt-4 grid grid-cols-3 gap-2">
          <div class="rounded-2xl bg-white/12 p-3 ring-1 ring-white/15">
            <span class="block text-[11px] font-bold text-white/68">ماه‌ها</span>
            <strong class="mt-1 block text-lg font-black">{{ number(monthRows.length) }}</strong>
          </div>
          <div class="rounded-2xl bg-white/12 p-3 ring-1 ring-white/15">
            <span class="block text-[11px] font-bold text-white/68">درآمد</span>
            <strong class="money-value mt-1 block truncate text-sm font-black text-emerald-100">{{ money(totalIncomeMinor) }}</strong>
          </div>
          <div class="rounded-2xl bg-white/12 p-3 ring-1 ring-white/15">
            <span class="block text-[11px] font-bold text-white/68">هزینه</span>
            <strong class="money-value mt-1 block truncate text-sm font-black text-rose-100">{{ money(totalExpenseMinor) }}</strong>
          </div>
        </div>
      </div>
    </section>

    <SharedLoadingState v-if="pending" title="در حال ساخت گزارش‌ها" :rows="4" />

    <template v-else>
      <section v-if="latestMonth" class="mobile-card p-4">
        <div class="flex items-center justify-between gap-3">
          <div>
            <p class="text-xs font-black text-teal-700">آخرین ماه ثبت‌شده</p>
            <h2 class="mt-1 ltr text-right text-lg font-black text-slate-950">{{ latestMonth.month }}</h2>
          </div>
          <span class="money-value rounded-full bg-slate-100 px-3 py-1 text-sm font-black text-slate-900">{{ money(latestMonth.netMinor) }}</span>
        </div>
        <div class="mt-3 grid grid-cols-2 gap-2">
          <div class="rounded-2xl bg-emerald-50 p-3">
            <span class="block text-xs font-black text-emerald-700">درآمد</span>
            <strong class="money-value mt-1 block text-sm font-black text-emerald-800">{{ money(latestMonth.incomeMinor) }}</strong>
          </div>
          <div class="rounded-2xl bg-rose-50 p-3">
            <span class="block text-xs font-black text-rose-700">هزینه</span>
            <strong class="money-value mt-1 block text-sm font-black text-rose-800">{{ money(latestMonth.expenseMinor) }}</strong>
          </div>
        </div>
      </section>

      <section class="mobile-card p-4">
        <div class="mb-3">
          <p class="text-xs font-black text-teal-700">روند ماهانه</p>
          <h2 class="text-lg font-black text-slate-950">درآمد، هزینه و خالص</h2>
        </div>

        <div class="space-y-3 md:hidden">
          <article v-for="row in monthRows" :key="row.month" class="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
            <div class="ltr text-right text-sm font-black text-slate-800">{{ row.month }}</div>
            <div class="mt-3 grid grid-cols-3 gap-2 text-xs">
              <div>
                <div class="font-bold text-slate-500">درآمد</div>
                <div class="money-value mt-1 font-black text-emerald-700">{{ money(row.incomeMinor) }}</div>
              </div>
              <div>
                <div class="font-bold text-slate-500">هزینه</div>
                <div class="money-value mt-1 font-black text-rose-700">{{ money(row.expenseMinor) }}</div>
              </div>
              <div>
                <div class="font-bold text-slate-500">خالص</div>
                <div class="money-value mt-1 font-black text-slate-950">{{ money(row.netMinor) }}</div>
              </div>
            </div>
          </article>
        </div>

        <div class="mt-4 hidden overflow-auto rounded-2xl border border-slate-100 md:block">
          <table class="w-full min-w-[620px] text-sm">
            <thead class="bg-slate-50 text-slate-500">
              <tr>
                <th class="p-3 text-right">ماه</th>
                <th class="p-3 text-right">درآمد</th>
                <th class="p-3 text-right">هزینه</th>
                <th class="p-3 text-right">خالص</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-for="row in monthRows" :key="row.month">
                <td class="p-3 ltr text-right font-bold">{{ row.month }}</td>
                <td class="money-value p-3 font-bold text-emerald-700">{{ money(row.incomeMinor) }}</td>
                <td class="money-value p-3 font-bold text-rose-700">{{ money(row.expenseMinor) }}</td>
                <td class="money-value p-3 font-black">{{ money(row.netMinor) }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p v-if="!monthRows.length" class="rounded-2xl bg-slate-50 p-6 text-center text-sm font-bold text-slate-500">گزارشی وجود ندارد.</p>
      </section>

      <section class="grid gap-4 lg:grid-cols-2">
        <div class="mobile-card p-4">
          <div class="mb-4">
            <p class="text-xs font-black text-rose-700">{{ number(expenseRows.length) }} دسته</p>
            <h2 class="text-lg font-black text-slate-950">هزینه بر اساس دسته</h2>
          </div>
          <div class="space-y-4">
            <div v-for="row in expenseRows" :key="row.categoryId">
              <div class="mb-2 flex items-center justify-between gap-3">
                <span class="truncate text-sm font-black text-slate-800">{{ row.categoryName }}</span>
                <strong class="money-value shrink-0 text-sm font-black text-rose-700">{{ money(row.amountMinor) }}</strong>
              </div>
              <div class="h-2.5 overflow-hidden rounded-full bg-rose-50">
                <div class="h-full rounded-full bg-rose-500" :style="{ width: barWidth(row.amountMinor, expenseRows) }" />
              </div>
            </div>
            <p v-if="!expenseRows.length" class="rounded-2xl bg-slate-50 p-6 text-center text-sm font-bold text-slate-500">هزینه‌ای ثبت نشده است.</p>
          </div>
        </div>

        <div class="mobile-card p-4">
          <div class="mb-4">
            <p class="text-xs font-black text-emerald-700">{{ number(incomeRows.length) }} دسته</p>
            <h2 class="text-lg font-black text-slate-950">درآمد بر اساس دسته</h2>
          </div>
          <div class="space-y-4">
            <div v-for="row in incomeRows" :key="row.categoryId">
              <div class="mb-2 flex items-center justify-between gap-3">
                <span class="truncate text-sm font-black text-slate-800">{{ row.categoryName }}</span>
                <strong class="money-value shrink-0 text-sm font-black text-emerald-700">{{ money(row.amountMinor) }}</strong>
              </div>
              <div class="h-2.5 overflow-hidden rounded-full bg-emerald-50">
                <div class="h-full rounded-full bg-emerald-500" :style="{ width: barWidth(row.amountMinor, incomeRows) }" />
              </div>
            </div>
            <p v-if="!incomeRows.length" class="rounded-2xl bg-slate-50 p-6 text-center text-sm font-bold text-slate-500">درآمدی ثبت نشده است.</p>
          </div>
        </div>
      </section>
    </template>
  </div>
</template>
