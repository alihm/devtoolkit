<script setup lang="ts">
import { ref } from 'vue'
import { Sun, Moon, Monitor, Download, Upload, Terminal } from 'lucide-vue-next'
import { useTheme } from '../../composables/useTheme'
import { exportAllData, importAllData } from '../../composables/useLocalStorage'
import IconButton from '../shared/IconButton.vue'

const { theme, toggleTheme } = useTheme()

const importInput = ref<HTMLInputElement | null>(null)
const showExportSuccess = ref(false)

function getThemeIcon() {
  switch (theme.value) {
    case 'light': return Sun
    case 'dark': return Moon
    default: return Monitor
  }
}

function handleExport() {
  const data = exportAllData()
  const blob = new Blob([data], { type: 'application/json' })
  const url = URL.createObjectURL(blob)

  const a = document.createElement('a')
  a.href = url
  a.download = `devtoolkit-backup-${new Date().toISOString().split('T')[0]}.json`
  a.click()

  URL.revokeObjectURL(url)

  showExportSuccess.value = true
  setTimeout(() => {
    showExportSuccess.value = false
  }, 2000)
}

function handleImportClick() {
  importInput.value?.click()
}

function handleImport(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (!file) return

  const reader = new FileReader()
  reader.onload = (e) => {
    const content = e.target?.result as string
    if (importAllData(content)) {
      window.location.reload()
    }
  }
  reader.readAsText(file)
}
</script>

<template>
  <header class="sticky top-0 z-50 bg-surface-light/80 dark:bg-surface-dark/80 backdrop-blur-xl border-b-2 border-neutral-200 dark:border-neutral-800">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        <!-- Logo -->
        <div class="flex items-center gap-3">
          <div class="relative">
            <div class="w-10 h-10 bg-neutral-900 dark:bg-accent-lime rounded-lg flex items-center justify-center shadow-brutal-sm dark:shadow-none">
              <Terminal class="w-5 h-5 text-accent-lime dark:text-neutral-900" />
            </div>
            <div class="absolute -top-1 -right-1 w-3 h-3 bg-accent-lime dark:bg-accent-coral rounded-full animate-pulse" />
          </div>
          <div>
            <h1 class="font-display font-bold text-lg text-neutral-900 dark:text-neutral-100">
              DevToolkit
            </h1>
            <p class="text-[10px] font-mono text-neutral-500 dark:text-neutral-500 uppercase tracking-wider">
              Developer Utilities
            </p>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex items-center gap-2">
          <!-- Theme Toggle -->
          <div class="relative">
            <IconButton
              :icon="getThemeIcon()"
              :label="theme === 'system' ? 'System theme' : theme === 'dark' ? 'Dark mode' : 'Light mode'"
              @click="toggleTheme"
            />
          </div>

          <!-- Divider -->
          <div class="w-px h-6 bg-neutral-200 dark:bg-neutral-700" />

          <!-- Export -->
          <div class="relative">
            <IconButton
              :icon="Download"
              label="Export data"
              @click="handleExport"
            />
            <transition
              enter-active-class="transition-all duration-200"
              enter-from-class="opacity-0 scale-90"
              enter-to-class="opacity-100 scale-100"
              leave-active-class="transition-all duration-150"
              leave-from-class="opacity-100 scale-100"
              leave-to-class="opacity-0 scale-90"
            >
              <div
                v-if="showExportSuccess"
                class="absolute top-full mt-2 right-0 px-3 py-1.5 bg-green-500 text-white text-xs font-mono rounded-lg whitespace-nowrap shadow-lg"
              >
                Exported!
              </div>
            </transition>
          </div>

          <!-- Import -->
          <IconButton
            :icon="Upload"
            label="Import data"
            @click="handleImportClick"
          />
          <input
            ref="importInput"
            type="file"
            accept=".json"
            class="hidden"
            @change="handleImport"
          />
        </div>
      </div>
    </div>
  </header>
</template>
