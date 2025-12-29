<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Palette, Star, RefreshCw } from 'lucide-vue-next'
import ToolCard from '../shared/ToolCard.vue'
import CopyButton from '../shared/CopyButton.vue'
import { parseColor, convertColor, randomColor, getContrastColor, getComplementaryColor, generatePalette, type RGB } from '../../utils/color'
import { useFavorites } from '../../composables/useFavorites'

const { addFavorite } = useFavorites()

const input = ref('#CCFF00')
const currentRgb = ref<RGB>({ r: 204, g: 255, b: 0 })

const parsedResult = computed(() => {
  if (!input.value.trim()) return null
  return parseColor(input.value)
})

const colorFormats = computed(() => {
  if (!parsedResult.value?.success) return null
  return parsedResult.value.color
})

const contrastColor = computed(() => {
  if (!colorFormats.value) return '#000000'
  return getContrastColor(colorFormats.value.rgb)
})

const complementaryColor = computed(() => {
  if (!colorFormats.value) return null
  return convertColor(getComplementaryColor(colorFormats.value.rgb))
})

const palette = computed(() => {
  if (!colorFormats.value) return []
  return generatePalette(colorFormats.value.rgb, 5).map(rgb => convertColor(rgb))
})

watch(parsedResult, (result) => {
  if (result?.success && result.color) {
    currentRgb.value = result.color.rgb
  }
})

function generateRandom() {
  const rgb = randomColor()
  currentRgb.value = rgb
  const colors = convertColor(rgb)
  input.value = colors.hex
}

function handleSaveFavorite() {
  const name = prompt('Enter a name for this favorite:')
  if (name && colorFormats.value) {
    addFavorite('color', name, input.value, colorFormats.value.hex)
  }
}

function updateFromPicker(event: Event) {
  const target = event.target as HTMLInputElement
  input.value = target.value
}

</script>

<template>
  <div class="space-y-6 animate-fade-in">
    <!-- Color Preview -->
    <div
      class="relative h-32 rounded-xl border-2 border-neutral-200 dark:border-neutral-700 overflow-hidden transition-colors duration-300"
      :style="{ backgroundColor: colorFormats?.hex || '#ffffff' }"
    >
      <div class="absolute inset-0 flex items-center justify-center">
        <span
          class="font-mono text-2xl font-bold px-4 py-2 rounded-lg backdrop-blur-sm"
          :style="{ color: contrastColor, backgroundColor: 'rgba(0,0,0,0.1)' }"
        >
          {{ colorFormats?.hex || 'Enter a color' }}
        </span>
      </div>

      <!-- Color Picker -->
      <input
        type="color"
        :value="colorFormats?.hex || '#ffffff'"
        @input="updateFromPicker"
        class="absolute top-3 right-3 w-10 h-10 rounded-lg cursor-pointer border-2 border-white shadow-lg"
      />
    </div>

    <!-- Controls -->
    <div class="flex flex-wrap items-center gap-3">
      <button
        @click="generateRandom"
        class="flex items-center gap-2 px-4 py-2 bg-neutral-900 dark:bg-accent-lime text-white dark:text-neutral-900 font-mono text-sm font-medium rounded-lg hover:opacity-80 transition-opacity"
      >
        <RefreshCw class="w-4 h-4" />
        Random
      </button>

      <div class="flex-1" />

      <button
        @click="handleSaveFavorite"
        :disabled="!colorFormats"
        class="flex items-center gap-2 px-3 py-1.5 rounded-lg font-mono text-sm text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors disabled:opacity-50"
      >
        <Star class="w-4 h-4" />
        Save
      </button>
    </div>

    <!-- Input -->
    <ToolCard>
      <template #header>
        <div>
          <h3 class="font-display font-bold text-neutral-900 dark:text-neutral-100">Input</h3>
          <p class="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
            Enter HEX, RGB, or HSL color
          </p>
        </div>
      </template>

      <input
        v-model="input"
        type="text"
        placeholder="#CCFF00 or rgb(204, 255, 0) or hsl(72, 100%, 50%)"
        class="w-full px-4 py-3 font-mono text-lg bg-white dark:bg-surface-elevated border-2 border-neutral-200 dark:border-neutral-700 rounded-lg focus:border-accent-lime focus:outline-none"
      />

      <div
        v-if="input && parsedResult && !parsedResult.success"
        class="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
      >
        <p class="text-sm font-mono text-red-600 dark:text-red-400">{{ parsedResult.error }}</p>
      </div>
    </ToolCard>

    <!-- Color Formats -->
    <div v-if="colorFormats" class="grid md:grid-cols-2 gap-6">
      <!-- HEX & RGB -->
      <ToolCard>
        <template #header>
          <h3 class="font-display font-bold text-neutral-900 dark:text-neutral-100">Formats</h3>
        </template>

        <div class="space-y-3">
          <div class="flex items-center justify-between p-3 bg-neutral-50 dark:bg-surface-elevated rounded-lg">
            <div>
              <p class="text-xs font-mono text-neutral-500 dark:text-neutral-400 mb-1">HEX</p>
              <p class="font-mono text-sm text-neutral-900 dark:text-neutral-100">{{ colorFormats.hex }}</p>
            </div>
            <CopyButton :text="colorFormats.hex" size="sm" />
          </div>

          <div class="flex items-center justify-between p-3 bg-neutral-50 dark:bg-surface-elevated rounded-lg">
            <div>
              <p class="text-xs font-mono text-neutral-500 dark:text-neutral-400 mb-1">RGB</p>
              <p class="font-mono text-sm text-neutral-900 dark:text-neutral-100">{{ colorFormats.cssRgb }}</p>
            </div>
            <CopyButton :text="colorFormats.cssRgb" size="sm" />
          </div>

          <div class="flex items-center justify-between p-3 bg-neutral-50 dark:bg-surface-elevated rounded-lg">
            <div>
              <p class="text-xs font-mono text-neutral-500 dark:text-neutral-400 mb-1">HSL</p>
              <p class="font-mono text-sm text-neutral-900 dark:text-neutral-100">{{ colorFormats.cssHsl }}</p>
            </div>
            <CopyButton :text="colorFormats.cssHsl" size="sm" />
          </div>

          <div class="flex items-center justify-between p-3 bg-neutral-50 dark:bg-surface-elevated rounded-lg">
            <div>
              <p class="text-xs font-mono text-neutral-500 dark:text-neutral-400 mb-1">HSV</p>
              <p class="font-mono text-sm text-neutral-900 dark:text-neutral-100">
                hsv({{ colorFormats.hsv.h }}, {{ colorFormats.hsv.s }}%, {{ colorFormats.hsv.v }}%)
              </p>
            </div>
            <CopyButton :text="`hsv(${colorFormats.hsv.h}, ${colorFormats.hsv.s}%, ${colorFormats.hsv.v}%)`" size="sm" />
          </div>

          <div class="flex items-center justify-between p-3 bg-neutral-50 dark:bg-surface-elevated rounded-lg">
            <div>
              <p class="text-xs font-mono text-neutral-500 dark:text-neutral-400 mb-1">CMYK</p>
              <p class="font-mono text-sm text-neutral-900 dark:text-neutral-100">
                cmyk({{ colorFormats.cmyk.c }}%, {{ colorFormats.cmyk.m }}%, {{ colorFormats.cmyk.y }}%, {{ colorFormats.cmyk.k }}%)
              </p>
            </div>
            <CopyButton :text="`cmyk(${colorFormats.cmyk.c}%, ${colorFormats.cmyk.m}%, ${colorFormats.cmyk.y}%, ${colorFormats.cmyk.k}%)`" size="sm" />
          </div>
        </div>
      </ToolCard>

      <!-- RGB Values -->
      <ToolCard>
        <template #header>
          <h3 class="font-display font-bold text-neutral-900 dark:text-neutral-100">RGB Values</h3>
        </template>

        <div class="space-y-4">
          <div>
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm font-mono text-red-500">R</span>
              <span class="font-mono text-sm text-neutral-900 dark:text-neutral-100">{{ colorFormats.rgb.r }}</span>
            </div>
            <div class="h-3 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
              <div
                class="h-full bg-red-500 rounded-full transition-all duration-300"
                :style="{ width: `${(colorFormats.rgb.r / 255) * 100}%` }"
              />
            </div>
          </div>

          <div>
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm font-mono text-green-500">G</span>
              <span class="font-mono text-sm text-neutral-900 dark:text-neutral-100">{{ colorFormats.rgb.g }}</span>
            </div>
            <div class="h-3 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
              <div
                class="h-full bg-green-500 rounded-full transition-all duration-300"
                :style="{ width: `${(colorFormats.rgb.g / 255) * 100}%` }"
              />
            </div>
          </div>

          <div>
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm font-mono text-blue-500">B</span>
              <span class="font-mono text-sm text-neutral-900 dark:text-neutral-100">{{ colorFormats.rgb.b }}</span>
            </div>
            <div class="h-3 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
              <div
                class="h-full bg-blue-500 rounded-full transition-all duration-300"
                :style="{ width: `${(colorFormats.rgb.b / 255) * 100}%` }"
              />
            </div>
          </div>
        </div>
      </ToolCard>
    </div>

    <!-- Complementary & Palette -->
    <div v-if="colorFormats" class="grid md:grid-cols-2 gap-6">
      <!-- Complementary -->
      <ToolCard v-if="complementaryColor">
        <template #header>
          <h3 class="font-display font-bold text-neutral-900 dark:text-neutral-100">Complementary</h3>
        </template>

        <div class="flex gap-4">
          <div class="flex-1">
            <div
              class="h-20 rounded-lg mb-2 border border-neutral-200 dark:border-neutral-700"
              :style="{ backgroundColor: colorFormats.hex }"
            />
            <p class="font-mono text-xs text-center text-neutral-600 dark:text-neutral-400">{{ colorFormats.hex }}</p>
          </div>
          <div class="flex-1">
            <div
              class="h-20 rounded-lg mb-2 border border-neutral-200 dark:border-neutral-700"
              :style="{ backgroundColor: complementaryColor.hex }"
            />
            <p class="font-mono text-xs text-center text-neutral-600 dark:text-neutral-400">{{ complementaryColor.hex }}</p>
          </div>
        </div>
      </ToolCard>

      <!-- Palette -->
      <ToolCard>
        <template #header>
          <div class="flex items-center gap-2">
            <Palette class="w-4 h-4 text-accent-lime" />
            <h3 class="font-display font-bold text-neutral-900 dark:text-neutral-100">Color Palette</h3>
          </div>
        </template>

        <div class="flex gap-2">
          <button
            v-for="(color, index) in palette"
            :key="index"
            @click="input = color.hex"
            class="flex-1 group"
          >
            <div
              class="h-16 rounded-lg mb-2 border border-neutral-200 dark:border-neutral-700 transition-transform group-hover:scale-105"
              :style="{ backgroundColor: color.hex }"
            />
            <p class="font-mono text-[10px] text-center text-neutral-500 dark:text-neutral-500 group-hover:text-neutral-900 dark:group-hover:text-neutral-100">
              {{ color.hex }}
            </p>
          </button>
        </div>
      </ToolCard>
    </div>

    <!-- Info -->
    <div class="p-4 bg-neutral-50 dark:bg-surface-elevated rounded-xl border border-neutral-200 dark:border-neutral-800">
      <h4 class="font-mono text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Supported Formats</h4>
      <div class="grid sm:grid-cols-3 gap-4 text-sm text-neutral-500 dark:text-neutral-400">
        <div>
          <span class="font-medium text-neutral-700 dark:text-neutral-300">HEX:</span>
          <span class="ml-1 font-mono">#RRGGBB, #RGB</span>
        </div>
        <div>
          <span class="font-medium text-neutral-700 dark:text-neutral-300">RGB:</span>
          <span class="ml-1 font-mono">rgb(R, G, B)</span>
        </div>
        <div>
          <span class="font-medium text-neutral-700 dark:text-neutral-300">HSL:</span>
          <span class="ml-1 font-mono">hsl(H, S%, L%)</span>
        </div>
      </div>
    </div>
  </div>
</template>
