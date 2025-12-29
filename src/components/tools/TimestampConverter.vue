<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { Calendar, Clock, Star, RefreshCw, ArrowRight, Plus, Minus } from 'lucide-vue-next'
import ToolCard from '../shared/ToolCard.vue'
import CopyButton from '../shared/CopyButton.vue'
import { parseTimestamp, formatTimestamp, getCurrentTimestamp, addToDate, getDayOfYear, getWeekOfYear, isLeapYear, COMMON_FORMATS } from '../../utils/timestamp'
import { useFavorites } from '../../composables/useFavorites'

const { addFavorite } = useFavorites()

const input = ref('')
const liveNow = ref(getCurrentTimestamp())
let intervalId: number | null = null

// Update live timestamp every second
onMounted(() => {
  intervalId = window.setInterval(() => {
    liveNow.value = getCurrentTimestamp()
  }, 1000)
})

onUnmounted(() => {
  if (intervalId) {
    clearInterval(intervalId)
  }
})

const parsedResult = computed(() => {
  if (!input.value.trim()) return null
  return parseTimestamp(input.value)
})

const formattedResult = computed(() => {
  if (!parsedResult.value?.success || !parsedResult.value.date) return null
  return formatTimestamp(parsedResult.value.date)
})

const dateInfo = computed(() => {
  if (!parsedResult.value?.success || !parsedResult.value.date) return null
  const date = parsedResult.value.date
  return {
    dayOfYear: getDayOfYear(date),
    weekOfYear: getWeekOfYear(date),
    isLeapYear: isLeapYear(date.getFullYear()),
    daysInMonth: new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }
})

const formattedNow = computed(() => formatTimestamp(liveNow.value.date))

function useCurrentTime() {
  input.value = liveNow.value.seconds.toString()
}

function handleSaveFavorite() {
  const name = prompt('Enter a name for this favorite:')
  if (name && parsedResult.value?.success) {
    addFavorite('timestamp', name, input.value, formattedResult.value?.iso)
  }
}

// Date calculator
const calcDate = ref(new Date())
const calcAmount = ref(1)
const calcUnit = ref<'days' | 'weeks' | 'months' | 'years'>('days')

function addTime() {
  calcDate.value = addToDate(calcDate.value, calcAmount.value, calcUnit.value)
}

function subtractTime() {
  calcDate.value = addToDate(calcDate.value, -calcAmount.value, calcUnit.value)
}

function resetCalcDate() {
  calcDate.value = new Date()
}
</script>

<template>
  <div class="space-y-6 animate-fade-in">
    <!-- Live Clock -->
    <div class="p-4 bg-gradient-to-r from-neutral-900 to-neutral-800 dark:from-neutral-800 dark:to-neutral-900 rounded-xl text-white">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-xs font-mono text-neutral-400 uppercase tracking-wider mb-1">Current Time</p>
          <p class="font-mono text-3xl font-bold tabular-nums">
            {{ formattedNow.time }}
          </p>
          <p class="text-sm text-neutral-400 mt-1">{{ formattedNow.date }}</p>
        </div>
        <div class="text-right">
          <p class="font-mono text-lg text-accent-lime">{{ liveNow.seconds }}</p>
          <p class="text-xs text-neutral-500">Unix timestamp</p>
          <p class="text-xs text-neutral-500 mt-1">{{ formattedNow.timezone }}</p>
        </div>
      </div>
    </div>

    <!-- Main Converter -->
    <div class="grid lg:grid-cols-2 gap-6">
      <!-- Input -->
      <ToolCard>
        <template #header>
          <div class="flex items-center justify-between">
            <div>
              <h3 class="font-display font-bold text-neutral-900 dark:text-neutral-100">Input</h3>
              <p class="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
                Enter timestamp or date
              </p>
            </div>
            <div class="flex items-center gap-2">
              <button
                @click="useCurrentTime"
                class="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono bg-accent-lime text-neutral-900 rounded-lg hover:bg-accent-lime/80 transition-colors"
              >
                <Clock class="w-3.5 h-3.5" />
                Now
              </button>
              <button
                @click="handleSaveFavorite"
                :disabled="!parsedResult?.success"
                class="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-colors disabled:opacity-50"
              >
                <Star class="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </template>

        <div class="space-y-4">
          <input
            v-model="input"
            type="text"
            placeholder="1705315800 or 2024-01-15T10:30:00Z"
            class="w-full px-4 py-3 font-mono text-lg bg-white dark:bg-surface-elevated border-2 border-neutral-200 dark:border-neutral-700 rounded-lg focus:border-accent-lime focus:outline-none"
          />

          <!-- Error -->
          <div
            v-if="input && parsedResult && !parsedResult.success"
            class="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
          >
            <p class="text-sm font-mono text-red-600 dark:text-red-400">{{ parsedResult.error }}</p>
          </div>

          <!-- Common Formats -->
          <div class="pt-2">
            <p class="text-xs font-mono text-neutral-500 dark:text-neutral-400 mb-2">Supported formats:</p>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="format in COMMON_FORMATS"
                :key="format.name"
                class="px-2 py-1 text-xs font-mono bg-neutral-100 dark:bg-surface-elevated text-neutral-600 dark:text-neutral-400 rounded"
                :title="format.example"
              >
                {{ format.name }}
              </span>
            </div>
          </div>
        </div>
      </ToolCard>

      <!-- Output -->
      <ToolCard v-if="formattedResult">
        <template #header>
          <div class="flex items-center gap-2">
            <Calendar class="w-4 h-4 text-accent-lime" />
            <h3 class="font-display font-bold text-neutral-900 dark:text-neutral-100">Converted</h3>
          </div>
        </template>

        <div class="space-y-3">
          <div class="grid grid-cols-2 gap-3">
            <div class="p-3 bg-neutral-50 dark:bg-surface-elevated rounded-lg">
              <p class="text-xs font-mono text-neutral-500 dark:text-neutral-400 mb-1">Unix (seconds)</p>
              <div class="flex items-center justify-between">
                <span class="font-mono text-sm text-neutral-900 dark:text-neutral-100">{{ formattedResult.unix }}</span>
                <CopyButton :text="formattedResult.unix.toString()" size="sm" />
              </div>
            </div>

            <div class="p-3 bg-neutral-50 dark:bg-surface-elevated rounded-lg">
              <p class="text-xs font-mono text-neutral-500 dark:text-neutral-400 mb-1">Unix (ms)</p>
              <div class="flex items-center justify-between">
                <span class="font-mono text-sm text-neutral-900 dark:text-neutral-100">{{ formattedResult.unixMs }}</span>
                <CopyButton :text="formattedResult.unixMs.toString()" size="sm" />
              </div>
            </div>
          </div>

          <div class="p-3 bg-neutral-50 dark:bg-surface-elevated rounded-lg">
            <p class="text-xs font-mono text-neutral-500 dark:text-neutral-400 mb-1">ISO 8601</p>
            <div class="flex items-center justify-between">
              <span class="font-mono text-sm text-neutral-900 dark:text-neutral-100">{{ formattedResult.iso }}</span>
              <CopyButton :text="formattedResult.iso" size="sm" />
            </div>
          </div>

          <div class="p-3 bg-neutral-50 dark:bg-surface-elevated rounded-lg">
            <p class="text-xs font-mono text-neutral-500 dark:text-neutral-400 mb-1">UTC</p>
            <div class="flex items-center justify-between">
              <span class="font-mono text-sm text-neutral-900 dark:text-neutral-100">{{ formattedResult.utc }}</span>
              <CopyButton :text="formattedResult.utc" size="sm" />
            </div>
          </div>

          <div class="p-3 bg-neutral-50 dark:bg-surface-elevated rounded-lg">
            <p class="text-xs font-mono text-neutral-500 dark:text-neutral-400 mb-1">Local ({{ formattedResult.timezone }})</p>
            <div class="flex items-center justify-between">
              <span class="font-mono text-sm text-neutral-900 dark:text-neutral-100">{{ formattedResult.local }}</span>
              <CopyButton :text="formattedResult.local" size="sm" />
            </div>
          </div>

          <div class="p-3 bg-accent-lime/10 border border-accent-lime/30 rounded-lg">
            <p class="text-xs font-mono text-neutral-500 dark:text-neutral-400 mb-1">Relative</p>
            <span class="font-mono text-sm font-medium text-accent-lime">{{ formattedResult.relative }}</span>
          </div>
        </div>
      </ToolCard>

      <!-- Date Info Card (when no result yet) -->
      <ToolCard v-else>
        <template #header>
          <h3 class="font-display font-bold text-neutral-900 dark:text-neutral-100">Output</h3>
        </template>
        <div class="flex items-center justify-center h-48 text-neutral-400 dark:text-neutral-600">
          <p class="font-mono text-sm">Enter a timestamp to convert</p>
        </div>
      </ToolCard>
    </div>

    <!-- Date Info -->
    <ToolCard v-if="dateInfo">
      <template #header>
        <h3 class="font-display font-bold text-neutral-900 dark:text-neutral-100">Date Details</h3>
      </template>

      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div class="text-center p-3 bg-neutral-50 dark:bg-surface-elevated rounded-lg">
          <p class="text-2xl font-mono font-bold text-accent-lime">{{ dateInfo.dayOfYear }}</p>
          <p class="text-xs text-neutral-500 dark:text-neutral-400 mt-1">Day of Year</p>
        </div>
        <div class="text-center p-3 bg-neutral-50 dark:bg-surface-elevated rounded-lg">
          <p class="text-2xl font-mono font-bold text-accent-cyan">{{ dateInfo.weekOfYear }}</p>
          <p class="text-xs text-neutral-500 dark:text-neutral-400 mt-1">Week of Year</p>
        </div>
        <div class="text-center p-3 bg-neutral-50 dark:bg-surface-elevated rounded-lg">
          <p class="text-2xl font-mono font-bold text-neutral-900 dark:text-neutral-100">{{ dateInfo.daysInMonth }}</p>
          <p class="text-xs text-neutral-500 dark:text-neutral-400 mt-1">Days in Month</p>
        </div>
        <div class="text-center p-3 bg-neutral-50 dark:bg-surface-elevated rounded-lg">
          <p class="text-2xl font-mono font-bold" :class="dateInfo.isLeapYear ? 'text-green-500' : 'text-neutral-400'">
            {{ dateInfo.isLeapYear ? 'Yes' : 'No' }}
          </p>
          <p class="text-xs text-neutral-500 dark:text-neutral-400 mt-1">Leap Year</p>
        </div>
      </div>
    </ToolCard>

    <!-- Date Calculator -->
    <ToolCard>
      <template #header>
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <RefreshCw class="w-4 h-4 text-accent-cyan" />
            <h3 class="font-display font-bold text-neutral-900 dark:text-neutral-100">Date Calculator</h3>
          </div>
          <button
            @click="resetCalcDate"
            class="text-xs font-mono text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100"
          >
            Reset to now
          </button>
        </div>
      </template>

      <div class="space-y-4">
        <div class="flex items-center gap-4 flex-wrap">
          <div class="flex items-center gap-2">
            <button
              @click="subtractTime"
              class="p-2 bg-neutral-100 dark:bg-surface-elevated hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg transition-colors"
            >
              <Minus class="w-4 h-4" />
            </button>
            <input
              v-model.number="calcAmount"
              type="number"
              min="1"
              class="w-20 px-3 py-2 font-mono text-center bg-white dark:bg-surface-elevated border border-neutral-200 dark:border-neutral-700 rounded-lg focus:border-accent-lime focus:outline-none"
            />
            <button
              @click="addTime"
              class="p-2 bg-neutral-100 dark:bg-surface-elevated hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg transition-colors"
            >
              <Plus class="w-4 h-4" />
            </button>
          </div>

          <select
            v-model="calcUnit"
            class="px-3 py-2 font-mono text-sm bg-neutral-100 dark:bg-surface-elevated border-0 rounded-lg focus:ring-2 focus:ring-accent-lime"
          >
            <option value="days">Days</option>
            <option value="weeks">Weeks</option>
            <option value="months">Months</option>
            <option value="years">Years</option>
          </select>

          <ArrowRight class="w-4 h-4 text-neutral-400" />

          <div class="flex-1 p-3 bg-neutral-50 dark:bg-surface-elevated rounded-lg">
            <p class="font-mono text-sm text-neutral-900 dark:text-neutral-100">
              {{ calcDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) }}
            </p>
            <p class="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
              Unix: {{ Math.floor(calcDate.getTime() / 1000) }}
            </p>
          </div>
        </div>
      </div>
    </ToolCard>
  </div>
</template>
