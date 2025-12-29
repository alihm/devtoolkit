<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import {
  GitCompare,
  Columns2,
  Rows3,
  Star,
  Settings2,
  Download,
  RefreshCw,
  Plus,
  Minus,
  Equal,
  Percent
} from 'lucide-vue-next'
import ToolCard from '../shared/ToolCard.vue'
import CopyButton from '../shared/CopyButton.vue'
import {
  computeDiff,
  formatSideBySide,
  formatInline,
  generateUnifiedDiff,
  calculateSimilarity,
  type DiffOptions,
  type DiffResult,
  type SideBySideResult,
  type InlineLine
} from '../../utils/diff'
import { useFavorites } from '../../composables/useFavorites'

const { addFavorite } = useFavorites()

type ViewMode = 'side-by-side' | 'inline'

const leftText = ref('')
const rightText = ref('')
const viewMode = ref<ViewMode>('side-by-side')
const showOptions = ref(false)

const options = ref<DiffOptions>({
  ignoreWhitespace: false,
  ignoreCase: false,
  trimLines: false
})

const diffResult = ref<DiffResult | null>(null)
const sideBySideResult = ref<SideBySideResult | null>(null)
const inlineResult = ref<InlineLine[]>([])
const similarity = ref(100)

function runDiff() {
  if (!leftText.value && !rightText.value) {
    diffResult.value = null
    sideBySideResult.value = null
    inlineResult.value = []
    similarity.value = 100
    return
  }

  diffResult.value = computeDiff(leftText.value, rightText.value, options.value)
  sideBySideResult.value = formatSideBySide(diffResult.value)
  inlineResult.value = formatInline(diffResult.value)
  similarity.value = calculateSimilarity(leftText.value, rightText.value)
}

// Auto-run diff when text changes
watch([leftText, rightText, options], () => {
  runDiff()
}, { deep: true })

const stats = computed(() => {
  if (!diffResult.value) {
    return { additions: 0, deletions: 0, modifications: 0, unchanged: 0 }
  }
  return diffResult.value.stats
})

const hasChanges = computed(() => {
  return stats.value.additions > 0 || stats.value.deletions > 0 || stats.value.modifications > 0
})

function getLineClass(type: string): string {
  switch (type) {
    case 'added':
      return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
    case 'removed':
      return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
    case 'modified':
      return 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200'
    default:
      return 'text-neutral-700 dark:text-neutral-300'
  }
}

function getLineNumberClass(type: string): string {
  switch (type) {
    case 'added':
      return 'bg-green-200 dark:bg-green-800/50 text-green-700 dark:text-green-300'
    case 'removed':
      return 'bg-red-200 dark:bg-red-800/50 text-red-700 dark:text-red-300'
    case 'modified':
      return 'bg-amber-200 dark:bg-amber-800/50 text-amber-700 dark:text-amber-300'
    default:
      return 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400'
  }
}

function getPrefixClass(prefix: string): string {
  switch (prefix) {
    case '+':
      return 'text-green-600 dark:text-green-400'
    case '-':
      return 'text-red-600 dark:text-red-400'
    default:
      return 'text-neutral-400 dark:text-neutral-500'
  }
}

function downloadUnifiedDiff() {
  const diff = generateUnifiedDiff(leftText.value, rightText.value, 'original.txt', 'modified.txt', options.value)
  const blob = new Blob([diff], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'diff.patch'
  a.click()
  URL.revokeObjectURL(url)
}

function swapTexts() {
  const temp = leftText.value
  leftText.value = rightText.value
  rightText.value = temp
}

function clearAll() {
  leftText.value = ''
  rightText.value = ''
}

function loadSample() {
  leftText.value = `function greet(name) {
  console.log("Hello, " + name);
  return true;
}

const users = ["Alice", "Bob"];
users.forEach(greet);`

  rightText.value = `function greet(name, greeting = "Hello") {
  console.log(greeting + ", " + name + "!");
  return true;
}

const users = ["Alice", "Bob", "Charlie"];
users.forEach(user => greet(user, "Hi"));`
}

function handleSaveFavorite() {
  const name = prompt('Enter a name for this favorite:')
  if (name && (leftText.value || rightText.value)) {
    const unifiedDiff = generateUnifiedDiff(leftText.value, rightText.value)
    addFavorite('diff', name, `${stats.value.additions}+ ${stats.value.deletions}-`, unifiedDiff, {
      leftText: leftText.value,
      rightText: rightText.value,
      options: options.value
    })
  }
}

// Initialize with empty state
runDiff()
</script>

<template>
  <div class="space-y-6 animate-fade-in">
    <!-- Controls -->
    <div class="flex flex-wrap items-center gap-3">
      <!-- View Mode Toggle -->
      <div class="flex items-center bg-neutral-100 dark:bg-surface-elevated rounded-lg p-1">
        <button
          @click="viewMode = 'side-by-side'"
          class="flex items-center gap-2 px-4 py-2 rounded-md font-mono text-sm transition-all duration-150"
          :class="viewMode === 'side-by-side'
            ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 shadow-sm'
            : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'"
        >
          <Columns2 class="w-4 h-4" />
          Side by Side
        </button>
        <button
          @click="viewMode = 'inline'"
          class="flex items-center gap-2 px-4 py-2 rounded-md font-mono text-sm transition-all duration-150"
          :class="viewMode === 'inline'
            ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 shadow-sm'
            : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'"
        >
          <Rows3 class="w-4 h-4" />
          Inline
        </button>
      </div>

      <!-- Options Toggle -->
      <button
        @click="showOptions = !showOptions"
        class="flex items-center gap-2 px-3 py-2 rounded-lg font-mono text-sm transition-colors"
        :class="showOptions
          ? 'bg-accent-lime text-neutral-900'
          : 'bg-neutral-100 dark:bg-surface-elevated text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700'"
      >
        <Settings2 class="w-4 h-4" />
        Options
      </button>

      <div class="flex-1" />

      <!-- Action Buttons -->
      <button
        @click="loadSample"
        class="flex items-center gap-2 px-3 py-2 rounded-lg font-mono text-sm bg-neutral-100 dark:bg-surface-elevated text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
      >
        Sample
      </button>

      <button
        @click="swapTexts"
        class="flex items-center gap-2 px-3 py-2 rounded-lg font-mono text-sm bg-neutral-100 dark:bg-surface-elevated text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
      >
        <RefreshCw class="w-4 h-4" />
        Swap
      </button>

      <button
        @click="clearAll"
        class="flex items-center gap-2 px-3 py-2 rounded-lg font-mono text-sm bg-neutral-100 dark:bg-surface-elevated text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
      >
        Clear
      </button>

      <button
        @click="handleSaveFavorite"
        :disabled="!leftText && !rightText"
        class="flex items-center gap-2 px-3 py-2 rounded-lg font-mono text-sm text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Star class="w-4 h-4" />
        Save
      </button>
    </div>

    <!-- Options Panel -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 -translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-2"
    >
      <div
        v-if="showOptions"
        class="flex flex-wrap gap-4 p-4 bg-neutral-50 dark:bg-surface-elevated rounded-lg border border-neutral-200 dark:border-neutral-700"
      >
        <label class="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            v-model="options.ignoreWhitespace"
            class="w-4 h-4 rounded border-neutral-300 dark:border-neutral-600 text-accent-lime focus:ring-accent-lime dark:bg-surface-elevated"
          />
          <span class="text-sm font-mono text-neutral-600 dark:text-neutral-400">Ignore whitespace</span>
        </label>

        <label class="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            v-model="options.ignoreCase"
            class="w-4 h-4 rounded border-neutral-300 dark:border-neutral-600 text-accent-lime focus:ring-accent-lime dark:bg-surface-elevated"
          />
          <span class="text-sm font-mono text-neutral-600 dark:text-neutral-400">Ignore case</span>
        </label>

        <label class="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            v-model="options.trimLines"
            class="w-4 h-4 rounded border-neutral-300 dark:border-neutral-600 text-accent-lime focus:ring-accent-lime dark:bg-surface-elevated"
          />
          <span class="text-sm font-mono text-neutral-600 dark:text-neutral-400">Trim lines</span>
        </label>
      </div>
    </Transition>

    <!-- Input Panels -->
    <div class="grid md:grid-cols-2 gap-4">
      <!-- Left Panel (Original) -->
      <div class="space-y-2">
        <label class="flex items-center gap-2 text-sm font-mono font-medium text-neutral-700 dark:text-neutral-300">
          <Minus class="w-4 h-4 text-red-500" />
          Original Text
        </label>
        <textarea
          v-model="leftText"
          placeholder="Paste original text here..."
          class="w-full h-48 px-4 py-3 font-mono text-sm bg-neutral-50 dark:bg-surface-elevated border-2 border-neutral-200 dark:border-neutral-700 rounded-xl focus:border-accent-lime focus:outline-none resize-none"
        />
      </div>

      <!-- Right Panel (Modified) -->
      <div class="space-y-2">
        <label class="flex items-center gap-2 text-sm font-mono font-medium text-neutral-700 dark:text-neutral-300">
          <Plus class="w-4 h-4 text-green-500" />
          Modified Text
        </label>
        <textarea
          v-model="rightText"
          placeholder="Paste modified text here..."
          class="w-full h-48 px-4 py-3 font-mono text-sm bg-neutral-50 dark:bg-surface-elevated border-2 border-neutral-200 dark:border-neutral-700 rounded-xl focus:border-accent-lime focus:outline-none resize-none"
        />
      </div>
    </div>

    <!-- Stats Bar -->
    <div class="flex flex-wrap items-center gap-4 p-4 bg-neutral-100 dark:bg-surface-elevated rounded-lg">
      <div class="flex items-center gap-2">
        <Percent class="w-4 h-4 text-accent-lime" />
        <span class="text-sm font-mono text-neutral-600 dark:text-neutral-400">
          {{ similarity }}% similar
        </span>
      </div>

      <div class="w-px h-4 bg-neutral-300 dark:bg-neutral-700" />

      <div class="flex items-center gap-2">
        <Plus class="w-4 h-4 text-green-500" />
        <span class="text-sm font-mono text-green-600 dark:text-green-400">
          {{ stats.additions }} additions
        </span>
      </div>

      <div class="flex items-center gap-2">
        <Minus class="w-4 h-4 text-red-500" />
        <span class="text-sm font-mono text-red-600 dark:text-red-400">
          {{ stats.deletions }} deletions
        </span>
      </div>

      <div class="flex items-center gap-2">
        <Equal class="w-4 h-4 text-amber-500" />
        <span class="text-sm font-mono text-amber-600 dark:text-amber-400">
          {{ stats.modifications }} modifications
        </span>
      </div>

      <div class="flex-1" />

      <button
        v-if="hasChanges"
        @click="downloadUnifiedDiff"
        class="flex items-center gap-2 px-3 py-1.5 rounded-lg font-mono text-sm bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-300 dark:hover:bg-neutral-600 transition-colors"
      >
        <Download class="w-4 h-4" />
        Download .patch
      </button>
    </div>

    <!-- Diff Output -->
    <ToolCard>
      <template #header>
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <GitCompare class="w-4 h-4 text-accent-lime" />
            <h3 class="font-display font-bold text-neutral-900 dark:text-neutral-100">Diff Result</h3>
            <span
              v-if="hasChanges"
              class="text-xs px-2 py-0.5 bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400 rounded-full font-mono"
            >
              {{ viewMode === 'side-by-side' ? 'Side by Side' : 'Inline' }}
            </span>
          </div>
          <CopyButton
            v-if="hasChanges"
            :text="generateUnifiedDiff(leftText, rightText, 'original', 'modified', options)"
          />
        </div>
      </template>

      <!-- Empty State -->
      <div
        v-if="!leftText && !rightText"
        class="flex flex-col items-center justify-center py-12 text-center"
      >
        <GitCompare class="w-12 h-12 text-neutral-300 dark:text-neutral-600 mb-4" />
        <p class="text-neutral-500 dark:text-neutral-400 font-mono">
          Enter text in both panels to see the diff
        </p>
      </div>

      <!-- No Changes -->
      <div
        v-else-if="!hasChanges && (leftText || rightText)"
        class="flex flex-col items-center justify-center py-12 text-center"
      >
        <Equal class="w-12 h-12 text-green-400 dark:text-green-500 mb-4" />
        <p class="text-green-600 dark:text-green-400 font-mono font-medium">
          No differences found
        </p>
        <p class="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
          The texts are identical
        </p>
      </div>

      <!-- Side by Side View -->
      <div
        v-else-if="viewMode === 'side-by-side' && sideBySideResult"
        class="overflow-auto max-h-[500px] border border-neutral-200 dark:border-neutral-700 rounded-lg"
      >
        <div class="grid grid-cols-2 divide-x divide-neutral-200 dark:divide-neutral-700">
          <!-- Left Side -->
          <div class="min-w-0">
            <div class="sticky top-0 px-3 py-2 bg-red-50 dark:bg-red-900/20 border-b border-neutral-200 dark:border-neutral-700">
              <span class="text-xs font-mono font-medium text-red-600 dark:text-red-400">Original</span>
            </div>
            <div class="divide-y divide-neutral-100 dark:divide-neutral-800">
              <div
                v-for="(line, index) in sideBySideResult.left"
                :key="'left-' + index"
                class="flex"
                :class="getLineClass(line.type)"
              >
                <span
                  class="flex-shrink-0 w-10 px-2 py-1 text-right text-xs font-mono select-none"
                  :class="getLineNumberClass(line.type)"
                >
                  {{ line.lineNumber ?? '' }}
                </span>
                <pre class="flex-1 px-3 py-1 text-sm font-mono whitespace-pre-wrap break-all overflow-hidden">{{ line.content }}</pre>
              </div>
            </div>
          </div>

          <!-- Right Side -->
          <div class="min-w-0">
            <div class="sticky top-0 px-3 py-2 bg-green-50 dark:bg-green-900/20 border-b border-neutral-200 dark:border-neutral-700">
              <span class="text-xs font-mono font-medium text-green-600 dark:text-green-400">Modified</span>
            </div>
            <div class="divide-y divide-neutral-100 dark:divide-neutral-800">
              <div
                v-for="(line, index) in sideBySideResult.right"
                :key="'right-' + index"
                class="flex"
                :class="getLineClass(line.type)"
              >
                <span
                  class="flex-shrink-0 w-10 px-2 py-1 text-right text-xs font-mono select-none"
                  :class="getLineNumberClass(line.type)"
                >
                  {{ line.lineNumber ?? '' }}
                </span>
                <pre class="flex-1 px-3 py-1 text-sm font-mono whitespace-pre-wrap break-all overflow-hidden">{{ line.content }}</pre>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Inline View -->
      <div
        v-else-if="viewMode === 'inline' && inlineResult.length"
        class="overflow-auto max-h-[500px] border border-neutral-200 dark:border-neutral-700 rounded-lg"
      >
        <div class="divide-y divide-neutral-100 dark:divide-neutral-800">
          <div
            v-for="(line, index) in inlineResult"
            :key="'inline-' + index"
            class="flex"
            :class="getLineClass(line.type)"
          >
            <span
              class="flex-shrink-0 w-10 px-2 py-1 text-right text-xs font-mono select-none border-r border-neutral-200 dark:border-neutral-700"
              :class="getLineNumberClass(line.type)"
            >
              {{ line.lineNumber.left ?? '' }}
            </span>
            <span
              class="flex-shrink-0 w-10 px-2 py-1 text-right text-xs font-mono select-none border-r border-neutral-200 dark:border-neutral-700"
              :class="getLineNumberClass(line.type)"
            >
              {{ line.lineNumber.right ?? '' }}
            </span>
            <span
              class="flex-shrink-0 w-6 px-1 py-1 text-center text-sm font-mono font-bold select-none"
              :class="getPrefixClass(line.prefix)"
            >
              {{ line.prefix }}
            </span>
            <pre class="flex-1 px-3 py-1 text-sm font-mono whitespace-pre-wrap break-all overflow-hidden">{{ line.content }}</pre>
          </div>
        </div>
      </div>
    </ToolCard>

    <!-- Legend -->
    <div class="flex flex-wrap gap-4 text-xs font-mono">
      <div class="flex items-center gap-2">
        <span class="w-4 h-4 rounded bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700" />
        <span class="text-neutral-600 dark:text-neutral-400">Added</span>
      </div>
      <div class="flex items-center gap-2">
        <span class="w-4 h-4 rounded bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700" />
        <span class="text-neutral-600 dark:text-neutral-400">Removed</span>
      </div>
      <div class="flex items-center gap-2">
        <span class="w-4 h-4 rounded bg-amber-100 dark:bg-amber-900/30 border border-amber-300 dark:border-amber-700" />
        <span class="text-neutral-600 dark:text-neutral-400">Modified</span>
      </div>
      <div class="flex items-center gap-2">
        <span class="w-4 h-4 rounded bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700" />
        <span class="text-neutral-600 dark:text-neutral-400">Unchanged</span>
      </div>
    </div>
  </div>
</template>
