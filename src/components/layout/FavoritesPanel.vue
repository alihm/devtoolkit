<script setup lang="ts">
import { ref, computed } from 'vue'
import { Star, ChevronDown, Trash2, ExternalLink } from 'lucide-vue-next'
import { useFavorites } from '../../composables/useFavorites'
import type { ToolId, Favorite } from '../../types'
import { TOOLS } from '../../types'

const props = defineProps<{
  currentTool: ToolId
}>()

const emit = defineEmits<{
  (e: 'select', favorite: Favorite): void
}>()

const { favorites, removeFavorite } = useFavorites()
const isOpen = ref(false)

const currentToolFavorites = computed(() =>
  favorites.value.filter(f => f.toolId === props.currentTool)
)

const otherFavorites = computed(() =>
  favorites.value.filter(f => f.toolId !== props.currentTool)
)

function getToolName(toolId: ToolId): string {
  return TOOLS.find(t => t.id === toolId)?.name || toolId
}

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  })
}

function truncate(str: string, length: number): string {
  if (str.length <= length) return str
  return str.slice(0, length) + '...'
}
</script>

<template>
  <div class="relative">
    <!-- Toggle Button -->
    <button
      @click="isOpen = !isOpen"
      class="flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-sm transition-all duration-150"
      :class="[
        favorites.length > 0
          ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-2 border-amber-300 dark:border-amber-700'
          : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 border-2 border-transparent'
      ]"
    >
      <Star class="w-4 h-4" :class="favorites.length > 0 ? 'fill-current' : ''" />
      <span class="hidden sm:inline">Favorites</span>
      <span v-if="favorites.length > 0" class="bg-amber-500 text-white text-xs px-1.5 py-0.5 rounded-full font-bold">
        {{ favorites.length }}
      </span>
      <ChevronDown
        class="w-4 h-4 transition-transform duration-150"
        :class="isOpen ? 'rotate-180' : ''"
      />
    </button>

    <!-- Dropdown -->
    <transition
      enter-active-class="transition-all duration-200 ease-out"
      enter-from-class="opacity-0 translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition-all duration-150 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 translate-y-2"
    >
      <div
        v-if="isOpen"
        class="absolute right-0 top-full mt-2 w-80 max-h-96 overflow-auto bg-white dark:bg-surface-muted border-2 border-neutral-200 dark:border-neutral-700 rounded-xl shadow-xl z-50"
      >
        <!-- Empty State -->
        <div v-if="favorites.length === 0" class="p-6 text-center">
          <Star class="w-8 h-8 mx-auto mb-3 text-neutral-300 dark:text-neutral-600" />
          <p class="font-mono text-sm text-neutral-500 dark:text-neutral-400">
            No favorites yet
          </p>
          <p class="text-xs text-neutral-400 dark:text-neutral-500 mt-1">
            Save inputs to quickly access them later
          </p>
        </div>

        <!-- Current Tool Favorites -->
        <div v-if="currentToolFavorites.length > 0">
          <div class="px-4 py-2 bg-neutral-50 dark:bg-surface-elevated border-b border-neutral-100 dark:border-neutral-800">
            <span class="text-xs font-mono font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
              Current Tool
            </span>
          </div>
          <div class="divide-y divide-neutral-100 dark:divide-neutral-800">
            <div
              v-for="fav in currentToolFavorites"
              :key="fav.id"
              class="group px-4 py-3 hover:bg-neutral-50 dark:hover:bg-surface-elevated transition-colors cursor-pointer"
              @click="emit('select', fav); isOpen = false"
            >
              <div class="flex items-start justify-between gap-2">
                <div class="flex-1 min-w-0">
                  <p class="font-mono text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate">
                    {{ fav.name }}
                  </p>
                  <p class="font-mono text-xs text-neutral-500 dark:text-neutral-500 truncate mt-0.5">
                    {{ truncate(fav.input, 50) }}
                  </p>
                </div>
                <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    @click.stop="removeFavorite(fav.id)"
                    class="p-1 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                  >
                    <Trash2 class="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <p class="text-[10px] font-mono text-neutral-400 dark:text-neutral-600 mt-1">
                {{ formatDate(fav.createdAt) }}
              </p>
            </div>
          </div>
        </div>

        <!-- Other Favorites -->
        <div v-if="otherFavorites.length > 0">
          <div class="px-4 py-2 bg-neutral-50 dark:bg-surface-elevated border-y border-neutral-100 dark:border-neutral-800">
            <span class="text-xs font-mono font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
              Other Tools
            </span>
          </div>
          <div class="divide-y divide-neutral-100 dark:divide-neutral-800">
            <div
              v-for="fav in otherFavorites"
              :key="fav.id"
              class="group px-4 py-3 hover:bg-neutral-50 dark:hover:bg-surface-elevated transition-colors"
            >
              <div class="flex items-start justify-between gap-2">
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2">
                    <span class="badge-lime">{{ getToolName(fav.toolId) }}</span>
                  </div>
                  <p class="font-mono text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate mt-1">
                    {{ fav.name }}
                  </p>
                </div>
                <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    @click.stop="removeFavorite(fav.id)"
                    class="p-1 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                  >
                    <Trash2 class="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- Backdrop -->
    <div
      v-if="isOpen"
      class="fixed inset-0 z-40"
      @click="isOpen = false"
    />
  </div>
</template>
