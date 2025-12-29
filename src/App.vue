<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import AppHeader from './components/layout/AppHeader.vue'
import TabNavigation from './components/layout/TabNavigation.vue'
import FavoritesPanel from './components/layout/FavoritesPanel.vue'
import JsonYamlFormatter from './components/tools/JsonYamlFormatter.vue'
import Base64Tool from './components/tools/Base64Tool.vue'
import UrlEncoder from './components/tools/UrlEncoder.vue'
import RegexTester from './components/tools/RegexTester.vue'
import JwtDecoder from './components/tools/JwtDecoder.vue'
import CronExplainer from './components/tools/CronExplainer.vue'
import { useLocalStorage } from './composables/useLocalStorage'
import { useTheme } from './composables/useTheme'
import type { ToolId, Favorite } from './types'
import { TOOLS } from './types'

// Initialize theme
useTheme()

// Active tab with persistence
const activeTab = useLocalStorage<ToolId>('devtoolkit-active-tab', 'json-yaml')

// Component map
const toolComponents = {
  'json-yaml': JsonYamlFormatter,
  'base64': Base64Tool,
  'url-encoder': UrlEncoder,
  'regex': RegexTester,
  'jwt': JwtDecoder,
  'cron': CronExplainer
} as const

const currentComponent = computed(() => toolComponents[activeTab.value])

const currentTool = computed(() => TOOLS.find(t => t.id === activeTab.value))

// Handle favorite selection
function handleFavoriteSelect(favorite: Favorite) {
  activeTab.value = favorite.toolId
  // The individual tool components will handle loading the favorite data
  // through their own favorite management
}
</script>

<template>
  <div class="min-h-screen bg-surface-light dark:bg-surface-dark bg-grid relative">
    <!-- Noise Overlay -->
    <div class="noise-overlay fixed inset-0 pointer-events-none" />

    <!-- Header -->
    <AppHeader />

    <!-- Tab Navigation -->
    <TabNavigation v-model:active-tab="activeTab" />

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Tool Header -->
      <div class="flex items-center justify-between mb-8">
        <div class="animate-slide-up">
          <h2 class="font-display text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            {{ currentTool?.name }}
          </h2>
          <p class="text-neutral-500 dark:text-neutral-400 mt-1">
            {{ currentTool?.description }}
          </p>
        </div>

        <FavoritesPanel
          :current-tool="activeTab"
          @select="handleFavoriteSelect"
        />
      </div>

      <!-- Tool Content -->
      <transition
        mode="out-in"
        enter-active-class="transition-all duration-200 ease-out"
        enter-from-class="opacity-0 translate-y-2"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition-all duration-150 ease-in"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 translate-y-2"
      >
        <component :is="currentComponent" :key="activeTab" />
      </transition>
    </main>

    <!-- Footer -->
    <footer class="border-t border-neutral-200 dark:border-neutral-800 mt-16">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p class="text-sm font-mono text-neutral-500 dark:text-neutral-500">
            DevToolkit — Developer utilities in your browser
          </p>
          <div class="flex items-center gap-4 text-xs font-mono text-neutral-400 dark:text-neutral-600">
            <span>Built with Vue 3</span>
            <span>•</span>
            <span>Data stored locally</span>
            <span>•</span>
            <span>No server required</span>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>
