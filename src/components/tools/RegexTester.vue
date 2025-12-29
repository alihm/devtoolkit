<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Star, AlertCircle, CheckCircle, Lightbulb } from 'lucide-vue-next'
import CodeEditor from '../shared/CodeEditor.vue'
import ToolCard from '../shared/ToolCard.vue'
import { testRegex, REGEX_FLAGS, COMMON_REGEX_PATTERNS } from '../../utils/regex'
import { useFavorites } from '../../composables/useFavorites'
import { useRecentInputs } from '../../composables/useRecentInputs'

const { addFavorite } = useFavorites()
const { addRecentInput } = useRecentInputs()

const pattern = ref('')
const testString = ref('')
const flags = ref(['g'])

const result = computed(() => {
  return testRegex(pattern.value, testString.value, flags.value.join(''))
})

const highlightedText = computed(() => {
  if (!result.value.isValid || result.value.matches.length === 0) {
    return testString.value
  }

  // Sort matches by index in reverse
  const sortedMatches = [...result.value.matches].sort((a, b) => b.index - a.index)

  let text = testString.value
  for (const match of sortedMatches) {
    const before = text.slice(0, match.index)
    const after = text.slice(match.index + match.match.length)
    text = before + `<mark class="bg-accent-lime/40 text-neutral-900 dark:text-neutral-100 px-0.5 rounded">${match.match}</mark>` + after
  }

  return text
})

watch([pattern, testString], ([p, t]) => {
  if (p.trim()) {
    addRecentInput('regex', p)
  }
})

function toggleFlag(flag: string) {
  const index = flags.value.indexOf(flag)
  if (index === -1) {
    flags.value = [...flags.value, flag]
  } else {
    flags.value = flags.value.filter(f => f !== flag)
  }
}

function loadPattern(p: typeof COMMON_REGEX_PATTERNS[0]) {
  pattern.value = p.pattern
}

function handleSaveFavorite() {
  const name = prompt('Enter a name for this favorite:')
  if (name) {
    addFavorite('regex', name, pattern.value, undefined, { flags: flags.value, testString: testString.value })
  }
}
</script>

<template>
  <div class="space-y-6 animate-fade-in">
    <!-- Pattern Input -->
    <ToolCard>
      <template #header>
        <div class="flex items-center justify-between">
          <div>
            <h3 class="font-display font-bold text-neutral-900 dark:text-neutral-100">Pattern</h3>
            <p class="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
              Enter your regular expression
            </p>
          </div>

          <button
            @click="handleSaveFavorite"
            :disabled="!pattern.trim()"
            class="flex items-center gap-2 px-3 py-1.5 rounded-lg font-mono text-sm text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Star class="w-4 h-4" />
            Save
          </button>
        </div>
      </template>

      <div class="space-y-4">
        <!-- Pattern Input -->
        <div class="relative">
          <div class="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-600 font-mono text-lg">/</div>
          <input
            v-model="pattern"
            type="text"
            placeholder="[a-z]+|\\d{3}"
            class="w-full pl-8 pr-20 py-3 font-mono text-sm bg-white dark:bg-surface-elevated border-2 rounded-lg transition-all duration-150"
            :class="[
              !pattern
                ? 'border-neutral-200 dark:border-neutral-700'
                : result.isValid
                  ? 'border-green-400 dark:border-green-600'
                  : 'border-red-400 dark:border-red-500'
            ]"
          />
          <div class="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1 text-neutral-400 dark:text-neutral-600 font-mono">
            <span>/</span>
            <span class="text-accent-lime">{{ flags.join('') }}</span>
          </div>
        </div>

        <!-- Flags -->
        <div class="flex flex-wrap items-center gap-2">
          <span class="text-xs font-mono text-neutral-500 dark:text-neutral-400 uppercase mr-2">Flags:</span>
          <button
            v-for="flag in REGEX_FLAGS"
            :key="flag.flag"
            @click="toggleFlag(flag.flag)"
            class="px-3 py-1 rounded-full font-mono text-xs transition-all duration-150"
            :class="flags.includes(flag.flag)
              ? 'bg-accent-lime text-neutral-900'
              : 'bg-neutral-100 dark:bg-surface-elevated text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700'"
            :title="flag.description"
          >
            {{ flag.flag }} - {{ flag.name }}
          </button>
        </div>

        <!-- Error Message -->
        <div
          v-if="pattern && !result.isValid"
          class="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
        >
          <AlertCircle class="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
          <span class="text-sm font-mono text-red-600 dark:text-red-400">{{ result.error }}</span>
        </div>

        <!-- Valid Message -->
        <div
          v-if="pattern && result.isValid"
          class="flex items-center gap-2"
        >
          <CheckCircle class="w-4 h-4 text-green-500" />
          <span class="text-sm font-mono text-green-600 dark:text-green-400">Valid regex pattern</span>
        </div>
      </div>
    </ToolCard>

    <!-- Test String & Results Grid -->
    <div class="grid lg:grid-cols-2 gap-6">
      <!-- Test String -->
      <ToolCard>
        <template #header>
          <div>
            <h3 class="font-display font-bold text-neutral-900 dark:text-neutral-100">Test String</h3>
            <p class="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
              Enter text to test against
            </p>
          </div>
        </template>

        <CodeEditor
          v-model="testString"
          placeholder="Enter text to test your regex pattern against..."
          :rows="8"
        />
      </ToolCard>

      <!-- Results -->
      <ToolCard>
        <template #header>
          <div class="flex items-center justify-between">
            <div>
              <h3 class="font-display font-bold text-neutral-900 dark:text-neutral-100">Results</h3>
              <p class="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
                {{ result.matches.length }} match{{ result.matches.length !== 1 ? 'es' : '' }} found
              </p>
            </div>
            <span
              v-if="result.matches.length > 0"
              class="badge-lime"
            >
              {{ result.matches.length }}
            </span>
          </div>
        </template>

        <!-- Highlighted Preview -->
        <div
          class="p-4 bg-neutral-50 dark:bg-surface-elevated rounded-lg border border-neutral-200 dark:border-neutral-700 min-h-[200px] font-mono text-sm leading-relaxed whitespace-pre-wrap break-words"
          v-html="highlightedText || '<span class=\'text-neutral-400 dark:text-neutral-600\'>Matches will be highlighted here...</span>'"
        />

        <!-- Match Details -->
        <div v-if="result.matches.length > 0" class="mt-4 space-y-2 max-h-40 overflow-auto">
          <div
            v-for="(match, index) in result.matches"
            :key="index"
            class="flex items-center gap-3 p-2 bg-white dark:bg-surface-muted border border-neutral-100 dark:border-neutral-800 rounded-lg"
          >
            <span class="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-accent-lime text-neutral-900 text-xs font-mono font-bold rounded">
              {{ index + 1 }}
            </span>
            <div class="flex-1 min-w-0">
              <span class="font-mono text-sm text-neutral-900 dark:text-neutral-100 truncate block">
                {{ match.match }}
              </span>
              <span class="text-xs text-neutral-500 dark:text-neutral-400">
                Index: {{ match.index }}
              </span>
            </div>
            <div v-if="match.groups" class="flex-shrink-0">
              <span class="text-xs font-mono text-neutral-500 dark:text-neutral-400">
                {{ Object.keys(match.groups).length }} groups
              </span>
            </div>
          </div>
        </div>
      </ToolCard>
    </div>

    <!-- Common Patterns -->
    <ToolCard>
      <template #header>
        <div class="flex items-center gap-2">
          <Lightbulb class="w-4 h-4 text-amber-500" />
          <h3 class="font-display font-bold text-neutral-900 dark:text-neutral-100">Common Patterns</h3>
        </div>
      </template>

      <div class="flex flex-wrap gap-2">
        <button
          v-for="p in COMMON_REGEX_PATTERNS"
          :key="p.name"
          @click="loadPattern(p)"
          class="px-3 py-1.5 bg-neutral-100 dark:bg-surface-elevated hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 font-mono text-xs rounded-lg transition-colors"
        >
          {{ p.name }}
        </button>
      </div>
    </ToolCard>
  </div>
</template>
