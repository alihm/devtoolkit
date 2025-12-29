<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Clock, Star, Lightbulb, Calendar, Play } from 'lucide-vue-next'
import ToolCard from '../shared/ToolCard.vue'
import { parseCron, COMMON_CRON_EXAMPLES } from '../../utils/cron'
import { useFavorites } from '../../composables/useFavorites'
import { useRecentInputs } from '../../composables/useRecentInputs'

const { addFavorite } = useFavorites()
const { addRecentInput } = useRecentInputs()

const expression = ref('')

const result = computed(() => {
  if (!expression.value.trim()) {
    return null
  }
  return parseCron(expression.value)
})

watch(expression, (val) => {
  if (val.trim()) {
    addRecentInput('cron', val)
  }
})

function loadExample(example: typeof COMMON_CRON_EXAMPLES[0]) {
  expression.value = example.expression
}

function handleSaveFavorite() {
  const name = prompt('Enter a name for this favorite:')
  if (name && result.value?.isValid) {
    addFavorite('cron', name, expression.value, result.value.humanReadable)
  }
}

function formatNextRun(date: Date): string {
  const now = new Date()
  const diff = date.getTime() - now.getTime()

  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  let relative = ''
  if (days > 0) {
    relative = `in ${days} day${days > 1 ? 's' : ''}`
  } else if (hours > 0) {
    relative = `in ${hours} hour${hours > 1 ? 's' : ''}`
  } else if (minutes > 0) {
    relative = `in ${minutes} minute${minutes > 1 ? 's' : ''}`
  } else {
    relative = 'now'
  }

  return `${date.toLocaleString()} (${relative})`
}

const fieldLabels = ['Minute', 'Hour', 'Day', 'Month', 'Weekday']
const fieldRanges = ['0-59', '0-23', '1-31', '1-12', '0-6']
</script>

<template>
  <div class="space-y-6 animate-fade-in">
    <!-- Cron Input -->
    <ToolCard>
      <template #header>
        <div class="flex items-center justify-between">
          <div>
            <h3 class="font-display font-bold text-neutral-900 dark:text-neutral-100">Cron Expression</h3>
            <p class="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
              Enter a cron expression (5 fields)
            </p>
          </div>

          <button
            @click="handleSaveFavorite"
            :disabled="!expression.trim() || !result?.isValid"
            class="flex items-center gap-2 px-3 py-1.5 rounded-lg font-mono text-sm text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Star class="w-4 h-4" />
            Save
          </button>
        </div>
      </template>

      <!-- Input with field guides -->
      <div class="space-y-4">
        <!-- Field Labels -->
        <div class="hidden sm:grid grid-cols-5 gap-2 px-1">
          <div
            v-for="(label, i) in fieldLabels"
            :key="label"
            class="text-center"
          >
            <span class="text-xs font-mono text-neutral-500 dark:text-neutral-400">{{ label }}</span>
            <span class="block text-[10px] font-mono text-neutral-400 dark:text-neutral-600">{{ fieldRanges[i] }}</span>
          </div>
        </div>

        <!-- Input -->
        <div class="relative">
          <Clock class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 dark:text-neutral-600" />
          <input
            v-model="expression"
            type="text"
            placeholder="* * * * *"
            class="w-full pl-12 pr-4 py-4 font-mono text-lg tracking-widest text-center bg-white dark:bg-surface-elevated border-2 rounded-xl transition-all duration-150 focus:outline-none"
            :class="[
              !expression
                ? 'border-neutral-200 dark:border-neutral-700'
                : result?.isValid
                  ? 'border-green-400 dark:border-green-600'
                  : 'border-red-400 dark:border-red-500'
            ]"
          />
        </div>

        <!-- Human Readable Result -->
        <div
          v-if="result?.isValid"
          class="p-4 bg-accent-lime/10 border border-accent-lime/30 rounded-xl"
        >
          <div class="flex items-center gap-2 text-accent-lime mb-2">
            <Play class="w-4 h-4" />
            <span class="font-mono text-sm font-medium">Schedule</span>
          </div>
          <p class="font-display text-lg font-bold text-neutral-900 dark:text-neutral-100">
            {{ result.humanReadable }}
          </p>
        </div>

        <!-- Error -->
        <div
          v-if="result && !result.isValid"
          class="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl"
        >
          <p class="font-mono text-sm text-red-600 dark:text-red-400">{{ result.error }}</p>
        </div>
      </div>
    </ToolCard>

    <!-- Parts Breakdown -->
    <div v-if="result?.isValid" class="grid sm:grid-cols-5 gap-4">
      <div
        v-for="part in result.parts"
        :key="part.field"
        class="p-4 bg-white dark:bg-surface-muted border-2 border-neutral-200 dark:border-neutral-800 rounded-xl"
      >
        <div class="text-center">
          <span class="inline-block px-3 py-1 bg-accent-lime text-neutral-900 font-mono text-lg font-bold rounded-lg mb-2">
            {{ part.value }}
          </span>
          <h4 class="font-mono text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase mb-1">
            {{ part.field }}
          </h4>
          <p class="text-sm text-neutral-600 dark:text-neutral-400">
            {{ part.description }}
          </p>
        </div>
      </div>
    </div>

    <!-- Next Runs -->
    <ToolCard v-if="result?.isValid && result.nextRuns && result.nextRuns.length > 0">
      <template #header>
        <div class="flex items-center gap-2">
          <Calendar class="w-4 h-4 text-accent-cyan" />
          <h3 class="font-display font-bold text-neutral-900 dark:text-neutral-100">Next Runs</h3>
        </div>
      </template>

      <div class="space-y-2">
        <div
          v-for="(run, index) in result.nextRuns"
          :key="index"
          class="flex items-center gap-3 p-3 bg-neutral-50 dark:bg-surface-elevated rounded-lg"
        >
          <span class="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400 text-xs font-mono font-bold rounded">
            {{ index + 1 }}
          </span>
          <span class="font-mono text-sm text-neutral-900 dark:text-neutral-100">
            {{ formatNextRun(run) }}
          </span>
        </div>
      </div>
    </ToolCard>

    <!-- Common Examples -->
    <ToolCard>
      <template #header>
        <div class="flex items-center gap-2">
          <Lightbulb class="w-4 h-4 text-amber-500" />
          <h3 class="font-display font-bold text-neutral-900 dark:text-neutral-100">Common Examples</h3>
        </div>
      </template>

      <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <button
          v-for="example in COMMON_CRON_EXAMPLES"
          :key="example.expression"
          @click="loadExample(example)"
          class="flex items-center gap-3 p-3 bg-neutral-50 dark:bg-surface-elevated hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors text-left"
        >
          <code class="flex-shrink-0 px-2 py-1 bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 font-mono text-xs rounded">
            {{ example.expression }}
          </code>
          <span class="text-sm text-neutral-600 dark:text-neutral-400">
            {{ example.description }}
          </span>
        </button>
      </div>
    </ToolCard>

    <!-- Cron Reference -->
    <div class="p-4 bg-neutral-50 dark:bg-surface-elevated rounded-xl border border-neutral-200 dark:border-neutral-800">
      <h4 class="font-mono text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">Cron Syntax Reference</h4>
      <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
        <div>
          <span class="font-medium text-neutral-700 dark:text-neutral-300">*</span>
          <span class="ml-2 text-neutral-500 dark:text-neutral-400">Any value</span>
        </div>
        <div>
          <span class="font-medium text-neutral-700 dark:text-neutral-300">,</span>
          <span class="ml-2 text-neutral-500 dark:text-neutral-400">Value list (1,3,5)</span>
        </div>
        <div>
          <span class="font-medium text-neutral-700 dark:text-neutral-300">-</span>
          <span class="ml-2 text-neutral-500 dark:text-neutral-400">Range (1-5)</span>
        </div>
        <div>
          <span class="font-medium text-neutral-700 dark:text-neutral-300">/</span>
          <span class="ml-2 text-neutral-500 dark:text-neutral-400">Step (*/15)</span>
        </div>
      </div>
    </div>
  </div>
</template>
