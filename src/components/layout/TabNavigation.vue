<script setup lang="ts">
import { computed } from 'vue'
import { Braces, Binary, Link, Regex, KeyRound, Clock } from 'lucide-vue-next'
import type { ToolId } from '../../types'
import { TOOLS } from '../../types'

defineProps<{
  activeTab: ToolId
}>()

const emit = defineEmits<{
  (e: 'update:activeTab', tab: ToolId): void
}>()

const iconMap = {
  'json-yaml': Braces,
  'base64': Binary,
  'url-encoder': Link,
  'regex': Regex,
  'jwt': KeyRound,
  'cron': Clock
} as const

const tools = computed(() => TOOLS.map(tool => ({
  ...tool,
  icon: iconMap[tool.id]
})))
</script>

<template>
  <nav class="bg-white dark:bg-surface-muted border-b-2 border-neutral-200 dark:border-neutral-800 sticky top-16 z-40">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Desktop Tabs -->
      <div class="hidden md:flex items-center gap-1 py-2 overflow-x-auto scrollbar-hide">
        <button
          v-for="tool in tools"
          :key="tool.id"
          @click="emit('update:activeTab', tool.id)"
          class="relative flex items-center gap-2.5 px-4 py-2.5 rounded-lg font-mono text-sm transition-all duration-150 whitespace-nowrap group"
          :class="[
            activeTab === tool.id
              ? 'bg-neutral-900 dark:bg-accent-lime text-white dark:text-neutral-900 shadow-brutal-sm dark:shadow-none'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800'
          ]"
        >
          <component
            :is="tool.icon"
            class="w-4 h-4"
            :class="activeTab === tool.id ? '' : 'group-hover:text-accent-lime'"
          />
          <span class="font-medium">{{ tool.name }}</span>
        </button>
      </div>

      <!-- Mobile Dropdown -->
      <div class="md:hidden py-3">
        <div class="relative">
          <select
            :value="activeTab"
            @change="emit('update:activeTab', ($event.target as HTMLSelectElement).value as ToolId)"
            class="w-full appearance-none bg-neutral-100 dark:bg-surface-elevated border-2 border-neutral-200 dark:border-neutral-700 rounded-lg px-4 py-3 pr-10 font-mono text-sm font-medium text-neutral-900 dark:text-neutral-100 focus:border-accent-lime focus:outline-none"
          >
            <option
              v-for="tool in tools"
              :key="tool.id"
              :value="tool.id"
            >
              {{ tool.name }} — {{ tool.description }}
            </option>
          </select>
          <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <svg class="w-5 h-5 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<style scoped>
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
</style>
