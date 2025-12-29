<script setup lang="ts">
import { ref, computed } from 'vue'
import { Fingerprint, Star, RefreshCw, Copy, AlertCircle, CheckCircle } from 'lucide-vue-next'
import ToolCard from '../shared/ToolCard.vue'
import CopyButton from '../shared/CopyButton.vue'
import { generateUuid, generateBulkUuids, validateUuid, formatUuid, UUID_INFO, type UuidVersion } from '../../utils/uuid'
import { useFavorites } from '../../composables/useFavorites'

const { addFavorite } = useFavorites()

const selectedVersion = ref<UuidVersion>('v4')
const generatedUuid = ref('')
const bulkCount = ref(5)
const bulkUuids = ref<string[]>([])
const showBulk = ref(false)
const uuidFormat = ref<'standard' | 'uppercase' | 'no-dash' | 'braces'>('standard')

// Validation mode
const validateMode = ref(false)
const validateInput = ref('')

const validationResult = computed(() => {
  if (!validateInput.value.trim()) return null
  return validateUuid(validateInput.value)
})

const formattedUuid = computed(() => {
  if (!generatedUuid.value) return ''
  return formatUuid(generatedUuid.value, uuidFormat.value)
})

const formattedBulkUuids = computed(() => {
  return bulkUuids.value.map(uuid => formatUuid(uuid, uuidFormat.value))
})

function generate() {
  const result = generateUuid(selectedVersion.value)
  if (result.success && result.uuid) {
    generatedUuid.value = result.uuid
  }
}

function generateBulk() {
  bulkUuids.value = generateBulkUuids(selectedVersion.value, bulkCount.value)
}

function copyAllBulk() {
  const text = formattedBulkUuids.value.join('\n')
  navigator.clipboard.writeText(text)
}

function handleSaveFavorite() {
  const name = prompt('Enter a name for this favorite:')
  if (name && generatedUuid.value) {
    addFavorite('uuid', name, generatedUuid.value, formattedUuid.value, { version: selectedVersion.value })
  }
}

// Generate initial UUID
generate()
</script>

<template>
  <div class="space-y-6 animate-fade-in">
    <!-- Controls -->
    <div class="flex flex-wrap items-center gap-3">
      <!-- Version Selector -->
      <div class="flex items-center bg-neutral-100 dark:bg-surface-elevated rounded-lg p-1">
        <button
          v-for="version in (['v1', 'v4', 'v7'] as UuidVersion[])"
          :key="version"
          @click="selectedVersion = version; generate()"
          class="px-4 py-2 rounded-md font-mono text-sm transition-all duration-150"
          :class="selectedVersion === version
            ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 shadow-sm'
            : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'"
        >
          UUID {{ version.toUpperCase() }}
        </button>
      </div>

      <!-- Format Selector -->
      <select
        v-model="uuidFormat"
        class="bg-neutral-100 dark:bg-surface-elevated border-0 rounded-lg px-3 py-2 font-mono text-sm text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-accent-lime"
      >
        <option value="standard">Standard</option>
        <option value="uppercase">UPPERCASE</option>
        <option value="no-dash">No dashes</option>
        <option value="braces">{Braces}</option>
      </select>

      <!-- Validate Toggle -->
      <label class="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          v-model="validateMode"
          class="w-4 h-4 rounded border-neutral-300 dark:border-neutral-600 text-accent-lime focus:ring-accent-lime dark:bg-surface-elevated"
        />
        <span class="text-sm font-mono text-neutral-600 dark:text-neutral-400">Validate</span>
      </label>

      <!-- Bulk Toggle -->
      <label class="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          v-model="showBulk"
          class="w-4 h-4 rounded border-neutral-300 dark:border-neutral-600 text-accent-lime focus:ring-accent-lime dark:bg-surface-elevated"
        />
        <span class="text-sm font-mono text-neutral-600 dark:text-neutral-400">Bulk</span>
      </label>

      <div class="flex-1" />

      <button
        @click="handleSaveFavorite"
        :disabled="!generatedUuid"
        class="flex items-center gap-2 px-3 py-1.5 rounded-lg font-mono text-sm text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Star class="w-4 h-4" />
        Save
      </button>
    </div>

    <!-- Single UUID Generator -->
    <ToolCard>
      <template #header>
        <div class="flex items-center justify-between">
          <div>
            <h3 class="font-display font-bold text-neutral-900 dark:text-neutral-100">
              UUID {{ selectedVersion.toUpperCase() }}
            </h3>
            <p class="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
              {{ UUID_INFO[selectedVersion].name }} — {{ UUID_INFO[selectedVersion].description }}
            </p>
          </div>
        </div>
      </template>

      <div class="space-y-4">
        <!-- Generated UUID Display -->
        <div class="flex items-center gap-3">
          <div class="flex-1 p-4 bg-neutral-50 dark:bg-surface-elevated rounded-lg border-2 border-neutral-200 dark:border-neutral-700 font-mono text-lg tracking-wider text-center select-all">
            {{ formattedUuid || 'Click generate to create UUID' }}
          </div>
        </div>

        <!-- Actions -->
        <div class="flex items-center justify-center gap-3">
          <button
            @click="generate"
            class="flex items-center gap-2 px-6 py-3 bg-accent-lime text-neutral-900 font-mono text-sm font-medium rounded-lg hover:bg-accent-lime/80 transition-colors shadow-brutal-sm hover:shadow-brutal"
          >
            <RefreshCw class="w-4 h-4" />
            Generate New
          </button>

          <CopyButton v-if="formattedUuid" :text="formattedUuid" />
        </div>
      </div>
    </ToolCard>

    <!-- Bulk Generator -->
    <ToolCard v-if="showBulk">
      <template #header>
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <Fingerprint class="w-4 h-4 text-accent-cyan" />
            <h3 class="font-display font-bold text-neutral-900 dark:text-neutral-100">Bulk Generate</h3>
          </div>
          <div class="flex items-center gap-3">
            <div class="flex items-center gap-2">
              <span class="text-xs font-mono text-neutral-500">Count:</span>
              <input
                v-model.number="bulkCount"
                type="number"
                min="1"
                max="100"
                class="w-16 px-2 py-1 font-mono text-sm bg-neutral-100 dark:bg-surface-elevated border border-neutral-200 dark:border-neutral-700 rounded focus:border-accent-lime focus:outline-none"
              />
            </div>
            <button
              @click="generateBulk"
              class="flex items-center gap-2 px-3 py-1.5 bg-neutral-900 dark:bg-accent-lime text-white dark:text-neutral-900 font-mono text-xs font-medium rounded-lg hover:opacity-80 transition-opacity"
            >
              <RefreshCw class="w-3.5 h-3.5" />
              Generate
            </button>
            <button
              v-if="bulkUuids.length > 0"
              @click="copyAllBulk"
              class="flex items-center gap-2 px-3 py-1.5 border border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300 font-mono text-xs rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              <Copy class="w-3.5 h-3.5" />
              Copy All
            </button>
          </div>
        </div>
      </template>

      <div v-if="bulkUuids.length > 0" class="space-y-1 max-h-64 overflow-auto">
        <div
          v-for="(uuid, index) in formattedBulkUuids"
          :key="index"
          class="flex items-center justify-between gap-2 p-2 bg-neutral-50 dark:bg-surface-elevated rounded group"
        >
          <span class="font-mono text-sm text-neutral-700 dark:text-neutral-300 select-all">{{ uuid }}</span>
          <CopyButton :text="uuid" size="sm" />
        </div>
      </div>
      <div v-else class="text-center py-8 text-neutral-400 dark:text-neutral-600 font-mono text-sm">
        Click "Generate" to create multiple UUIDs
      </div>
    </ToolCard>

    <!-- Validate UUID -->
    <ToolCard v-if="validateMode">
      <template #header>
        <div class="flex items-center gap-2">
          <CheckCircle class="w-4 h-4 text-green-500" />
          <h3 class="font-display font-bold text-neutral-900 dark:text-neutral-100">Validate UUID</h3>
        </div>
      </template>

      <div class="space-y-4">
        <input
          v-model="validateInput"
          type="text"
          placeholder="Paste UUID to validate..."
          class="w-full px-4 py-3 font-mono text-sm bg-white dark:bg-surface-elevated border-2 border-neutral-200 dark:border-neutral-700 rounded-lg focus:border-accent-lime focus:outline-none"
        />

        <div
          v-if="validationResult"
          class="flex items-center gap-3 p-4 rounded-lg"
          :class="validationResult.isValid
            ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
            : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'"
        >
          <component
            :is="validationResult.isValid ? CheckCircle : AlertCircle"
            class="w-5 h-5"
            :class="validationResult.isValid ? 'text-green-500' : 'text-red-500'"
          />
          <div>
            <p
              class="font-mono text-sm font-medium"
              :class="validationResult.isValid ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'"
            >
              {{ validationResult.isValid ? 'Valid UUID' : 'Invalid UUID format' }}
            </p>
            <p v-if="validationResult.isValid" class="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
              Version {{ validationResult.version }} • {{ validationResult.variant }}
            </p>
          </div>
        </div>
      </div>
    </ToolCard>

    <!-- Info Box -->
    <div class="p-4 bg-neutral-50 dark:bg-surface-elevated rounded-xl border border-neutral-200 dark:border-neutral-800">
      <h4 class="font-mono text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">UUID Versions</h4>
      <div class="grid sm:grid-cols-3 gap-4">
        <div v-for="(info, version) in UUID_INFO" :key="version" class="space-y-1">
          <span class="font-mono text-sm font-medium text-accent-lime">{{ version.toUpperCase() }}</span>
          <span class="text-xs text-neutral-600 dark:text-neutral-400 ml-2">{{ info.name }}</span>
          <p class="text-xs text-neutral-500 dark:text-neutral-500">{{ info.description }}</p>
        </div>
      </div>
    </div>
  </div>
</template>
