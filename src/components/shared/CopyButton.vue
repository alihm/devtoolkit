<script setup lang="ts">
import { ref } from 'vue'
import { Copy, Check } from 'lucide-vue-next'

const props = defineProps<{
  text: string
  size?: 'sm' | 'md'
}>()

const copied = ref(false)

async function copyToClipboard() {
  try {
    await navigator.clipboard.writeText(props.text)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch (err) {
    console.error('Failed to copy:', err)
  }
}
</script>

<template>
  <button
    @click="copyToClipboard"
    class="inline-flex items-center gap-1.5 font-mono text-xs transition-all duration-150"
    :class="[
      size === 'sm' ? 'px-2 py-1' : 'px-3 py-1.5',
      copied
        ? 'text-green-600 dark:text-green-400'
        : 'text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100'
    ]"
  >
    <component
      :is="copied ? Check : Copy"
      :class="size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'"
    />
    <span>{{ copied ? 'Copied!' : 'Copy' }}</span>
  </button>
</template>
