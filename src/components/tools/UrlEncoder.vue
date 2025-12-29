<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Link, Unlink, Star, Info } from 'lucide-vue-next'
import CodeEditor from '../shared/CodeEditor.vue'
import ToolCard from '../shared/ToolCard.vue'
import CopyButton from '../shared/CopyButton.vue'
import { encodeUrl, decodeUrl, encodeFullUrl, decodeFullUrl, parseUrl } from '../../utils/url'
import { useFavorites } from '../../composables/useFavorites'
import { useRecentInputs } from '../../composables/useRecentInputs'

const { addFavorite } = useFavorites()
const { addRecentInput } = useRecentInputs()

type Mode = 'encode' | 'decode'
type EncodeType = 'component' | 'full'

const input = ref('')
const mode = ref<Mode>('encode')
const encodeType = ref<EncodeType>('component')

const result = computed(() => {
  if (!input.value) {
    return { success: true, output: '' }
  }

  if (mode.value === 'encode') {
    return encodeType.value === 'component'
      ? encodeUrl(input.value)
      : encodeFullUrl(input.value)
  } else {
    return encodeType.value === 'component'
      ? decodeUrl(input.value)
      : decodeFullUrl(input.value)
  }
})

const parsedUrl = computed(() => {
  if (!input.value || mode.value === 'encode') return null
  return parseUrl(result.value.success ? result.value.output || '' : '')
})

watch(input, (val) => {
  if (val.trim()) {
    addRecentInput('url-encoder', val)
  }
})

function toggleMode() {
  if (result.value.success && result.value.output) {
    input.value = result.value.output
  }
  mode.value = mode.value === 'encode' ? 'decode' : 'encode'
}

function handleSaveFavorite() {
  const name = prompt('Enter a name for this favorite:')
  if (name && result.value.success) {
    addFavorite('url-encoder', name, input.value, result.value.output, { mode: mode.value, encodeType: encodeType.value })
  }
}
</script>

<template>
  <div class="space-y-6 animate-fade-in">
    <!-- Controls -->
    <div class="flex flex-wrap items-center gap-3">
      <!-- Mode Toggle -->
      <div class="flex items-center bg-neutral-100 dark:bg-surface-elevated rounded-lg p-1">
        <button
          @click="mode = 'encode'"
          class="flex items-center gap-2 px-4 py-2 rounded-md font-mono text-sm transition-all duration-150"
          :class="mode === 'encode'
            ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 shadow-sm'
            : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'"
        >
          <Link class="w-4 h-4" />
          Encode
        </button>
        <button
          @click="mode = 'decode'"
          class="flex items-center gap-2 px-4 py-2 rounded-md font-mono text-sm transition-all duration-150"
          :class="mode === 'decode'
            ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 shadow-sm'
            : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'"
        >
          <Unlink class="w-4 h-4" />
          Decode
        </button>
      </div>

      <!-- Encode Type -->
      <div class="flex items-center gap-2">
        <span class="text-xs font-mono text-neutral-500 dark:text-neutral-400">Type:</span>
        <select
          v-model="encodeType"
          class="bg-neutral-100 dark:bg-surface-elevated border-0 rounded-lg px-3 py-1.5 font-mono text-sm text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-accent-lime"
        >
          <option value="component">Component</option>
          <option value="full">Full URL</option>
        </select>
      </div>

      <div class="flex-1" />

      <!-- Swap Button -->
      <button
        @click="toggleMode"
        :disabled="!result.success || !result.output"
        class="flex items-center gap-2 px-3 py-1.5 rounded-lg font-mono text-sm text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
        Swap
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
          <div>
            <h3 class="font-display font-bold text-neutral-900 dark:text-neutral-100">
              {{ mode === 'encode' ? 'Text' : 'Encoded URL' }}
            </h3>
            <p class="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
              {{ mode === 'encode' ? 'Enter text to URL encode' : 'Enter URL-encoded text' }}
            </p>
          </div>
        </template>

        <CodeEditor
          v-model="input"
          :placeholder="mode === 'encode' ? 'hello world & special=chars' : 'hello%20world%20%26%20special%3Dchars'"
          :rows="8"
        />
      </ToolCard>

      <!-- Output -->
      <ToolCard>
        <template #header>
          <div class="flex items-center justify-between">
            <div>
              <h3 class="font-display font-bold text-neutral-900 dark:text-neutral-100">
                {{ mode === 'encode' ? 'Encoded' : 'Decoded' }}
              </h3>
              <p class="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
                {{ mode === 'encode' ? 'URL-safe output' : 'Plain text output' }}
              </p>
            </div>
            <CopyButton v-if="result.success && result.output" :text="result.output" />
          </div>
        </template>

        <CodeEditor
          :model-value="result.success ? result.output : ''"
          :error="!result.success ? result.error : undefined"
          :rows="8"
          readonly
        />
      </ToolCard>
    </div>

    <!-- URL Parser (when decoded output is a valid URL) -->
    <ToolCard v-if="parsedUrl?.success && parsedUrl.parsed">
      <template #header>
        <div class="flex items-center gap-2">
          <Info class="w-4 h-4 text-accent-cyan" />
          <h3 class="font-display font-bold text-neutral-900 dark:text-neutral-100">URL Analysis</h3>
        </div>
      </template>

      <div class="grid sm:grid-cols-2 gap-4">
        <div v-if="parsedUrl.parsed.protocol" class="space-y-1">
          <span class="text-xs font-mono text-neutral-500 dark:text-neutral-400 uppercase">Protocol</span>
          <p class="font-mono text-sm text-neutral-900 dark:text-neutral-100">{{ parsedUrl.parsed.protocol }}</p>
        </div>

        <div v-if="parsedUrl.parsed.host" class="space-y-1">
          <span class="text-xs font-mono text-neutral-500 dark:text-neutral-400 uppercase">Host</span>
          <p class="font-mono text-sm text-neutral-900 dark:text-neutral-100">{{ parsedUrl.parsed.host }}</p>
        </div>

        <div v-if="parsedUrl.parsed.pathname && parsedUrl.parsed.pathname !== '/'" class="space-y-1">
          <span class="text-xs font-mono text-neutral-500 dark:text-neutral-400 uppercase">Path</span>
          <p class="font-mono text-sm text-neutral-900 dark:text-neutral-100">{{ parsedUrl.parsed.pathname }}</p>
        </div>

        <div v-if="parsedUrl.parsed.hash" class="space-y-1">
          <span class="text-xs font-mono text-neutral-500 dark:text-neutral-400 uppercase">Hash</span>
          <p class="font-mono text-sm text-neutral-900 dark:text-neutral-100">{{ parsedUrl.parsed.hash }}</p>
        </div>

        <div v-if="Object.keys(parsedUrl.parsed.params).length > 0" class="sm:col-span-2 space-y-2">
          <span class="text-xs font-mono text-neutral-500 dark:text-neutral-400 uppercase">Query Parameters</span>
          <div class="space-y-1">
            <div
              v-for="(value, key) in parsedUrl.parsed.params"
              :key="key"
              class="flex items-center gap-2 p-2 bg-neutral-50 dark:bg-surface-elevated rounded-lg"
            >
              <span class="font-mono text-sm font-medium text-accent-lime">{{ key }}</span>
              <span class="text-neutral-400">=</span>
              <span class="font-mono text-sm text-neutral-900 dark:text-neutral-100">{{ value }}</span>
            </div>
          </div>
        </div>
      </div>
    </ToolCard>

    <!-- Info Box -->
    <div class="p-4 bg-neutral-50 dark:bg-surface-elevated rounded-xl border border-neutral-200 dark:border-neutral-800">
      <h4 class="font-mono text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Encoding Types</h4>
      <div class="grid sm:grid-cols-2 gap-4 text-sm text-neutral-500 dark:text-neutral-400">
        <div>
          <span class="font-medium text-neutral-700 dark:text-neutral-300">Component:</span>
          <span class="ml-1">Encodes all special characters including <code class="px-1 py-0.5 bg-neutral-200 dark:bg-neutral-700 rounded text-xs">/</code>, <code class="px-1 py-0.5 bg-neutral-200 dark:bg-neutral-700 rounded text-xs">:</code>, <code class="px-1 py-0.5 bg-neutral-200 dark:bg-neutral-700 rounded text-xs">?</code></span>
        </div>
        <div>
          <span class="font-medium text-neutral-700 dark:text-neutral-300">Full URL:</span>
          <span class="ml-1">Preserves URL structure characters, only encodes unsafe ones</span>
        </div>
      </div>
    </div>
  </div>
</template>
