<script setup lang="ts">
defineProps<{
  title?: string
  description?: string
}>()
</script>

<template>
  <div class="relative">
    <!-- Card -->
    <div class="bg-white dark:bg-surface-muted border-2 border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden">
      <!-- Header -->
      <div v-if="title || $slots.header" class="px-5 py-4 border-b border-neutral-100 dark:border-neutral-800">
        <slot name="header">
          <div>
            <h3 class="font-display font-bold text-neutral-900 dark:text-neutral-100">
              {{ title }}
            </h3>
            <p v-if="description" class="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
              {{ description }}
            </p>
          </div>
        </slot>
      </div>

      <!-- Content -->
      <div class="p-5">
        <slot />
      </div>

      <!-- Footer -->
      <div v-if="$slots.footer" class="px-5 py-3 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-surface-elevated">
        <slot name="footer" />
      </div>
    </div>
  </div>
</template>
