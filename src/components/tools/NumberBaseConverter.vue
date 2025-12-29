<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  Binary,
  Hash,
  Star,
  ArrowRightLeft,
  Type
} from 'lucide-vue-next'
import ToolCard from '../shared/ToolCard.vue'
import CopyButton from '../shared/CopyButton.vue'
import {
  BASES,
  convertNumber,
  formatBinary,
  formatHex,
  getBitLength,
  textToBinary,
  textToHex,
  binaryToText,
  hexToText,
  type NumberBase,
  type ConversionResult
} from '../../utils/numberBase'
import { useFavorites } from '../../composables/useFavorites'

const { addFavorite } = useFavorites()

type Mode = 'number' | 'text'

const mode = ref<Mode>('number')
const inputValue = ref('')
const selectedBase = ref<NumberBase>('decimal')
const formatOutput = ref(true)

const result = computed((): ConversionResult => {
  if (!inputValue.value.trim()) {
    return { binary: '', octal: '', decimal: '', hexadecimal: '', isValid: true }
  }
  return convertNumber(inputValue.value.trim(), selectedBase.value)
})

const textBinary = computed(() => textToBinary(inputValue.value))
const textHex = computed(() => textToHex(inputValue.value))
const binaryText = computed(() => binaryToText(inputValue.value))
const hexText = computed(() => hexToText(inputValue.value))

const bitLength = computed(() => {
  if (!result.value.isValid || !result.value.decimal) return 0
  try {
    return getBitLength(BigInt(result.value.decimal))
  } catch {
    return 0
  }
})

const formattedBinary = computed(() => {
  if (!result.value.binary) return ''
  return formatOutput.value ? formatBinary(result.value.binary) : result.value.binary
})

const formattedHex = computed(() => {
  if (!result.value.hexadecimal) return ''
  return formatOutput.value ? formatHex(result.value.hexadecimal) : result.value.hexadecimal
})

function setBaseAndFocus(base: NumberBase) {
  selectedBase.value = base
}

function loadSample() {
  if (mode.value === 'number') {
    inputValue.value = '255'
    selectedBase.value = 'decimal'
  } else {
    inputValue.value = 'Hello'
  }
}

function clearAll() {
  inputValue.value = ''
}

function swapToResult(base: NumberBase) {
  if (result.value.isValid && result.value[base]) {
    inputValue.value = result.value[base]
    selectedBase.value = base
  }
}

function handleSaveFavorite() {
  const name = prompt('Enter a name for this favorite:')
  if (name && result.value.isValid) {
    addFavorite('number-base', name, `${selectedBase.value}: ${inputValue.value}`, JSON.stringify(result.value, null, 2), {
      inputValue: inputValue.value,
      selectedBase: selectedBase.value,
      mode: mode.value
    })
  }
}
</script>

<template>
  <div class="space-y-6 animate-fade-in">
    <!-- Mode & Controls -->
    <div class="flex flex-wrap items-center gap-3">
      <div class="flex items-center bg-neutral-100 dark:bg-surface-elevated rounded-lg p-1">
        <button
          @click="mode = 'number'"
          class="flex items-center gap-2 px-4 py-2 rounded-md font-mono text-sm transition-colors"
          :class="mode === 'number'
            ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 shadow-sm'
            : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'"
        >
          <Binary class="w-4 h-4" />
          Number
        </button>
        <button
          @click="mode = 'text'"
          class="flex items-center gap-2 px-4 py-2 rounded-md font-mono text-sm transition-colors"
          :class="mode === 'text'
            ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 shadow-sm'
            : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'"
        >
          <Type class="w-4 h-4" />
          Text
        </button>
      </div>

      <div class="flex-1" />

      <label class="flex items-center gap-2 text-sm font-mono text-neutral-600 dark:text-neutral-400">
        <input
          v-model="formatOutput"
          type="checkbox"
          class="w-4 h-4 rounded border-neutral-300 dark:border-neutral-600 text-accent-lime focus:ring-accent-lime"
        />
        Format output
      </label>

      <button
        @click="loadSample"
        class="px-3 py-2 rounded-lg font-mono text-sm bg-neutral-100 dark:bg-surface-elevated text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
      >
        Sample
      </button>

      <button
        @click="clearAll"
        class="px-3 py-2 rounded-lg font-mono text-sm bg-neutral-100 dark:bg-surface-elevated text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
      >
        Clear
      </button>

      <button
        @click="handleSaveFavorite"
        :disabled="!result.isValid || !inputValue"
        class="flex items-center gap-2 px-3 py-2 rounded-lg font-mono text-sm text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Star class="w-4 h-4" />
        Save
      </button>
    </div>

    <!-- Number Mode -->
    <template v-if="mode === 'number'">
      <!-- Base Selection -->
      <div class="p-4 bg-neutral-50 dark:bg-surface-elevated rounded-lg border border-neutral-200 dark:border-neutral-700">
        <div class="text-xs font-mono text-neutral-500 dark:text-neutral-400 mb-3">Input Base</div>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="base in BASES"
            :key="base.id"
            @click="setBaseAndFocus(base.id)"
            class="px-4 py-2 rounded-lg font-mono text-sm transition-colors border"
            :class="selectedBase === base.id
              ? 'bg-accent-lime text-neutral-900 shadow-sm border-transparent'
              : 'bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700 border-neutral-200 dark:border-neutral-700'"
          >
            <div class="font-medium">{{ base.name }}</div>
            <div class="text-xs opacity-70">Base {{ base.radix }}</div>
          </button>
        </div>
      </div>

      <!-- Input -->
      <ToolCard>
        <template #header>
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <Hash class="w-4 h-4 text-accent-lime" />
              <h3 class="font-display font-bold text-neutral-900 dark:text-neutral-100">
                Input ({{ BASES.find(b => b.id === selectedBase)?.name }})
              </h3>
            </div>
            <CopyButton v-if="inputValue" :text="inputValue" />
          </div>
        </template>

        <input
          v-model="inputValue"
          type="text"
          :placeholder="BASES.find(b => b.id === selectedBase)?.placeholder"
          class="w-full px-4 py-3 font-mono text-lg bg-neutral-50 dark:bg-surface-elevated border border-neutral-200 dark:border-neutral-700 rounded-lg focus:border-accent-lime focus:outline-none"
        />

        <div v-if="!result.isValid" class="mt-2 text-sm text-red-500 dark:text-red-400">
          {{ result.error }}
        </div>

        <div v-else-if="result.decimal" class="mt-3 flex items-center gap-4 text-sm font-mono text-neutral-500 dark:text-neutral-400">
          <span>{{ bitLength }} bits</span>
        </div>
      </ToolCard>

      <!-- Results -->
      <div class="grid md:grid-cols-2 gap-4">
        <ToolCard v-for="base in BASES" :key="base.id">
          <template #header>
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="text-xs font-mono px-2 py-0.5 rounded bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400">
                  {{ base.prefix || 'Base ' + base.radix }}
                </span>
                <h3 class="font-display font-bold text-neutral-900 dark:text-neutral-100">
                  {{ base.name }}
                </h3>
              </div>
              <div class="flex items-center gap-1">
                <button
                  v-if="result.isValid && result[base.id] && base.id !== selectedBase"
                  @click="swapToResult(base.id)"
                  class="p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
                  title="Use as input"
                >
                  <ArrowRightLeft class="w-4 h-4" />
                </button>
                <CopyButton v-if="result[base.id]" :text="result[base.id]" />
              </div>
            </div>
          </template>

          <div class="font-mono text-lg break-all min-h-[2rem]">
            <template v-if="result.isValid && result[base.id]">
              <span v-if="base.id === 'binary'" class="text-neutral-800 dark:text-neutral-200">
                {{ formattedBinary }}
              </span>
              <span v-else-if="base.id === 'hexadecimal'" class="text-neutral-800 dark:text-neutral-200">
                {{ formattedHex }}
              </span>
              <span v-else class="text-neutral-800 dark:text-neutral-200">
                {{ result[base.id] }}
              </span>
            </template>
            <span v-else class="text-neutral-400 dark:text-neutral-600 italic">—</span>
          </div>
        </ToolCard>
      </div>
    </template>

    <!-- Text Mode -->
    <template v-else>
      <div class="grid lg:grid-cols-2 gap-4">
        <!-- Text Input -->
        <ToolCard>
          <template #header>
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <Type class="w-4 h-4 text-accent-lime" />
                <h3 class="font-display font-bold text-neutral-900 dark:text-neutral-100">Text</h3>
              </div>
              <CopyButton v-if="inputValue" :text="inputValue" />
            </div>
          </template>

          <textarea
            v-model="inputValue"
            placeholder="Enter text to convert..."
            class="w-full h-32 px-4 py-3 font-mono text-sm bg-neutral-50 dark:bg-surface-elevated border border-neutral-200 dark:border-neutral-700 rounded-lg focus:border-accent-lime focus:outline-none resize-none"
          />
        </ToolCard>

        <!-- Binary Output -->
        <ToolCard>
          <template #header>
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <Binary class="w-4 h-4 text-accent-lime" />
                <h3 class="font-display font-bold text-neutral-900 dark:text-neutral-100">Binary (ASCII)</h3>
              </div>
              <CopyButton v-if="textBinary" :text="textBinary" />
            </div>
          </template>

          <div class="font-mono text-sm break-all min-h-[6rem] p-3 bg-neutral-50 dark:bg-surface-elevated rounded-lg border border-neutral-200 dark:border-neutral-700">
            <span v-if="textBinary" class="text-neutral-800 dark:text-neutral-200">{{ textBinary }}</span>
            <span v-else class="text-neutral-400 dark:text-neutral-600 italic">Binary output...</span>
          </div>
        </ToolCard>

        <!-- Hex Output -->
        <ToolCard>
          <template #header>
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <Hash class="w-4 h-4 text-accent-lime" />
                <h3 class="font-display font-bold text-neutral-900 dark:text-neutral-100">Hexadecimal (ASCII)</h3>
              </div>
              <CopyButton v-if="textHex" :text="textHex" />
            </div>
          </template>

          <div class="font-mono text-sm break-all min-h-[6rem] p-3 bg-neutral-50 dark:bg-surface-elevated rounded-lg border border-neutral-200 dark:border-neutral-700">
            <span v-if="textHex" class="text-neutral-800 dark:text-neutral-200">{{ textHex }}</span>
            <span v-else class="text-neutral-400 dark:text-neutral-600 italic">Hex output...</span>
          </div>
        </ToolCard>

        <!-- Decoded Text -->
        <ToolCard>
          <template #header>
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <ArrowRightLeft class="w-4 h-4 text-accent-lime" />
                <h3 class="font-display font-bold text-neutral-900 dark:text-neutral-100">Decoded Text</h3>
              </div>
              <CopyButton v-if="binaryText || hexText" :text="binaryText || hexText" />
            </div>
          </template>

          <div class="font-mono text-sm min-h-[6rem] p-3 bg-neutral-50 dark:bg-surface-elevated rounded-lg border border-neutral-200 dark:border-neutral-700">
            <div v-if="binaryText" class="mb-2">
              <span class="text-xs text-neutral-500 dark:text-neutral-400">From binary: </span>
              <span class="text-neutral-800 dark:text-neutral-200">{{ binaryText }}</span>
            </div>
            <div v-if="hexText">
              <span class="text-xs text-neutral-500 dark:text-neutral-400">From hex: </span>
              <span class="text-neutral-800 dark:text-neutral-200">{{ hexText }}</span>
            </div>
            <span v-if="!binaryText && !hexText" class="text-neutral-400 dark:text-neutral-600 italic">
              Enter binary or hex to decode...
            </span>
          </div>
        </ToolCard>
      </div>
    </template>

    <!-- Quick Reference -->
    <div class="p-4 bg-neutral-50 dark:bg-surface-elevated rounded-lg border border-neutral-200 dark:border-neutral-700">
      <h4 class="text-sm font-mono font-medium text-neutral-700 dark:text-neutral-300 mb-3">Quick Reference</h4>
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
        <div>
          <div class="text-neutral-500 dark:text-neutral-400 mb-1">Common Values</div>
          <div class="space-y-1 text-neutral-600 dark:text-neutral-300">
            <div>255 = FF = 11111111</div>
            <div>256 = 100 = 100000000</div>
            <div>1024 = 400 = 10000000000</div>
          </div>
        </div>
        <div>
          <div class="text-neutral-500 dark:text-neutral-400 mb-1">Powers of 2</div>
          <div class="space-y-1 text-neutral-600 dark:text-neutral-300">
            <div>2^8 = 256</div>
            <div>2^16 = 65536</div>
            <div>2^32 = 4294967296</div>
          </div>
        </div>
        <div>
          <div class="text-neutral-500 dark:text-neutral-400 mb-1">Hex Digits</div>
          <div class="space-y-1 text-neutral-600 dark:text-neutral-300">
            <div>A = 10, B = 11</div>
            <div>C = 12, D = 13</div>
            <div>E = 14, F = 15</div>
          </div>
        </div>
        <div>
          <div class="text-neutral-500 dark:text-neutral-400 mb-1">Prefixes</div>
          <div class="space-y-1 text-neutral-600 dark:text-neutral-300">
            <div>0b = Binary</div>
            <div>0o = Octal</div>
            <div>0x = Hexadecimal</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
