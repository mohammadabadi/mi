<script setup lang="ts">
withDefaults(defineProps<{
  title?: string
  rows?: number
}>(), {
  title: 'در حال دریافت داده‌ها',
  rows: 3
})
</script>

<template>
  <div class="mobile-card loading-state p-4">
    <div class="flex items-center gap-3">
      <span class="loading-orbit">
        <UIcon name="i-lucide-sparkles" class="size-4" />
      </span>
      <div class="min-w-0">
        <p class="text-sm font-black text-teal-950">{{ title }}</p>
        <p class="mt-1 text-xs text-slate-500">چند لحظه صبر کنید</p>
      </div>
    </div>

    <div class="mt-5 space-y-3">
      <div v-for="row in rows" :key="row" class="loading-row">
        <span class="loading-dot" />
        <span class="loading-line" :style="{ width: `${86 - row * 9}%` }" />
      </div>
    </div>
  </div>
</template>
