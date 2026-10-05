<script setup lang="ts">
interface SelectOption {
  value: string
  label: string
}

const props = withDefaults(defineProps<{
  modelValue: string
  options: SelectOption[]
  placeholder?: string
  required?: boolean
}>(), {
  placeholder: 'انتخاب کنید',
  required: false
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const root = ref<HTMLElement | null>(null)
const open = ref(false)
const selected = computed(() => props.options.find((option) => option.value === props.modelValue))

onClickOutside(root, () => {
  open.value = false
})

function choose(value: string) {
  emit('update:modelValue', value)
  open.value = false
}
</script>

<template>
  <div ref="root" class="custom-select">
    <button
      type="button"
      class="field custom-select-trigger"
      :class="{ 'is-open': open }"
      :aria-expanded="open"
      @click="open = !open"
    >
      <span class="truncate">{{ selected?.label || placeholder }}</span>
      <UIcon name="i-lucide-chevron-down" class="custom-select-icon" :class="{ 'rotate-180': open }" />
    </button>

    <input v-if="required" class="sr-only" tabindex="-1" :value="modelValue" required>

    <Transition name="select-pop">
      <div v-if="open" class="custom-select-menu">
        <button
          v-for="option in options"
          :key="option.value"
          type="button"
          class="custom-select-option"
          :class="{ 'is-selected': option.value === modelValue }"
          @click="choose(option.value)"
        >
          <span class="truncate">{{ option.label }}</span>
          <UIcon :name="option.value === modelValue ? 'i-lucide-check' : 'i-lucide-circle'" class="size-4" />
        </button>
      </div>
    </Transition>
  </div>
</template>
