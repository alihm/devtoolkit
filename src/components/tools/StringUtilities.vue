<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import {
  Type,
  CaseSensitive,
  ArrowUpDown,
  Shield,
  Star,
  Hash,
  Copy,
  RotateCcw,
  ListOrdered,
  Trash2,
  Shuffle,
  WrapText,
  SortAsc,
  SortDesc
} from 'lucide-vue-next'
import ToolCard from '../shared/ToolCard.vue'
import CopyButton from '../shared/CopyButton.vue'
import {
  convertCase,
  getStringStats,
  reverseString,
  reverseWords,
  reverseWordOrder,
  reverseLines,
  escapeText,
  unescapeText,
  removeDuplicateLines,
  removeEmptyLines,
  sortLines,
  shuffleLines,
  trimLines,
  addLineNumbers,
  removeLineNumbers,
  wrapText,
  CASE_OPTIONS,
  ESCAPE_OPTIONS,
  type CaseType,
  type EscapeType,
  type StringStats
} from '../../utils/string'
import { useFavorites } from '../../composables/useFavorites'

const { addFavorite } = useFavorites()

type ActiveTab = 'case' | 'reverse' | 'escape' | 'lines'

const inputText = ref('')
const outputText = ref('')
const activeTab = ref<ActiveTab>('case')

// Case conversion
const selectedCase = ref<CaseType>('lowercase')

// Reverse options
type ReverseType = 'string' | 'words' | 'wordOrder' | 'lines'
const reverseType = ref<ReverseType>('string')

// Escape options
const selectedEscape = ref<EscapeType>('html')
const escapeMode = ref<'escape' | 'unescape'>('escape')

// Line operations
type LineOperation = 'removeDuplicates' | 'removeEmpty' | 'sortAsc' | 'sortDesc' | 'shuffle' | 'trim' | 'addNumbers' | 'removeNumbers' | 'wrap'
const lineOperation = ref<LineOperation>('removeDuplicates')
const wrapWidth = ref(80)

const stats = computed((): StringStats => getStringStats(inputText.value))

const reverseOptions: { id: ReverseType; label: string; description: string }[] = [
  { id: 'string', label: 'Characters', description: 'Reverse all characters' },
  { id: 'words', label: 'Words', description: 'Reverse each word' },
  { id: 'wordOrder', label: 'Word Order', description: 'Reverse word order' },
  { id: 'lines', label: 'Lines', description: 'Reverse line order' }
]

const lineOperations: { id: LineOperation; label: string; icon: typeof Type }[] = [
  { id: 'removeDuplicates', label: 'Remove Duplicates', icon: Copy },
  { id: 'removeEmpty', label: 'Remove Empty', icon: Trash2 },
  { id: 'sortAsc', label: 'Sort A-Z', icon: SortAsc },
  { id: 'sortDesc', label: 'Sort Z-A', icon: SortDesc },
  { id: 'shuffle', label: 'Shuffle', icon: Shuffle },
  { id: 'trim', label: 'Trim Lines', icon: Type },
  { id: 'addNumbers', label: 'Add Numbers', icon: ListOrdered },
  { id: 'removeNumbers', label: 'Remove Numbers', icon: Hash },
  { id: 'wrap', label: 'Word Wrap', icon: WrapText }
]

function processText() {
  if (!inputText.value) {
    outputText.value = ''
    return
  }

  switch (activeTab.value) {
    case 'case':
      outputText.value = convertCase(inputText.value, selectedCase.value)
      break
    case 'reverse':
      switch (reverseType.value) {
        case 'string':
          outputText.value = reverseString(inputText.value)
          break
        case 'words':
          outputText.value = reverseWords(inputText.value)
          break
        case 'wordOrder':
          outputText.value = reverseWordOrder(inputText.value)
          break
        case 'lines':
          outputText.value = reverseLines(inputText.value)
          break
      }
      break
    case 'escape':
      if (escapeMode.value === 'escape') {
        outputText.value = escapeText(inputText.value, selectedEscape.value)
      } else {
        outputText.value = unescapeText(inputText.value, selectedEscape.value)
      }
      break
    case 'lines':
      switch (lineOperation.value) {
        case 'removeDuplicates':
          outputText.value = removeDuplicateLines(inputText.value)
          break
        case 'removeEmpty':
          outputText.value = removeEmptyLines(inputText.value)
          break
        case 'sortAsc':
          outputText.value = sortLines(inputText.value, false)
          break
        case 'sortDesc':
          outputText.value = sortLines(inputText.value, true)
          break
        case 'shuffle':
          outputText.value = shuffleLines(inputText.value)
          break
        case 'trim':
          outputText.value = trimLines(inputText.value)
          break
        case 'addNumbers':
          outputText.value = addLineNumbers(inputText.value)
          break
        case 'removeNumbers':
          outputText.value = removeLineNumbers(inputText.value)
          break
        case 'wrap':
          outputText.value = wrapText(inputText.value, wrapWidth.value)
          break
      }
      break
  }
}

// Watch for changes
watch([inputText, activeTab, selectedCase, reverseType, selectedEscape, escapeMode, lineOperation, wrapWidth], () => {
  processText()
})

function applyToInput() {
  inputText.value = outputText.value
}

function clearAll() {
  inputText.value = ''
  outputText.value = ''
}

function loadSample() {
  inputText.value = `Hello World! This is a sample text.
It has multiple lines.
Some lines are duplicated.
Some lines are duplicated.

There are also empty lines.

Special characters: <div class="example"> & more.
camelCaseExample and snake_case_example here.`
}

function handleSaveFavorite() {
  const name = prompt('Enter a name for this favorite:')
  if (name && outputText.value) {
    addFavorite('string', name, `${activeTab.value}: ${stats.value.words} words`, outputText.value, {
      inputText: inputText.value,
      activeTab: activeTab.value,
      selectedCase: selectedCase.value,
      reverseType: reverseType.value,
      selectedEscape: selectedEscape.value,
      escapeMode: escapeMode.value,
      lineOperation: lineOperation.value
    })
  }
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}
</script>

<template>
  <div class="space-y-6 animate-fade-in">
    <!-- Tab Navigation -->
    <div class="flex flex-wrap items-center gap-2">
      <div class="flex items-center bg-neutral-100 dark:bg-surface-elevated rounded-lg p-1">
        <button
          @click="activeTab = 'case'"
          class="flex items-center gap-2 px-4 py-2 rounded-md font-mono text-sm transition-all duration-150"
          :class="activeTab === 'case'
            ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 shadow-sm'
            : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'"
        >
          <CaseSensitive class="w-4 h-4" />
          Case
        </button>
        <button
          @click="activeTab = 'reverse'"
          class="flex items-center gap-2 px-4 py-2 rounded-md font-mono text-sm transition-all duration-150"
          :class="activeTab === 'reverse'
            ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 shadow-sm'
            : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'"
        >
          <RotateCcw class="w-4 h-4" />
          Reverse
        </button>
        <button
          @click="activeTab = 'escape'"
          class="flex items-center gap-2 px-4 py-2 rounded-md font-mono text-sm transition-all duration-150"
          :class="activeTab === 'escape'
            ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 shadow-sm'
            : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'"
        >
          <Shield class="w-4 h-4" />
          Escape
        </button>
        <button
          @click="activeTab = 'lines'"
          class="flex items-center gap-2 px-4 py-2 rounded-md font-mono text-sm transition-all duration-150"
          :class="activeTab === 'lines'
            ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 shadow-sm'
            : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'"
        >
          <ListOrdered class="w-4 h-4" />
          Lines
        </button>
      </div>

      <div class="flex-1" />

      <button
        @click="loadSample"
        class="flex items-center gap-2 px-3 py-2 rounded-lg font-mono text-sm bg-neutral-100 dark:bg-surface-elevated text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
      >
        Sample
      </button>

      <button
        @click="clearAll"
        class="flex items-center gap-2 px-3 py-2 rounded-lg font-mono text-sm bg-neutral-100 dark:bg-surface-elevated text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
      >
        Clear
      </button>

      <button
        @click="handleSaveFavorite"
        :disabled="!outputText"
        class="flex items-center gap-2 px-3 py-2 rounded-lg font-mono text-sm text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Star class="w-4 h-4" />
        Save
      </button>
    </div>

    <!-- Options Panel -->
    <div class="p-4 bg-neutral-50 dark:bg-surface-elevated rounded-lg border border-neutral-200 dark:border-neutral-700">
      <!-- Case Options -->
      <div v-if="activeTab === 'case'" class="flex flex-wrap gap-2">
        <button
          v-for="option in CASE_OPTIONS"
          :key="option.id"
          @click="selectedCase = option.id"
          class="px-3 py-2 rounded-lg font-mono text-sm transition-colors border"
          :class="selectedCase === option.id
            ? 'bg-accent-lime text-neutral-900 shadow-sm border-transparent'
            : 'bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700 border-neutral-200 dark:border-neutral-700'"
        >
          {{ option.name }}
        </button>
      </div>

      <!-- Reverse Options -->
      <div v-else-if="activeTab === 'reverse'" class="flex flex-wrap gap-2">
        <button
          v-for="option in reverseOptions"
          :key="option.id"
          @click="reverseType = option.id"
          class="px-4 py-2 rounded-lg font-mono text-sm transition-colors border"
          :class="reverseType === option.id
            ? 'bg-accent-lime text-neutral-900 shadow-sm border-transparent'
            : 'bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700 border-neutral-200 dark:border-neutral-700'"
        >
          <div class="font-medium">{{ option.label }}</div>
          <div class="text-xs opacity-70">{{ option.description }}</div>
        </button>
      </div>

      <!-- Escape Options -->
      <div v-else-if="activeTab === 'escape'" class="space-y-3">
        <div class="flex items-center gap-2">
          <div class="flex items-center bg-white dark:bg-neutral-800 rounded-lg p-1 border border-neutral-200 dark:border-neutral-700">
            <button
              @click="escapeMode = 'escape'"
              class="px-3 py-1.5 rounded-md font-mono text-sm transition-colors"
              :class="escapeMode === 'escape'
                ? 'bg-accent-lime text-neutral-900'
                : 'text-neutral-500 dark:text-neutral-400'"
            >
              Escape
            </button>
            <button
              @click="escapeMode = 'unescape'"
              class="px-3 py-1.5 rounded-md font-mono text-sm transition-colors"
              :class="escapeMode === 'unescape'
                ? 'bg-accent-lime text-neutral-900'
                : 'text-neutral-500 dark:text-neutral-400'"
            >
              Unescape
            </button>
          </div>
        </div>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="option in ESCAPE_OPTIONS"
            :key="option.id"
            @click="selectedEscape = option.id"
            class="px-3 py-2 rounded-lg font-mono text-sm transition-colors border"
            :class="selectedEscape === option.id
              ? 'bg-accent-lime text-neutral-900 shadow-sm border-transparent'
              : 'bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700 border-neutral-200 dark:border-neutral-700'"
          >
            <div class="font-medium">{{ option.name }}</div>
            <div class="text-xs opacity-70">{{ option.description }}</div>
          </button>
        </div>
      </div>

      <!-- Line Operations -->
      <div v-else-if="activeTab === 'lines'" class="space-y-3">
        <div class="flex flex-wrap gap-2">
          <button
            v-for="op in lineOperations"
            :key="op.id"
            @click="lineOperation = op.id"
            class="flex items-center gap-2 px-3 py-2 rounded-lg font-mono text-sm transition-colors border"
            :class="lineOperation === op.id
              ? 'bg-accent-lime text-neutral-900 shadow-sm border-transparent'
              : 'bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700 border-neutral-200 dark:border-neutral-700'"
          >
            <component :is="op.icon" class="w-4 h-4" />
            {{ op.label }}
          </button>
        </div>

        <!-- Wrap width input -->
        <div v-if="lineOperation === 'wrap'" class="flex items-center gap-2">
          <span class="text-sm font-mono text-neutral-500 dark:text-neutral-400">Width:</span>
          <input
            v-model.number="wrapWidth"
            type="number"
            min="20"
            max="200"
            class="w-20 px-3 py-1.5 font-mono text-sm bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg focus:border-accent-lime focus:outline-none"
          />
          <span class="text-xs text-neutral-400">characters</span>
        </div>
      </div>
    </div>

    <!-- Stats Bar -->
    <div class="flex flex-wrap items-center gap-4 px-4 py-3 bg-neutral-100 dark:bg-surface-elevated rounded-lg">
      <div class="flex items-center gap-2">
        <Hash class="w-4 h-4 text-accent-lime" />
        <span class="text-sm font-mono text-neutral-600 dark:text-neutral-400">
          {{ stats.characters }} chars
        </span>
      </div>
      <div class="flex items-center gap-2">
        <span class="text-sm font-mono text-neutral-600 dark:text-neutral-400">
          {{ stats.charactersNoSpaces }} (no spaces)
        </span>
      </div>
      <div class="flex items-center gap-2">
        <span class="text-sm font-mono text-neutral-600 dark:text-neutral-400">
          {{ stats.words }} words
        </span>
      </div>
      <div class="flex items-center gap-2">
        <span class="text-sm font-mono text-neutral-600 dark:text-neutral-400">
          {{ stats.sentences }} sentences
        </span>
      </div>
      <div class="flex items-center gap-2">
        <span class="text-sm font-mono text-neutral-600 dark:text-neutral-400">
          {{ stats.lines }} lines
        </span>
      </div>
      <div class="flex items-center gap-2">
        <span class="text-sm font-mono text-neutral-600 dark:text-neutral-400">
          {{ formatBytes(stats.bytes) }}
        </span>
      </div>
    </div>

    <!-- Input/Output Panels -->
    <div class="grid lg:grid-cols-2 gap-4">
      <!-- Input -->
      <ToolCard>
        <template #header>
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <Type class="w-4 h-4 text-accent-lime" />
              <h3 class="font-display font-bold text-neutral-900 dark:text-neutral-100">Input</h3>
            </div>
            <CopyButton v-if="inputText" :text="inputText" />
          </div>
        </template>

        <textarea
          v-model="inputText"
          placeholder="Enter your text here..."
          class="w-full h-64 px-4 py-3 font-mono text-sm bg-neutral-50 dark:bg-surface-elevated border border-neutral-200 dark:border-neutral-700 rounded-lg focus:border-accent-lime focus:outline-none resize-none"
        />
      </ToolCard>

      <!-- Output -->
      <ToolCard>
        <template #header>
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <ArrowUpDown class="w-4 h-4 text-accent-lime" />
              <h3 class="font-display font-bold text-neutral-900 dark:text-neutral-100">Output</h3>
            </div>
            <div class="flex items-center gap-2">
              <button
                v-if="outputText"
                @click="applyToInput"
                class="flex items-center gap-1 px-2 py-1 text-xs font-mono bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 rounded hover:bg-neutral-300 dark:hover:bg-neutral-600 transition-colors"
              >
                Apply to Input
              </button>
              <CopyButton v-if="outputText" :text="outputText" />
            </div>
          </div>
        </template>

        <div
          class="w-full h-64 px-4 py-3 font-mono text-sm bg-neutral-50 dark:bg-surface-elevated border border-neutral-200 dark:border-neutral-700 rounded-lg overflow-auto"
        >
          <pre v-if="outputText" class="whitespace-pre-wrap break-words text-neutral-700 dark:text-neutral-300">{{ outputText }}</pre>
          <p v-else class="text-neutral-400 dark:text-neutral-600 italic">
            Output will appear here...
          </p>
        </div>
      </ToolCard>
    </div>

    <!-- Case Examples -->
    <div v-if="activeTab === 'case'" class="grid sm:grid-cols-2 lg:grid-cols-5 gap-2">
      <div
        v-for="option in CASE_OPTIONS"
        :key="option.id"
        @click="selectedCase = option.id"
        class="p-3 rounded-lg border cursor-pointer transition-all"
        :class="selectedCase === option.id
          ? 'bg-accent-lime/10 border-accent-lime'
          : 'bg-neutral-50 dark:bg-surface-elevated border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600'"
      >
        <div class="font-mono text-sm font-medium text-neutral-900 dark:text-neutral-100">
          {{ option.name }}
        </div>
        <div class="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
          {{ option.example }}
        </div>
      </div>
    </div>
  </div>
</template>
