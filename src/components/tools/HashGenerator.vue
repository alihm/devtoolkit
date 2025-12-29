<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Hash, Star, AlertTriangle, CheckCircle, XCircle, RefreshCw, Upload, FileText, X } from 'lucide-vue-next'
import CodeEditor from '../shared/CodeEditor.vue'
import ToolCard from '../shared/ToolCard.vue'
import CopyButton from '../shared/CopyButton.vue'
import { generateHash, generateAllHashes, compareHashes, hashFile, hashAllAlgorithmsFile, formatFileSize, HASH_INFO, type HashAlgorithm, type FileHashResult } from '../../utils/hash'
import { useFavorites } from '../../composables/useFavorites'
import { useRecentInputs } from '../../composables/useRecentInputs'

const { addFavorite } = useFavorites()
const { addRecentInput } = useRecentInputs()

type InputMode = 'text' | 'file'

const inputMode = ref<InputMode>('text')
const input = ref('')
const selectedAlgorithm = ref<HashAlgorithm>('SHA-256')
const currentHash = ref('')
const allHashes = ref<Record<HashAlgorithm, { success: boolean; hash?: string; error?: string }> | null>(null)
const isGenerating = ref(false)
const showAllHashes = ref(false)

// File hashing
const selectedFile = ref<File | null>(null)
const fileHashes = ref<Record<HashAlgorithm, FileHashResult> | null>(null)
const isDragging = ref(false)

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
  if (inputMode.value !== 'text') return
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
  if (inputMode.value === 'text' && show && input.value.trim()) {
    isGenerating.value = true
    allHashes.value = await generateAllHashes(input.value)
    isGenerating.value = false
  } else if (inputMode.value === 'file' && show && selectedFile.value) {
    await hashSelectedFile()
  }
})

watch(inputMode, () => {
  // Reset state when switching modes
  currentHash.value = ''
  allHashes.value = null
  fileHashes.value = null
})

async function hashSelectedFile() {
  if (!selectedFile.value) return

  isGenerating.value = true
  try {
    if (showAllHashes.value) {
      fileHashes.value = await hashAllAlgorithmsFile(selectedFile.value)
      currentHash.value = fileHashes.value[selectedAlgorithm.value].hash || ''
    } else {
      const result = await hashFile(selectedFile.value, selectedAlgorithm.value)
      currentHash.value = result.hash || ''
      fileHashes.value = { [selectedAlgorithm.value]: result } as Record<HashAlgorithm, FileHashResult>
    }
  } finally {
    isGenerating.value = false
  }
}

function handleFileSelect(event: Event) {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    selectedFile.value = target.files[0]
    hashSelectedFile()
  }
}

function handleDrop(event: DragEvent) {
  event.preventDefault()
  isDragging.value = false
  if (event.dataTransfer?.files && event.dataTransfer.files[0]) {
    selectedFile.value = event.dataTransfer.files[0]
    hashSelectedFile()
  }
}

function handleDragOver(event: DragEvent) {
  event.preventDefault()
  isDragging.value = true
}

function handleDragLeave() {
  isDragging.value = false
}

function clearFile() {
  selectedFile.value = null
  currentHash.value = ''
  fileHashes.value = null
}

function handleSaveFavorite() {
  const name = prompt('Enter a name for this favorite:')
  if (name && currentHash.value) {
    const inputValue = inputMode.value === 'text' ? input.value : selectedFile.value?.name || ''
    addFavorite('hash', name, inputValue, currentHash.value, { algorithm: selectedAlgorithm.value })
  }
}

function selectAlgorithm(algo: HashAlgorithm) {
  selectedAlgorithm.value = algo
  if (inputMode.value === 'text' && allHashes.value) {
    currentHash.value = allHashes.value[algo].hash || ''
  } else if (inputMode.value === 'file' && fileHashes.value) {
    currentHash.value = fileHashes.value[algo]?.hash || ''
    if (!fileHashes.value[algo] && selectedFile.value) {
      hashSelectedFile()
    }
  }
}
</script>

<template>
  <div class="space-y-6 animate-fade-in">
    <!-- Controls -->
    <div class="flex flex-wrap items-center gap-3">
      <!-- Input Mode Toggle -->
      <div class="flex items-center bg-neutral-100 dark:bg-surface-elevated rounded-lg p-1">
        <button
          @click="inputMode = 'text'"
          class="flex items-center gap-2 px-3 py-1.5 rounded-md font-mono text-xs transition-all duration-150"
          :class="inputMode === 'text'
            ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 shadow-sm'
            : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'"
        >
          <Hash class="w-3.5 h-3.5" />
          Text
        </button>
        <button
          @click="inputMode = 'file'"
          class="flex items-center gap-2 px-3 py-1.5 rounded-md font-mono text-xs transition-all duration-150"
          :class="inputMode === 'file'
            ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 shadow-sm'
            : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'"
        >
          <FileText class="w-3.5 h-3.5" />
          File
        </button>
      </div>

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
        :disabled="!currentHash"
        class="flex items-center gap-2 px-3 py-1.5 rounded-lg font-mono text-sm text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Star class="w-4 h-4" />
        Save
      </button>
    </div>

    <!-- Main Grid -->
    <div class="grid lg:grid-cols-2 gap-6">
      <!-- Text Input -->
      <ToolCard v-if="inputMode === 'text'">
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

      <!-- File Input -->
      <ToolCard v-else>
        <template #header>
          <div>
            <h3 class="font-display font-bold text-neutral-900 dark:text-neutral-100">File Input</h3>
            <p class="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
              Drop a file or click to select
            </p>
          </div>
        </template>

        <div
          @drop="handleDrop"
          @dragover="handleDragOver"
          @dragleave="handleDragLeave"
          class="relative"
        >
          <!-- Drop Zone -->
          <label
            v-if="!selectedFile"
            class="flex flex-col items-center justify-center h-48 border-2 border-dashed rounded-lg cursor-pointer transition-colors"
            :class="isDragging
              ? 'border-accent-lime bg-accent-lime/10'
              : 'border-neutral-300 dark:border-neutral-600 hover:border-accent-lime hover:bg-neutral-50 dark:hover:bg-neutral-800'"
          >
            <Upload class="w-10 h-10 text-neutral-400 mb-3" />
            <span class="text-sm font-mono text-neutral-500 dark:text-neutral-400">
              Drop file here or click to browse
            </span>
            <span class="text-xs text-neutral-400 dark:text-neutral-500 mt-1">
              Any file type supported
            </span>
            <input
              type="file"
              class="hidden"
              @change="handleFileSelect"
            />
          </label>

          <!-- Selected File -->
          <div
            v-else
            class="flex items-center gap-4 p-4 bg-neutral-50 dark:bg-surface-elevated rounded-lg border border-neutral-200 dark:border-neutral-700"
          >
            <div class="flex-shrink-0 w-12 h-12 bg-accent-lime/20 rounded-lg flex items-center justify-center">
              <FileText class="w-6 h-6 text-accent-lime" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="font-mono text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate">
                {{ selectedFile.name }}
              </p>
              <p class="text-xs text-neutral-500 dark:text-neutral-400">
                {{ formatFileSize(selectedFile.size) }}
              </p>
            </div>
            <button
              @click="clearFile"
              class="p-2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
            >
              <X class="w-5 h-5" />
            </button>
          </div>
        </div>
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
    <ToolCard v-if="showAllHashes && (allHashes || fileHashes)">
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
            <CopyButton
              v-if="(inputMode === 'text' ? allHashes?.[algo]?.hash : fileHashes?.[algo]?.hash)"
              :text="(inputMode === 'text' ? allHashes?.[algo]?.hash : fileHashes?.[algo]?.hash)!"
              size="sm"
            />
          </div>
          <p class="font-mono text-xs text-neutral-600 dark:text-neutral-400 break-all">
            {{ inputMode === 'text'
              ? (allHashes?.[algo]?.hash || allHashes?.[algo]?.error || '—')
              : (fileHashes?.[algo]?.hash || fileHashes?.[algo]?.error || '—')
            }}
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
