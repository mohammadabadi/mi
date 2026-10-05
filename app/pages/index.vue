<script setup lang="ts">
definePageMeta({ layout: 'default' })
</script>

<template>
  <section class="grid min-h-[calc(100dvh-96px)] items-center gap-8 py-6 lg:grid-cols-[1fr_0.9fr]">
    <div>
      <p class="mb-3 text-sm font-semibold text-teal-700">مدیریت مالی شخصی، دقیق و ساده</p>
      <h1 class="max-w-3xl text-4xl font-black leading-tight text-slate-950 sm:text-5xl">میفین</h1>
      <p class="mt-5 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
        حساب‌ها، درآمدها، هزینه‌ها و انتقال بین حساب‌ها را با مدل مالی درست مدیریت کنید. موجودی از تراکنش‌ها محاسبه می‌شود، نه با یک عدد قابل خراب شدن.
      </p>
      <div class="mt-7 grid gap-3 sm:flex">
        <NuxtLink to="/register" class="btn-primary w-full sm:w-auto">
          <UIcon name="i-lucide-user-plus" class="btn-icon" />
          <span>شروع کنید</span>
        </NuxtLink>
        <NuxtLink to="/login" class="btn-secondary w-full sm:w-auto">
          <UIcon name="i-lucide-log-in" class="btn-icon" />
          <span>ورود</span>
        </NuxtLink>
      </div>
    </div>
    <div class="grid gap-3">
      <div class="finance-hero rounded-xl p-5 text-white">
        <div class="text-sm text-slate-300">موجودی کل</div>
        <div class="money-value mt-2 text-3xl font-black">۱۲۵٬۴۰۰٬۰۰۰ ریال</div>
      </div>
      <div class="grid grid-cols-2 gap-3">
        <div class="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
          <div class="text-sm text-emerald-700">درآمد ماه</div>
          <div class="money-value mt-2 text-lg font-bold text-emerald-900">+۳۵٬۰۰۰٬۰۰۰ ریال</div>
        </div>
        <div class="rounded-xl border border-rose-200 bg-rose-50 p-4">
          <div class="text-sm text-rose-700">هزینه ماه</div>
          <div class="money-value mt-2 text-lg font-bold text-rose-900">-۱۸٬۵۰۰٬۰۰۰ ریال</div>
        </div>
      </div>
    </div>
  </section>
</template>
