<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ArrowRightLeft, Minimize2, Star, ChevronDown, FileJson, FileText } from 'lucide-vue-next'
import CodeEditor from '../shared/CodeEditor.vue'
import ToolCard from '../shared/ToolCard.vue'
import CopyButton from '../shared/CopyButton.vue'
import { parseInput, formatAsJson, formatAsYaml, minifyJson, type Format } from '../../utils/jsonYaml'
import { useFavorites } from '../../composables/useFavorites'
import { useRecentInputs } from '../../composables/useRecentInputs'
import type { Favorite } from '../../types'

const { addFavorite } = useFavorites()
const { addRecentInput, getRecentInputsByTool } = useRecentInputs()

const input = ref('')
const outputFormat = ref<Format>('json')
const indent = ref(2)
const showRecent = ref(false)

const recentInputs = getRecentInputsByTool('json-yaml')

const result = computed(() => {
  if (!input.value.trim()) {
    return { success: true, output: '', detectedFormat: null }
  }

  const parsed = parseInput(input.value)

  if (!parsed.success) {
    return { success: false, error: parsed.error }
  }

  const output = outputFormat.value === 'json'
    ? formatAsJson(parsed.data, indent.value)
    : formatAsYaml(parsed.data)

  return {
    success: true,
    output,
    detectedFormat: parsed.detectedFormat
  }
})

watch(input, (val) => {
  if (val.trim()) {
    addRecentInput('json-yaml', val)
  }
})

function handleMinify() {
  if (result.value.success && input.value.trim()) {
    const parsed = parseInput(input.value)
    if (parsed.success) {
      input.value = minifyJson(parsed.data)
    }
  }
}

function handleSaveFavorite() {
  const name = prompt('Enter a name for this favorite:')
  if (name && result.value.success) {
    addFavorite('json-yaml', name, input.value, result.value.output, { format: outputFormat.value })
  }
}

function loadFavorite(fav: Favorite) {
  input.value = fav.input
  if (fav.options?.format) {
    outputFormat.value = fav.options.format as Format
  }
}

function selectRecent(value: string) {
  input.value = value
  showRecent.value = false
}
</script>

<template>
  <div class="space-y-6 animate-fade-in">
    <!-- Controls -->
    <div class="flex flex-wrap items-center gap-3">
      <!-- Output Format -->
      <div class="flex items-center bg-neutral-100 dark:bg-surface-elevated rounded-lg p-1">
        <button
          @click="outputFormat = 'json'"
          class="flex items-center gap-2 px-3 py-1.5 rounded-md font-mono text-sm transition-all duration-150"
          :class="outputFormat === 'json'
            ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 shadow-sm'
            : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'"
        >
          <FileJson class="w-4 h-4" />
          JSON
        </button>
        <button
          @click="outputFormat = 'yaml'"
          class="flex items-center gap-2 px-3 py-1.5 rounded-md font-mono text-sm transition-all duration-150"
          :class="outputFormat === 'yaml'
            ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 shadow-sm'
            : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'"
        >
          <FileText class="w-4 h-4" />
          YAML
        </button>
      </div>

      <!-- Indent (JSON only) -->
      <div v-if="outputFormat === 'json'" class="flex items-center gap-2">
        <span class="text-xs font-mono text-neutral-500 dark:text-neutral-400">Indent:</span>
        <select
          v-model="indent"
          class="bg-neutral-100 dark:bg-surface-elevated border-0 rounded-lg px-3 py-1.5 font-mono text-sm text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-accent-lime"
        >
          <option :value="2">2 spaces</option>
          <option :value="4">4 spaces</option>
          <option :value="0">Tab</option>
        </select>
      </div>

      <div class="flex-1" />

      <!-- Actions -->
      <button
        @click="handleMinify"
        :disabled="!input.trim() || !result.success"
        class="flex items-center gap-2 px-3 py-1.5 rounded-lg font-mono text-sm text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Minimize2 class="w-4 h-4" />
        Minify
      </button>

      <button
        @click="handleSaveFavorite"
        :disabled="!input.trim() || !result.success"
        class="flex items-center gap-2 px-3 py-1.5 rounded-lg font-mono text-sm text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Star class="w-4 h-4" />
        Save
      </button>
    </div>

    <!-- Main Grid -->
    <div class="grid lg:grid-cols-2 gap-6">
      <!-- Input -->
      <ToolCard>
        <template #header>
          <div class="flex items-center justify-between">
            <div>
              <h3 class="font-display font-bold text-neutral-900 dark:text-neutral-100">Input</h3>
              <p class="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
                Paste JSON or YAML
              </p>
            </div>

            <!-- Recent Inputs -->
            <div v-if="recentInputs.length > 0" class="relative">
              <button
                @click="showRecent = !showRecent"
                class="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
              >
                Recent
                <ChevronDown class="w-3.5 h-3.5" :class="showRecent ? 'rotate-180' : ''" />
              </button>

              <transition
                enter-active-class="transition-all duration-150"
                enter-from-class="opacity-0 scale-95"
                enter-to-class="opacity-100 scale-100"
                leave-active-class="transition-all duration-100"
                leave-from-class="opacity-100 scale-100"
                leave-to-class="opacity-0 scale-95"
              >
                <div
                  v-if="showRecent"
                  class="absolute right-0 top-full mt-1 w-64 max-h-48 overflow-auto bg-white dark:bg-surface-elevated border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-lg z-10"
                >
                  <button
                    v-for="recent in recentInputs"
                    :key="recent.id"
                    @click="selectRecent(recent.value)"
                    class="w-full px-3 py-2 text-left text-xs font-mono text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 truncate"
                  >
                    {{ recent.value.slice(0, 50) }}{{ recent.value.length > 50 ? '...' : '' }}
                  </button>
                </div>
              </transition>
            </div>
          </div>
        </template>

        <CodeEditor
          v-model="input"
          placeholder='{"key": "value"} or key: value'
          :rows="12"
        />

        <!-- Detected Format Badge -->
        <div v-if="result.detectedFormat" class="mt-3">
          <span class="badge-lime">
            Detected: {{ result.detectedFormat.toUpperCase() }}
          </span>
        </div>
      </ToolCard>

      <!-- Output -->
      <ToolCard>
        <template #header>
          <div class="flex items-center justify-between">
            <div>
              <h3 class="font-display font-bold text-neutral-900 dark:text-neutral-100">Output</h3>
              <p class="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
                Formatted {{ outputFormat.toUpperCase() }}
              </p>
            </div>
            <CopyButton v-if="result.success && result.output" :text="result.output" />
          </div>
        </template>

        <CodeEditor
          :model-value="result.success ? result.output : ''"
          :error="!result.success ? result.error : undefined"
          :rows="12"
          readonly
        />
      </ToolCard>
    </div>
  </div>
</template>
