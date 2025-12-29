<script setup lang="ts">
import { computed } from 'vue'
import CopyButton from './CopyButton.vue'

const props = withDefaults(defineProps<{
  modelValue: string
  placeholder?: string
  readonly?: boolean
  label?: string
  showCopy?: boolean
  error?: string
  rows?: number
}>(), {
  placeholder: '',
  readonly: false,
  showCopy: false,
  rows: 8
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const value = computed({
  get: () => props.modelValue,
  set: (val: string) => emit('update:modelValue', val)
})

const lineCount = computed(() => {
  return props.modelValue.split('\n').length
})
</script>

<template>
  <div class="relative group">
    <!-- Label -->
    <div v-if="label || showCopy" class="flex items-center justify-between mb-2">
      <label v-if="label" class="block text-xs font-mono font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
        {{ label }}
      </label>
      <CopyButton v-if="showCopy && modelValue" :text="modelValue" size="sm" />
    </div>

    <!-- Editor Container -->
    <div class="relative">
      <!-- Line Numbers (for readonly code display) -->
      <div
        v-if="readonly && lineCount > 1"
        class="absolute left-0 top-0 bottom-0 w-10 flex flex-col items-end pr-2 pt-3 text-xs font-mono text-neutral-400 dark:text-neutral-600 select-none border-r border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-surface-elevated rounded-l"
      >
        <span v-for="n in lineCount" :key="n" class="leading-relaxed">{{ n }}</span>
      </div>

      <!-- Textarea -->
      <textarea
        v-model="value"
        :placeholder="placeholder"
        :readonly="readonly"
        :rows="rows"
        class="w-full font-mono text-sm leading-relaxed resize-none transition-all duration-150"
        :class="[
          readonly
            ? 'bg-neutral-50 dark:bg-surface-elevated cursor-default'
            : 'bg-white dark:bg-surface-muted',
          lineCount > 1 && readonly ? 'pl-12' : 'pl-4',
          'pr-4 py-3',
          'border-2 rounded-lg',
          error
            ? 'border-red-400 dark:border-red-500 focus:border-red-500'
            : 'border-neutral-200 dark:border-neutral-700 focus:border-accent-lime dark:focus:border-accent-lime',
          'focus:outline-none',
          'placeholder:text-neutral-400 dark:placeholder:text-neutral-600'
        ]"
        spellcheck="false"
      />

      <!-- Error Message -->
      <div
        v-if="error"
        class="absolute bottom-0 left-0 right-0 px-3 py-1.5 text-xs font-mono text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-t border-red-200 dark:border-red-800 rounded-b-lg"
      >
        {{ error }}
      </div>
    </div>

    <!-- Character Count (for input) -->
    <div
      v-if="!readonly && modelValue.length > 0"
      class="absolute bottom-2 right-3 text-[10px] font-mono text-neutral-400 dark:text-neutral-600"
    >
      {{ modelValue.length.toLocaleString() }} chars
    </div>
  </div>
</template>
