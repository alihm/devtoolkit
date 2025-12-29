<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Hash, Star, AlertTriangle, CheckCircle, XCircle, RefreshCw } from 'lucide-vue-next'
import CodeEditor from '../shared/CodeEditor.vue'
import ToolCard from '../shared/ToolCard.vue'
import CopyButton from '../shared/CopyButton.vue'
import { generateHash, generateAllHashes, compareHashes, HASH_INFO, type HashAlgorithm } from '../../utils/hash'
import { useFavorites } from '../../composables/useFavorites'
import { useRecentInputs } from '../../composables/useRecentInputs'

const { addFavorite } = useFavorites()
const { addRecentInput } = useRecentInputs()

const input = ref('')
const selectedAlgorithm = ref<HashAlgorithm>('SHA-256')
const currentHash = ref('')
const allHashes = ref<Record<HashAlgorithm, { success: boolean; hash?: string; error?: string }> | null>(null)
const isGenerating = ref(false)
const showAllHashes = ref(false)

// Compare mode
const compareMode = ref(false)
const compareHash = ref('')

const compareResult = computed(() => {
  if (!compareMode.value || !currentHash.value || !compareHash.value.trim()) {
    return null
  }
  return compareHashes(currentHash.value, compareHash.value)
})

const algorithms: HashAlgorithm[] = ['MD5', 'SHA-1', 'SHA-256', 'SHA-384', 'SHA-512']

watch([input, selectedAlgorithm], async ([newInput]) => {
  if (!newInput.trim()) {
    currentHash.value = ''
    allHashes.value = null
    return
  }

  isGenerating.value = true

  try {
    if (showAllHashes.value) {
      allHashes.value = await generateAllHashes(newInput)
      currentHash.value = allHashes.value[selectedAlgorithm.value].hash || ''
    } else {
      const result = await generateHash(newInput, selectedAlgorithm.value)
      currentHash.value = result.hash || ''
    }
  } finally {
    isGenerating.value = false
  }

  addRecentInput('hash', newInput)
})

watch(showAllHashes, async (show) => {
  if (show && input.value.trim()) {
    isGenerating.value = true
    allHashes.value = await generateAllHashes(input.value)
    isGenerating.value = false
  }
})

function handleSaveFavorite() {
  const name = prompt('Enter a name for this favorite:')
  if (name && currentHash.value) {
    addFavorite('hash', name, input.value, currentHash.value, { algorithm: selectedAlgorithm.value })
  }
}

function selectAlgorithm(algo: HashAlgorithm) {
  selectedAlgorithm.value = algo
  if (allHashes.value) {
    currentHash.value = allHashes.value[algo].hash || ''
  }
}
</script>

<template>
  <div class="space-y-6 animate-fade-in">
    <!-- Controls -->
    <div class="flex flex-wrap items-center gap-3">
      <!-- Algorithm Selector -->
      <div class="flex items-center bg-neutral-100 dark:bg-surface-elevated rounded-lg p-1">
        <button
          v-for="algo in algorithms"
          :key="algo"
          @click="selectAlgorithm(algo)"
          class="relative px-3 py-1.5 rounded-md font-mono text-xs transition-all duration-150"
          :class="selectedAlgorithm === algo
            ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 shadow-sm'
            : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'"
        >
          {{ algo }}
          <span
            v-if="HASH_INFO[algo].deprecated"
            class="absolute -top-1 -right-1 w-2 h-2 bg-amber-500 rounded-full"
            title="Deprecated - not recommended for security"
          />
        </button>
      </div>

      <!-- Show All Toggle -->
      <label class="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          v-model="showAllHashes"
          class="w-4 h-4 rounded border-neutral-300 dark:border-neutral-600 text-accent-lime focus:ring-accent-lime dark:bg-surface-elevated"
        />
        <span class="text-sm font-mono text-neutral-600 dark:text-neutral-400">Show all</span>
      </label>

      <!-- Compare Mode Toggle -->
      <label class="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          v-model="compareMode"
          class="w-4 h-4 rounded border-neutral-300 dark:border-neutral-600 text-accent-lime focus:ring-accent-lime dark:bg-surface-elevated"
        />
        <span class="text-sm font-mono text-neutral-600 dark:text-neutral-400">Compare</span>
      </label>

      <div class="flex-1" />

      <button
        @click="handleSaveFavorite"
        :disabled="!input.trim() || !currentHash"
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
            <h3 class="font-display font-bold text-neutral-900 dark:text-neutral-100">Input</h3>
            <p class="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
              Enter text to hash
            </p>
          </div>
        </template>

        <CodeEditor
          v-model="input"
          placeholder="Enter text to generate hash..."
          :rows="8"
        />
      </ToolCard>

      <!-- Output -->
      <ToolCard>
        <template #header>
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <h3 class="font-display font-bold text-neutral-900 dark:text-neutral-100">
                {{ selectedAlgorithm }} Hash
              </h3>
              <span class="text-xs font-mono text-neutral-400 dark:text-neutral-600">
                {{ HASH_INFO[selectedAlgorithm].bits }} bits
              </span>
              <RefreshCw v-if="isGenerating" class="w-4 h-4 text-accent-lime animate-spin" />
            </div>
            <CopyButton v-if="currentHash" :text="currentHash" />
          </div>
        </template>

        <!-- Single Hash Output -->
        <div class="space-y-4">
          <div class="p-4 bg-neutral-50 dark:bg-surface-elevated rounded-lg border border-neutral-200 dark:border-neutral-700 font-mono text-sm break-all">
            <span v-if="currentHash" class="text-neutral-900 dark:text-neutral-100">
              {{ currentHash }}
            </span>
            <span v-else class="text-neutral-400 dark:text-neutral-600">
              Hash will appear here...
            </span>
          </div>

          <!-- Deprecation Warning -->
          <div
            v-if="HASH_INFO[selectedAlgorithm].deprecated && currentHash"
            class="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg"
          >
            <AlertTriangle class="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
            <span class="text-xs text-amber-700 dark:text-amber-300">
              {{ selectedAlgorithm }} is cryptographically broken and not recommended for security purposes.
            </span>
          </div>
        </div>
      </ToolCard>
    </div>

    <!-- Compare Section -->
    <ToolCard v-if="compareMode">
      <template #header>
        <div class="flex items-center gap-2">
          <Hash class="w-4 h-4 text-accent-cyan" />
          <h3 class="font-display font-bold text-neutral-900 dark:text-neutral-100">Compare Hash</h3>
        </div>
      </template>

      <div class="space-y-4">
        <input
          v-model="compareHash"
          type="text"
          placeholder="Paste hash to compare..."
          class="w-full px-4 py-3 font-mono text-sm bg-white dark:bg-surface-elevated border-2 border-neutral-200 dark:border-neutral-700 rounded-lg focus:border-accent-lime focus:outline-none"
        />

        <div
          v-if="compareResult !== null"
          class="flex items-center gap-2 p-3 rounded-lg"
          :class="compareResult
            ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
            : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'"
        >
          <component
            :is="compareResult ? CheckCircle : XCircle"
            class="w-5 h-5"
            :class="compareResult ? 'text-green-500' : 'text-red-500'"
          />
          <span
            class="font-mono text-sm font-medium"
            :class="compareResult ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'"
          >
            {{ compareResult ? 'Hashes match!' : 'Hashes do not match' }}
          </span>
        </div>
      </div>
    </ToolCard>

    <!-- All Hashes -->
    <ToolCard v-if="showAllHashes && allHashes">
      <template #header>
        <h3 class="font-display font-bold text-neutral-900 dark:text-neutral-100">All Hash Algorithms</h3>
      </template>

      <div class="space-y-3">
        <div
          v-for="algo in algorithms"
          :key="algo"
          class="p-4 bg-neutral-50 dark:bg-surface-elevated rounded-lg border border-neutral-200 dark:border-neutral-700"
        >
          <div class="flex items-center justify-between mb-2">
            <div class="flex items-center gap-2">
              <span class="font-mono text-sm font-medium text-neutral-900 dark:text-neutral-100">{{ algo }}</span>
              <span class="text-xs text-neutral-400 dark:text-neutral-600">{{ HASH_INFO[algo].bits }} bits</span>
              <span
                v-if="HASH_INFO[algo].deprecated"
                class="text-xs px-1.5 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded"
              >
                Deprecated
              </span>
            </div>
            <CopyButton v-if="allHashes[algo].hash" :text="allHashes[algo].hash!" size="sm" />
          </div>
          <p class="font-mono text-xs text-neutral-600 dark:text-neutral-400 break-all">
            {{ allHashes[algo].hash || allHashes[algo].error }}
          </p>
        </div>
      </div>
    </ToolCard>

    <!-- Info Box -->
    <div class="p-4 bg-neutral-50 dark:bg-surface-elevated rounded-xl border border-neutral-200 dark:border-neutral-800">
      <h4 class="font-mono text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">About Hash Functions</h4>
      <p class="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
        Hash functions create a fixed-size output from any input. <span class="text-green-600 dark:text-green-400 font-medium">SHA-256</span> and <span class="text-green-600 dark:text-green-400 font-medium">SHA-512</span> are recommended for security. MD5 and SHA-1 are cryptographically broken but still useful for checksums.
      </p>
    </div>
  </div>
</template>
