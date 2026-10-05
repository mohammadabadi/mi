<script setup lang="ts">
const props = withDefaults(defineProps<{
  modelValue: string | number
  id?: string
  label?: string
  placeholder?: string
  currency?: string
  required?: boolean
}>(), {
  currency: 'IRR',
  placeholder: '0',
  label: 'مبلغ',
  required: false
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const { rawDigits, inputAmount } = usePersian()

const displayValue = computed(() => inputAmount(props.modelValue))
const unit = computed(() => props.currency === 'IRR' ? 'ریال' : props.currency)

function updateValue(event: Event) {
  const input = event.target as HTMLInputElement
  emit('update:modelValue', rawDigits(input.value))
}
</script>

<template>
  <label class="block">
    <span class="text-sm font-semibold text-slate-700">{{ label }}</span>
    <span class="amount-field mt-2 block">
      <input
        :id="id"
        :value="displayValue"
        inputmode="numeric"
        autocomplete="off"
        class="field amount-input"
        :placeholder="placeholder"
        :required="required"
        @input="updateValue"
      >
      <span class="amount-unit">{{ unit }}</span>
    </span>
  </label>
</template>
