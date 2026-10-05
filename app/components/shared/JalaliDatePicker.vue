<script setup lang="ts">
interface JalaliDate {
  jy: number
  jm: number
  jd: number
}

const props = withDefaults(defineProps<{
  modelValue: string
  id?: string
  label?: string
  placeholder?: string
  required?: boolean
}>(), {
  label: 'تاریخ',
  placeholder: 'انتخاب تاریخ',
  required: false
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const monthNames = [
  'فروردین',
  'اردیبهشت',
  'خرداد',
  'تیر',
  'مرداد',
  'شهریور',
  'مهر',
  'آبان',
  'آذر',
  'دی',
  'بهمن',
  'اسفند'
]
const weekDays = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج']
const faNumber = new Intl.NumberFormat('fa-IR', { useGrouping: false })
const jalaliPartsFormatter = new Intl.DateTimeFormat('en-US-u-ca-persian', {
  year: 'numeric',
  month: 'numeric',
  day: 'numeric'
})

const root = ref<HTMLElement | null>(null)
const panel = ref<HTMLElement | null>(null)
const open = ref(false)
const today = gregorianToJalali(new Date())
const visibleYear = ref(today.jy)
const visibleMonth = ref(today.jm)

const selectedJalali = computed(() => props.modelValue ? isoToJalali(props.modelValue) : null)
const displayValue = computed(() => selectedJalali.value ? formatJalali(selectedJalali.value) : '')
const visibleMonthTitle = computed(() => `${monthNames[visibleMonth.value - 1]} ${formatNumber(visibleYear.value)}`)
const monthDays = computed(() => getMonthDays(visibleYear.value, visibleMonth.value))
const firstDayOffset = computed(() => {
  const iso = jalaliToIso({ jy: visibleYear.value, jm: visibleMonth.value, jd: 1 })
  const date = isoToLocalDate(iso)
  return (date.getDay() + 1) % 7
})

watch(() => props.modelValue, (value) => {
  const selected = value ? isoToJalali(value) : today
  visibleYear.value = selected.jy
  visibleMonth.value = selected.jm
}, { immediate: true })

onClickOutside(root, () => {
  open.value = false
}, {
  ignore: [panel]
})

function chooseDay(day: number) {
  emit('update:modelValue', jalaliToIso({ jy: visibleYear.value, jm: visibleMonth.value, jd: day }))
  open.value = false
}

function chooseToday() {
  emit('update:modelValue', jalaliToIso(today))
  visibleYear.value = today.jy
  visibleMonth.value = today.jm
  open.value = false
}

function previousMonth() {
  if (visibleMonth.value === 1) {
    visibleMonth.value = 12
    visibleYear.value -= 1
    return
  }
  visibleMonth.value -= 1
}

function nextMonth() {
  if (visibleMonth.value === 12) {
    visibleMonth.value = 1
    visibleYear.value += 1
    return
  }
  visibleMonth.value += 1
}

function isSelected(day: number) {
  const selected = selectedJalali.value
  return selected?.jy === visibleYear.value && selected.jm === visibleMonth.value && selected.jd === day
}

function isToday(day: number) {
  return today.jy === visibleYear.value && today.jm === visibleMonth.value && today.jd === day
}

function formatNumber(value: number) {
  return faNumber.format(value)
}

function formatJalali(date: JalaliDate) {
  return `${formatNumber(date.jd)} ${monthNames[date.jm - 1]} ${formatNumber(date.jy)}`
}

function getMonthDays(year: number, month: number) {
  if (month <= 6) return 31
  if (month <= 11) return 30
  return isLeapJalaliYear(year) ? 30 : 29
}

function isoToLocalDate(value: string) {
  const [year = 0, month = 1, day = 1] = value.split('-').map(Number)
  return new Date(year, month - 1, day)
}

function isoToJalali(value: string) {
  return gregorianToJalali(isoToLocalDate(value))
}

function gregorianToJalali(date: Date) {
  const parts = jalaliPartsFormatter.formatToParts(date)
  return {
    jy: Number(parts.find((part) => part.type === 'year')?.value ?? 1),
    jm: Number(parts.find((part) => part.type === 'month')?.value ?? 1),
    jd: Number(parts.find((part) => part.type === 'day')?.value ?? 1)
  }
}

function jalaliToIso(date: JalaliDate) {
  const start = new Date(date.jy + 621, 2, 15)

  for (let offset = 0; offset <= 370; offset += 1) {
    const candidate = new Date(start)
    candidate.setDate(start.getDate() + offset)

    if (isSameJalaliDate(gregorianToJalali(candidate), date)) {
      return toIsoDate(candidate)
    }
  }

  throw new Error('Invalid Jalali date')
}

function isLeapJalaliYear(year: number) {
  try {
    jalaliToIso({ jy: year, jm: 12, jd: 30 })
    return true
  } catch {
    return false
  }
}

function isSameJalaliDate(first: JalaliDate, second: JalaliDate) {
  return first.jy === second.jy && first.jm === second.jm && first.jd === second.jd
}

function toIsoDate(date: Date) {
  return [
    String(date.getFullYear()).padStart(4, '0'),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0')
  ].join('-')
}
</script>

<template>
  <div ref="root" class="jalali-date-picker">
    <label class="block">
      <span class="text-sm font-semibold text-slate-700">{{ label }}</span>
      <button
        :id="id"
        type="button"
        class="field jalali-date-trigger mt-2"
        :class="{ 'is-open': open }"
        :aria-expanded="open"
        @click="open = !open"
      >
        <span :class="displayValue ? 'text-slate-950' : 'text-slate-400'">{{ displayValue || placeholder }}</span>
        <UIcon name="i-lucide-calendar-days" class="size-5 text-teal-700" />
      </button>
      <input v-if="required" class="sr-only" tabindex="-1" :value="modelValue" required>
    </label>

  </div>

  <Teleport to="body">
    <Transition name="select-pop">
      <div v-if="open" class="jalali-calendar-layer">
        <button type="button" class="jalali-calendar-backdrop" aria-label="بستن تقویم" @click="open = false" />
        <div ref="panel" class="jalali-calendar-panel">
        <div class="jalali-calendar-header">
          <button type="button" class="jalali-calendar-nav" aria-label="ماه قبل" @click="previousMonth">
            <UIcon name="i-lucide-chevron-right" class="size-5" />
          </button>
          <div class="text-center">
            <p class="font-black text-slate-950">{{ visibleMonthTitle }}</p>
          </div>
          <button type="button" class="jalali-calendar-nav" aria-label="ماه بعد" @click="nextMonth">
            <UIcon name="i-lucide-chevron-left" class="size-5" />
          </button>
        </div>

        <div class="jalali-weekdays">
          <span v-for="day in weekDays" :key="day">{{ day }}</span>
        </div>

        <div class="jalali-days">
          <span v-for="blank in firstDayOffset" :key="`blank-${blank}`" />
          <button
            v-for="day in monthDays"
            :key="day"
            type="button"
            class="jalali-day"
            :class="{ 'is-selected': isSelected(day), 'is-today': isToday(day) }"
            @click="chooseDay(day)"
          >
            {{ formatNumber(day) }}
          </button>
        </div>

        <button type="button" class="jalali-today-button" @click="chooseToday">
          <UIcon name="i-lucide-sparkles" class="size-4" />
          <span>امروز</span>
        </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
