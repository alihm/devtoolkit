<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Lock, Unlock, Star, ChevronDown } from 'lucide-vue-next'
import CodeEditor from '../shared/CodeEditor.vue'
import ToolCard from '../shared/ToolCard.vue'
import CopyButton from '../shared/CopyButton.vue'
import { encodeBase64, decodeBase64, encodeUrlSafeBase64, decodeUrlSafeBase64, isValidBase64 } from '../../utils/base64'
import { useFavorites } from '../../composables/useFavorites'
import { useRecentInputs } from '../../composables/useRecentInputs'

const { addFavorite } = useFavorites()
const { addRecentInput, getRecentInputsByTool } = useRecentInputs()

type Mode = 'encode' | 'decode'

const input = ref('')
const mode = ref<Mode>('encode')
const urlSafe = ref(false)
const showRecent = ref(false)

const recentInputs = getRecentInputsByTool('base64')

const result = computed(() => {
  if (!input.value) {
    return { success: true, output: '' }
  }

  if (mode.value === 'encode') {
    return urlSafe.value
      ? encodeUrlSafeBase64(input.value)
      : encodeBase64(input.value)
  } else {
    return urlSafe.value
      ? decodeUrlSafeBase64(input.value)
      : decodeBase64(input.value)
  }
})

const inputValidation = computed(() => {
  if (!input.value || mode.value === 'encode') return null
  return isValidBase64(input.value) ? 'valid' : 'invalid'
})

watch(input, (val) => {
  if (val.trim()) {
    addRecentInput('base64', val)
  }
})

function toggleMode() {
  // Swap input and output
  if (result.value.success && result.value.output) {
    input.value = result.value.output
  }
  mode.value = mode.value === 'encode' ? 'decode' : 'encode'
}

function handleSaveFavorite() {
  const name = prompt('Enter a name for this favorite:')
  if (name && result.value.success) {
    addFavorite('base64', name, input.value, result.value.output, { mode: mode.value, urlSafe: urlSafe.value })
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
      <!-- Mode Toggle -->
      <div class="flex items-center bg-neutral-100 dark:bg-surface-elevated rounded-lg p-1">
        <button
          @click="mode = 'encode'"
          class="flex items-center gap-2 px-4 py-2 rounded-md font-mono text-sm transition-all duration-150"
          :class="mode === 'encode'
            ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 shadow-sm'
            : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'"
        >
          <Lock class="w-4 h-4" />
          Encode
        </button>
        <button
          @click="mode = 'decode'"
          class="flex items-center gap-2 px-4 py-2 rounded-md font-mono text-sm transition-all duration-150"
          :class="mode === 'decode'
            ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 shadow-sm'
            : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'"
        >
          <Unlock class="w-4 h-4" />
          Decode
        </button>
      </div>

      <!-- URL Safe Toggle -->
      <label class="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          v-model="urlSafe"
          class="w-4 h-4 rounded border-neutral-300 dark:border-neutral-600 text-accent-lime focus:ring-accent-lime dark:bg-surface-elevated"
        />
        <span class="text-sm font-mono text-neutral-600 dark:text-neutral-400">URL-safe</span>
      </label>

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
          <div class="flex items-center justify-between">
            <div>
              <h3 class="font-display font-bold text-neutral-900 dark:text-neutral-100">
                {{ mode === 'encode' ? 'Text' : 'Base64' }}
              </h3>
              <p class="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
                {{ mode === 'encode' ? 'Enter text to encode' : 'Enter Base64 to decode' }}
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
            </div>
          </div>
        </template>

        <CodeEditor
          v-model="input"
          :placeholder="mode === 'encode' ? 'Hello, World!' : 'SGVsbG8sIFdvcmxkIQ=='"
          :rows="10"
        />

        <!-- Validation Badge -->
        <div v-if="inputValidation" class="mt-3">
          <span
            :class="inputValidation === 'valid' ? 'badge-lime' : 'badge-coral'"
          >
            {{ inputValidation === 'valid' ? 'Valid Base64' : 'Invalid Base64' }}
          </span>
        </div>
      </ToolCard>

      <!-- Output -->
      <ToolCard>
        <template #header>
          <div class="flex items-center justify-between">
            <div>
              <h3 class="font-display font-bold text-neutral-900 dark:text-neutral-100">
                {{ mode === 'encode' ? 'Base64' : 'Text' }}
              </h3>
              <p class="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
                {{ mode === 'encode' ? 'Encoded output' : 'Decoded output' }}
              </p>
            </div>
            <CopyButton v-if="result.success && result.output" :text="result.output" />
          </div>
        </template>

        <CodeEditor
          :model-value="result.success ? result.output : ''"
          :error="!result.success ? result.error : undefined"
          :rows="10"
          readonly
        />
      </ToolCard>
    </div>

    <!-- Info Box -->
    <div class="p-4 bg-neutral-50 dark:bg-surface-elevated rounded-xl border border-neutral-200 dark:border-neutral-800">
      <h4 class="font-mono text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">About Base64</h4>
      <p class="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
        Base64 encoding converts binary data to ASCII text. URL-safe Base64 replaces <code class="px-1 py-0.5 bg-neutral-200 dark:bg-neutral-700 rounded text-xs">+</code> with <code class="px-1 py-0.5 bg-neutral-200 dark:bg-neutral-700 rounded text-xs">-</code> and <code class="px-1 py-0.5 bg-neutral-200 dark:bg-neutral-700 rounded text-xs">/</code> with <code class="px-1 py-0.5 bg-neutral-200 dark:bg-neutral-700 rounded text-xs">_</code> for use in URLs.
      </p>
    </div>
  </div>
</template>
