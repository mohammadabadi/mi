<script setup lang="ts">
definePageMeta({ layout: 'default' })

const { number } = usePersian()

useHead({
  title: 'میفین | مدیریت مالی شخصی و گروهی',
  meta: [
    {
      name: 'description',
      content: 'میفین اپلیکیشن مدیریت مالی شخصی و گروهی برای حساب‌ها، تراکنش‌ها، گزارش‌ها، دنگ گروهی، اعلان و نصب روی موبایل است.'
    }
  ]
})

const featureCards = [
  {
    title: 'حساب‌ها و موجودی قابل اعتماد',
    text: 'موجودی هر حساب از تراکنش‌ها محاسبه می‌شود؛ یعنی عدد نهایی با جریان واقعی پول هماهنگ می‌ماند.',
    icon: 'i-lucide-wallet-cards',
    accent: 'bg-teal-50 text-teal-700'
  },
  {
    title: 'ثبت هزینه، درآمد و انتقال',
    text: 'تراکنش‌ها با تاریخ شمسی، دسته‌بندی، توضیح و مبلغ خوانا ثبت می‌شوند تا بعدا راحت گزارش بگیری.',
    icon: 'i-lucide-receipt-text',
    accent: 'bg-sky-50 text-sky-700'
  },
  {
    title: 'خرج گروهی و دنگ',
    text: 'برای خانه، سفر یا جمع دوستان گروه بساز، سهم افراد را مشخص کن و پرداخت‌ها را تا تسویه دنبال کن.',
    icon: 'i-lucide-users-round',
    accent: 'bg-amber-50 text-amber-700'
  },
  {
    title: 'گزارش‌های مالی شفاف',
    text: 'بفهم درآمد و هزینه در هر بازه زمانی چقدر بوده و پول بیشتر در چه دسته‌هایی خرج شده است.',
    icon: 'i-lucide-chart-no-axes-combined',
    accent: 'bg-emerald-50 text-emerald-700'
  },
  {
    title: 'دسته‌بندی با آیکن',
    text: 'دسته‌های شخصی بساز و با آیکن‌های واضح، ثبت و بررسی خرج‌ها را سریع‌تر و قابل فهم‌تر کن.',
    icon: 'i-lucide-tags',
    accent: 'bg-violet-50 text-violet-700'
  },
  {
    title: 'نصب روی موبایل و اعلان',
    text: 'میفین به‌صورت PWA نصب می‌شود و برای دعوت گروه، دنگ جدید و تایید پرداخت آماده اعلان است.',
    icon: 'i-lucide-smartphone',
    accent: 'bg-rose-50 text-rose-700'
  }
]

const groupHighlights = [
  'دعوت عضو با ایمیل یا شماره موبایل',
  'انتخاب دقیق افراد سهیم در هر خرج',
  'نمایش بدهکار، بستانکار و وضعیت پرداخت',
  'ارسال شماره کارت پرداخت‌کننده برای بدهکارها'
]

const steps = [
  { title: 'حساب‌ها را بساز', text: 'بانک، کیف پول یا صندوق نقدی را اضافه کن.', icon: 'i-lucide-wallet' },
  { title: 'تراکنش‌ها را ثبت کن', text: 'مبلغ‌ها خوانا، سه‌رقمی و با واحد پولی دیده می‌شوند.', icon: 'i-lucide-pen-line' },
  { title: 'گزارش و تسویه را ببین', text: 'خرج‌ها، درآمدها و دنگ‌ها همیشه قابل پیگیری‌اند.', icon: 'i-lucide-chart-pie' }
]

const trustItems = [
  {
    title: 'تفکیک داده کاربران',
    text: 'داده‌ها در API بر اساس کاربر لاگین‌شده و عضویت گروه محدود می‌شوند.',
    icon: 'i-lucide-lock-keyhole'
  },
  {
    title: 'موبایل‌فرست',
    text: 'ثبت خرج، فیلتر تراکنش، انتخاب تاریخ و پرداخت دنگ برای صفحه کوچک طراحی شده‌اند.',
    icon: 'i-lucide-panel-top'
  },
  {
    title: 'خوانایی مالی',
    text: 'عددها با جداکننده سه‌رقمی، فونت مناسب و واحد پولی نمایش داده می‌شوند.',
    icon: 'i-lucide-badge-dollar-sign'
  }
]
</script>

<template>
  <div class="space-y-8 pb-8 sm:space-y-12 sm:pb-12 lg:space-y-16">
    <section class="overflow-hidden rounded-[20px] bg-[#092f2b] text-white shadow-2xl shadow-teal-900/20 sm:rounded-[28px]">
      <div class="grid gap-5 p-4 sm:gap-8 sm:p-7 lg:grid-cols-[0.92fr_1.08fr] lg:items-center lg:p-10">
        <div class="min-w-0">
          <div class="mb-4 inline-flex max-w-full items-center gap-2 rounded-full bg-white px-2.5 py-1.5 text-[11px] font-black text-teal-900 shadow-lg shadow-black/10 sm:mb-5 sm:px-3 sm:py-2 sm:text-xs">
            <img src="/pwa-icon.svg" alt="" class="size-5 rounded-lg sm:size-6">
            <span class="truncate">اپ مالی فارسی، شخصی، گروهی و قابل نصب</span>
          </div>

          <h1 class="text-[1.65rem] font-black leading-9 sm:text-xl sm:leading-tight lg:text-2xl">
            میفین؛ دخل‌وخرجت را روشن و قابل پیگیری کن.
          </h1>
          <p class="mt-3 max-w-2xl text-sm  leading-7 text-teal-50/90 sm:mt-5 sm:text-base sm:leading-8">
            از حساب‌های شخصی تا خرج‌های مشترک، از گزارش‌های مالی تا دنگ دوستانه؛ همه چیز در یک تجربه موبایل‌فرست و قابل اعتماد.
          </p>

          <div class="mt-5 grid gap-2 sm:mt-7 sm:flex sm:gap-3">
            <NuxtLink to="/register" class="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#f7c65f] px-4 text-sm font-black text-slate-950 shadow-lg shadow-black/15 transition active:translate-y-px sm:min-h-12 sm:px-5 sm:text-base">
              <UIcon name="i-lucide-user-plus" class="btn-icon" />
              <span>شروع رایگان</span>
            </NuxtLink>
            <NuxtLink to="/login" class="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-white/10 px-4 text-sm font-black text-white ring-1 ring-white/20 transition active:translate-y-px sm:min-h-12 sm:px-5 sm:text-base">
              <UIcon name="i-lucide-log-in" class="btn-icon" />
              <span>ورود به حساب</span>
            </NuxtLink>
          </div>

          <div class="mt-5 grid grid-cols-3 gap-2 sm:mt-7">
            <div class="rounded-2xl bg-white/10 p-2.5 ring-1 ring-white/14 sm:p-3">
              <strong class="block text-base font-black sm:text-xl">PWA</strong>
              <span class="mt-1 block text-[11px] font-bold leading-4 text-teal-50/75 sm:text-xs">نصب روی گوشی</span>
            </div>
            <div class="rounded-2xl bg-white/10 p-2.5 ring-1 ring-white/14 sm:p-3">
              <strong class="block text-base font-black sm:text-xl">گروه</strong>
              <span class="mt-1 block text-[11px] font-bold leading-4 text-teal-50/75 sm:text-xs">دنگ و تسویه</span>
            </div>
            <div class="rounded-2xl bg-white/10 p-2.5 ring-1 ring-white/14 sm:p-3">
              <strong class="block text-base font-black sm:text-xl">گزارش</strong>
              <span class="mt-1 block text-[11px] font-bold leading-4 text-teal-50/75 sm:text-xs">تصمیم بهتر</span>
            </div>
          </div>
        </div>

        <div class="mx-auto w-full max-w-md rounded-[22px] bg-[#f6faf8] p-2 text-slate-950 shadow-2xl shadow-black/20 ring-1 ring-white/20 sm:rounded-[30px] sm:p-3 lg:max-w-none">
          <div class="overflow-hidden rounded-[18px] border border-teal-100 bg-white sm:rounded-[24px]">
            <div class="bg-[#0f766e] p-3 text-white sm:p-4">
              <div class="flex items-center justify-between gap-3">
                <div class="flex items-center gap-2">
                  <img src="/pwa-icon.svg" alt="" class="size-8 rounded-xl bg-white shadow-lg sm:size-10">
                  <span class="text-sm font-black sm:text-base">داشبورد میفین</span>
                </div>
                <span class="rounded-full bg-white px-2.5 py-1 text-[11px] font-black text-teal-900 sm:px-3 sm:text-xs">مهر ۱۴۰۵</span>
              </div>
              <div class="mt-4 sm:mt-6">
                <span class="text-xs font-bold text-teal-50 sm:text-sm">موجودی کل</span>
                <strong class="money-value mt-1 block text-2xl font-black text-white sm:text-3xl">۱۲۵٬۴۰۰٬۰۰۰ ریال</strong>
              </div>
              <div class="mt-4 grid grid-cols-2 gap-2 sm:mt-5 sm:gap-3">
                <div class="rounded-xl bg-white p-2.5 text-slate-950 sm:rounded-2xl sm:p-3">
                  <span class="text-xs font-black text-emerald-700">درآمد ماه</span>
                  <strong class="money-value mt-1 block text-sm font-black text-emerald-700 sm:text-base">+۳۵٬۰۰۰٬۰۰۰</strong>
                </div>
                <div class="rounded-xl bg-white p-2.5 text-slate-950 sm:rounded-2xl sm:p-3">
                  <span class="text-xs font-black text-rose-700">هزینه ماه</span>
                  <strong class="money-value mt-1 block text-sm font-black text-rose-700 sm:text-base">-۱۸٬۵۰۰٬۰۰۰</strong>
                </div>
              </div>
            </div>

            <div class="space-y-2 bg-[#f6faf8] p-3 sm:space-y-3 sm:p-4">
              <div class="rounded-2xl border border-amber-100 bg-white p-3 shadow-sm sm:p-4">
                <div class="flex items-start justify-between gap-3">
                  <div>
                    <h3 class="text-sm font-black text-slate-950 sm:text-base">قهوه‌های شرکت</h3>
                    <p class="mt-1 text-xs font-bold text-slate-500">خرج گروهی · ۳ نفر سهیم</p>
                  </div>
                  <span class="rounded-full bg-amber-50 px-2 py-1 text-[11px] font-black text-amber-700 sm:px-2.5 sm:text-xs">منتظر پرداخت</span>
                </div>
                <div class="mt-3 grid gap-1 rounded-xl bg-rose-50 p-2.5 sm:mt-4 sm:flex sm:items-center sm:justify-between sm:p-3">
                  <span class="text-xs font-black text-rose-700">مانده دنگ‌ها</span>
                  <span class="money-value text-sm font-black text-rose-700 sm:text-base">۱٬۲۵۰٬۰۰۰ ریال</span>
                </div>
              </div>

              <div class="grid grid-cols-3 gap-2">
                <div class="rounded-xl bg-white p-2 text-center shadow-sm sm:rounded-2xl sm:p-3">
                  <UIcon name="i-lucide-receipt-text" class="mx-auto size-4 text-teal-700 sm:size-5" />
                  <span class="mt-1.5 block text-[11px] font-black text-slate-700 sm:mt-2 sm:text-xs">ثبت سریع</span>
                </div>
                <div class="rounded-xl bg-white p-2 text-center shadow-sm sm:rounded-2xl sm:p-3">
                  <UIcon name="i-lucide-chart-no-axes-combined" class="mx-auto size-4 text-sky-700 sm:size-5" />
                  <span class="mt-1.5 block text-[11px] font-black text-slate-700 sm:mt-2 sm:text-xs">گزارش</span>
                </div>
                <div class="rounded-xl bg-white p-2 text-center shadow-sm sm:rounded-2xl sm:p-3">
                  <UIcon name="i-lucide-bell-ring" class="mx-auto size-4 text-amber-700 sm:size-5" />
                  <span class="mt-1.5 block text-[11px] font-black text-slate-700 sm:mt-2 sm:text-xs">اعلان</span>
                </div>
              </div>

              <div class="rounded-2xl border border-teal-100 bg-teal-50 p-3">
                <div class="flex items-center gap-2">
                  <span class="inline-flex size-8 items-center justify-center rounded-xl bg-white text-teal-700 shadow-sm sm:size-9">
                    <UIcon name="i-lucide-shield-check" class="size-4 sm:size-5" />
                  </span>
                  <p class="text-[11px] font-black leading-5 text-teal-950 sm:text-xs sm:leading-6">هر کاربر فقط داده‌های خودش و گروه‌هایی را می‌بیند که عضو آن‌هاست.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="space-y-3 sm:space-y-5">
      <div class="max-w-3xl">
        <p class="text-sm font-black text-teal-700">امکانات اصلی</p>
        <h2 class="mt-2 text-basen font-black leading-8 text-slate-950 sm:text-2xl sm:leading-10">هر چیزی که برای مدیریت مالی روزمره لازم داری</h2>
        <p class="mt-2 text-sm leading-7 text-slate-600 sm:mt-3 sm:leading-8">میفین فقط دفترچه خرج نیست؛ ساختار حساب، دسته‌بندی، گزارش، گروه و اعلان را کنار هم می‌آورد.</p>
      </div>

      <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <article v-for="feature in featureCards" :key="feature.title" class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-teal-900/8 sm:p-5">
          <span class="inline-flex size-10 items-center justify-center rounded-2xl sm:size-12" :class="feature.accent">
            <UIcon :name="feature.icon" class="size-5" />
          </span>
          <h3 class="mt-3 text-sm font-black text-slate-950 sm:mt-4 sm:text-base">{{ feature.title }}</h3>
          <p class="mt-2 text-xs font-medium leading-6 text-slate-600 sm:text-sm sm:leading-7">{{ feature.text }}</p>
        </article>
      </div>
    </section>

    <section class="grid gap-4 rounded-[20px] border border-teal-100 bg-white p-4 shadow-sm sm:gap-5 sm:rounded-[24px] sm:p-7 lg:grid-cols-[0.88fr_1.12fr] lg:items-center">
      <div>
        <p class="text-sm font-black text-teal-700">مدیریت خرج گروهی</p>
        <h2 class="mt-2 text-base font-black leading-8 text-slate-950 sm:text-2xl sm:leading-10">برای قهوه، سفر، خانه و هر خرج مشترک</h2>
        <p class="mt-2 text-sm font-medium leading-7 text-slate-600 sm:mt-3 sm:leading-8">
          در میفین خرج گروهی فقط یک یادداشت ساده نیست؛ هر خرج پرداخت‌کننده، افراد سهیم، وضعیت هر نفر و مانده تسویه را مشخص دارد.
        </p>
      </div>
      <div class="grid gap-3 sm:grid-cols-2">
        <div v-for="item in groupHighlights" :key="item" class="rounded-2xl border border-teal-100 bg-[#f7fcfa] p-3 sm:p-4">
          <UIcon name="i-lucide-check-circle" class="size-4 text-teal-700 sm:size-5" />
          <p class="mt-2 text-xs font-black leading-6 text-slate-800 sm:mt-3 sm:text-sm sm:leading-7">{{ item }}</p>
        </div>
      </div>
    </section>

    <section class="rounded-[20px] bg-[#101828] p-4 text-white shadow-xl shadow-slate-900/15 sm:rounded-[24px] sm:p-7">
      <div class="grid gap-4 sm:gap-6 lg:grid-cols-[0.75fr_1.25fr] lg:items-center">
        <div>
          <p class="text-sm font-black text-amber-300">مسیر کار</p>
          <h2 class="mt-2 text-base font-black leading-8 sm:text-2xl sm:leading-10">از ثبت حساب تا گزارش، بدون پیچیدگی</h2>
        </div>
        <div class="grid gap-3 sm:grid-cols-3">
          <article v-for="(step, index) in steps" :key="step.title" class="rounded-2xl bg-white p-3 text-slate-950 sm:p-4">
            <div class="flex items-center justify-between">
              <span class="inline-flex size-9 items-center justify-center rounded-xl bg-amber-100 text-sm font-black text-amber-900">{{ number(index + 1) }}</span>
              <UIcon :name="step.icon" class="size-5 text-teal-700" />
            </div>
            <h3 class="mt-3 text-sm font-black sm:mt-4 sm:text-base">{{ step.title }}</h3>
            <p class="mt-2 text-xs font-bold leading-6 text-slate-600">{{ step.text }}</p>
          </article>
        </div>
      </div>
    </section>

    <!-- <section class="grid gap-3 sm:grid-cols-3">
      <article v-for="item in trustItems" :key="item.title" class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <span class="inline-flex size-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-800">
          <UIcon :name="item.icon" class="size-5" />
        </span>
        <h3 class="mt-4 font-black text-slate-950">{{ item.title }}</h3>
        <p class="mt-2 text-sm font-medium leading-7 text-slate-600">{{ item.text }}</p>
      </article>
    </section> -->

    <section class="overflow-hidden rounded-[20px] bg-[#0f766e] p-4 text-white shadow-xl shadow-teal-900/15 sm:rounded-[24px] sm:p-7">
      <div class="grid gap-4 sm:gap-5 lg:grid-cols-[1fr_auto] lg:items-center">
        <div>
          <h2 class="text-base font-black leading-8 sm:text-2xl sm:leading-10">آماده‌ای دخل‌وخرجت را شفاف‌تر ببینی؟</h2>
          <p class="mt-2 max-w-2xl text-sm font-bold leading-7 text-teal-50 sm:mt-3">ثبت‌نام کن، حساب‌هایت را بساز و از همان روز اول تصویر دقیق‌تری از پول، خرج‌ها و دنگ‌ها داشته باش.</p>
        </div>
        <div class="grid gap-2 sm:flex">
          <NuxtLink to="/register" class="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-white px-4 text-sm font-black text-teal-900 sm:min-h-12 sm:px-5 sm:text-base">
            <UIcon name="i-lucide-user-plus" class="btn-icon" />
            <span>ساخت حساب</span>
          </NuxtLink>
          <NuxtLink to="/login" class="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-teal-950/25 px-4 text-sm font-black text-white ring-1 ring-white/24 sm:min-h-12 sm:px-5 sm:text-base">
            <UIcon name="i-lucide-log-in" class="btn-icon" />
            <span>ورود</span>
          </NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>
