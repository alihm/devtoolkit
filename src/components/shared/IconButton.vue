<script setup lang="ts">
import { computed, type Component } from 'vue'

const props = withDefaults(defineProps<{
  icon: Component
  label?: string
  variant?: 'ghost' | 'outline' | 'primary'
  size?: 'sm' | 'md' | 'lg'
  active?: boolean
}>(), {
  variant: 'ghost',
  size: 'md',
  active: false
})

const sizeClasses = computed(() => {
  switch (props.size) {
    case 'sm': return 'p-1.5'
    case 'lg': return 'p-3'
    default: return 'p-2'
  }
})

const iconSizeClasses = computed(() => {
  switch (props.size) {
    case 'sm': return 'w-4 h-4'
    case 'lg': return 'w-6 h-6'
    default: return 'w-5 h-5'
  }
})

const variantClasses = computed(() => {
  const base = 'rounded-lg transition-all duration-150'

  switch (props.variant) {
    case 'primary':
      return `${base} bg-accent-lime text-neutral-900 hover:bg-accent-lime/80`
    case 'outline':
      return `${base} border-2 border-neutral-300 dark:border-neutral-600 text-neutral-600 dark:text-neutral-300 hover:border-accent-lime hover:text-accent-lime`
    default:
      return `${base} text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800`
  }
})
</script>

<template>
  <button
    :class="[sizeClasses, variantClasses, { 'bg-neutral-100 dark:bg-neutral-800': active }]"
    :title="label"
  >
    <component :is="icon" :class="iconSizeClasses" />
    <span class="sr-only">{{ label }}</span>
  </button>
</template>
