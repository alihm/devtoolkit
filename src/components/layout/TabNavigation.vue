<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  ChevronDown,
  Braces,
  Binary,
  Link,
  Regex,
  KeyRound,
  Clock,
  Hash,
  Fingerprint,
  Timer,
  Palette,
  Type,
  FileCode,
  Lock,
  Sparkles,
  ArrowLeftRight,
  GitCompare,
  CaseSensitive
} from 'lucide-vue-next'
import type { ToolId } from '../../types'
import { TOOLS } from '../../types'

const props = defineProps<{
  activeTab: ToolId
}>()

const emit = defineEmits<{
  (e: 'update:activeTab', tab: ToolId): void
}>()

const openCategory = ref<string | null>(null)

const iconMap = {
  'json-yaml': Braces,
  'base64': Binary,
  'url-encoder': Link,
  'regex': Regex,
  'jwt': KeyRound,
  'cron': Clock,
  'hash': Hash,
  'uuid': Fingerprint,
  'timestamp': Timer,
  'color': Palette,
  'lorem': Type,
  'diff': GitCompare,
  'string': CaseSensitive
} as const

// Group tools by category with category icons
const toolCategories = [
  {
    id: 'formatters',
    name: 'Formatters',
    icon: FileCode,
    tools: ['json-yaml', 'regex', 'diff', 'string'] as ToolId[]
  },
  {
    id: 'encoders',
    name: 'Encoders',
    icon: Lock,
    tools: ['base64', 'url-encoder', 'jwt'] as ToolId[]
  },
  {
    id: 'generators',
    name: 'Generators',
    icon: Sparkles,
    tools: ['hash', 'uuid', 'lorem'] as ToolId[]
  },
  {
    id: 'converters',
    name: 'Converters',
    icon: ArrowLeftRight,
    tools: ['timestamp', 'color', 'cron'] as ToolId[]
  }
]

const categorizedTools = computed(() => {
  return toolCategories.map(category => ({
    ...category,
    tools: category.tools.map(id => {
      const tool = TOOLS.find(t => t.id === id)!
      return { ...tool, icon: iconMap[id] }
    }),
    hasActiveTool: category.tools.includes(props.activeTab)
  }))
})

const currentTool = computed(() => {
  const tool = TOOLS.find(t => t.id === props.activeTab)
  return tool ? { ...tool, icon: iconMap[tool.id] } : null
})

function toggleCategory(categoryId: string) {
  openCategory.value = openCategory.value === categoryId ? null : categoryId
}

function selectTool(id: ToolId) {
  emit('update:activeTab', id)
  openCategory.value = null
}

function closeAll() {
  openCategory.value = null
}
</script>

<template>
  <nav class="bg-white dark:bg-surface-muted border-b-2 border-neutral-200 dark:border-neutral-800 sticky top-16 z-40">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Desktop: Category Dropdowns -->
      <div class="hidden md:flex items-center gap-2 py-3">
        <div
          v-for="category in categorizedTools"
          :key="category.id"
          class="relative"
        >
          <button
            @click="toggleCategory(category.id)"
            class="flex items-center gap-2 px-4 py-2.5 rounded-lg font-mono text-sm transition-all duration-150"
            :class="[
              category.hasActiveTool
                ? 'bg-neutral-900 dark:bg-accent-lime text-white dark:text-neutral-900 shadow-brutal-sm dark:shadow-none'
                : openCategory === category.id
                  ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100'
                  : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-neutral-100'
            ]"
          >
            <component
              :is="category.icon"
              class="w-4 h-4"
              :class="category.hasActiveTool ? '' : 'text-accent-lime'"
            />
            <span class="font-medium">{{ category.name }}</span>
            <ChevronDown
              class="w-4 h-4 transition-transform duration-200"
              :class="{ 'rotate-180': openCategory === category.id }"
            />
          </button>

          <!-- Category Dropdown -->
          <Transition
            enter-active-class="transition duration-150 ease-out"
            enter-from-class="opacity-0 -translate-y-2 scale-95"
            enter-to-class="opacity-100 translate-y-0 scale-100"
            leave-active-class="transition duration-100 ease-in"
            leave-from-class="opacity-100 translate-y-0 scale-100"
            leave-to-class="opacity-0 -translate-y-2 scale-95"
          >
            <div
              v-if="openCategory === category.id"
              class="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-surface-elevated border-2 border-neutral-200 dark:border-neutral-700 rounded-xl shadow-brutal overflow-hidden z-50"
            >
              <!-- Click outside to close -->
              <div
                class="fixed inset-0 z-[-1]"
                @click="closeAll"
              />

              <div class="p-2">
                <button
                  v-for="tool in category.tools"
                  :key="tool.id"
                  @click="selectTool(tool.id)"
                  class="flex items-center gap-3 w-full px-3 py-3 rounded-lg text-left transition-all duration-150"
                  :class="[
                    activeTab === tool.id
                      ? 'bg-accent-lime/20 dark:bg-accent-lime/20 text-neutral-900 dark:text-neutral-100'
                      : 'hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
                  ]"
                >
                  <component
                    :is="tool.icon"
                    class="w-5 h-5 flex-shrink-0"
                    :class="activeTab === tool.id ? 'text-accent-lime' : 'text-neutral-400'"
                  />
                  <div class="min-w-0 flex-1">
                    <div class="font-mono text-sm font-medium">{{ tool.name }}</div>
                    <div class="text-xs text-neutral-400 dark:text-neutral-500">
                      {{ tool.description }}
                    </div>
                  </div>
                  <div
                    v-if="activeTab === tool.id"
                    class="w-2 h-2 rounded-full bg-accent-lime flex-shrink-0"
                  />
                </button>
              </div>
            </div>
          </Transition>
        </div>

        <!-- Current Tool Indicator -->
        <div class="flex-1" />
        <div class="flex items-center gap-2 px-3 py-1.5 bg-neutral-50 dark:bg-surface-elevated rounded-lg border border-neutral-200 dark:border-neutral-700">
          <component
            v-if="currentTool"
            :is="currentTool.icon"
            class="w-4 h-4 text-accent-lime"
          />
          <span class="font-mono text-sm text-neutral-600 dark:text-neutral-400">
            {{ currentTool?.name }}
          </span>
        </div>
      </div>

      <!-- Mobile: Single Dropdown -->
      <div class="md:hidden py-3">
        <div class="relative">
          <button
            @click="openCategory = openCategory ? null : 'mobile'"
            class="flex items-center gap-3 px-4 py-3 w-full bg-neutral-100 dark:bg-surface-elevated border-2 border-neutral-200 dark:border-neutral-700 rounded-xl font-mono text-sm font-medium text-neutral-900 dark:text-neutral-100"
          >
            <component
              v-if="currentTool"
              :is="currentTool.icon"
              class="w-5 h-5 text-accent-lime"
            />
            <div class="flex-1 text-left">
              <span class="font-semibold">{{ currentTool?.name }}</span>
            </div>
            <ChevronDown
              class="w-5 h-5 text-neutral-400 transition-transform duration-200"
              :class="{ 'rotate-180': openCategory === 'mobile' }"
            />
          </button>

          <!-- Mobile Dropdown -->
          <Transition
            enter-active-class="transition duration-150 ease-out"
            enter-from-class="opacity-0 -translate-y-2"
            enter-to-class="opacity-100 translate-y-0"
            leave-active-class="transition duration-100 ease-in"
            leave-from-class="opacity-100 translate-y-0"
            leave-to-class="opacity-0 -translate-y-2"
          >
            <div
              v-if="openCategory === 'mobile'"
              class="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-surface-elevated border-2 border-neutral-200 dark:border-neutral-700 rounded-xl shadow-brutal overflow-hidden z-50"
            >
              <div
                class="fixed inset-0 z-[-1]"
                @click="closeAll"
              />

              <div class="p-2 max-h-[60vh] overflow-y-auto">
                <div
                  v-for="category in categorizedTools"
                  :key="category.id"
                  class="mb-2 last:mb-0"
                >
                  <div class="flex items-center gap-2 px-3 py-2 text-xs font-mono font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
                    <component :is="category.icon" class="w-3.5 h-3.5" />
                    {{ category.name }}
                  </div>

                  <button
                    v-for="tool in category.tools"
                    :key="tool.id"
                    @click="selectTool(tool.id)"
                    class="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-left transition-all duration-150"
                    :class="[
                      activeTab === tool.id
                        ? 'bg-accent-lime/20 text-neutral-900 dark:text-neutral-100'
                        : 'hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
                    ]"
                  >
                    <component
                      :is="tool.icon"
                      class="w-4 h-4 flex-shrink-0"
                      :class="activeTab === tool.id ? 'text-accent-lime' : 'text-neutral-400'"
                    />
                    <span class="font-mono text-sm">{{ tool.name }}</span>
                  </button>
                </div>
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </div>
  </nav>
</template>
