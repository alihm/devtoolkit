<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Type, RefreshCw, Star, FileText, Hash, AlignLeft, LetterText, Coffee, Code, Briefcase, BookOpen } from 'lucide-vue-next'
import ToolCard from '../shared/ToolCard.vue'
import CopyButton from '../shared/CopyButton.vue'
import { generateLorem, countStats, PRESETS, STYLE_INFO, type LoremType, type TextStyle } from '../../utils/loremIpsum'
import { useFavorites } from '../../composables/useFavorites'

const { addFavorite } = useFavorites()

const loremType = ref<LoremType>('paragraphs')
const textStyle = ref<TextStyle>('lorem')
const count = ref(3)
const startWithLorem = ref(true)
const htmlTags = ref(false)
const generatedText = ref('')

const stats = computed(() => countStats(generatedText.value))

const typeOptions: { value: LoremType; label: string; icon: typeof Type }[] = [
  { value: 'words', label: 'Words', icon: LetterText },
  { value: 'sentences', label: 'Sentences', icon: AlignLeft },
  { value: 'paragraphs', label: 'Paragraphs', icon: FileText }
]

const styleOptions: { value: TextStyle; label: string; icon: typeof Type }[] = [
  { value: 'lorem', label: 'Classic', icon: BookOpen },
  { value: 'hipster', label: 'Hipster', icon: Coffee },
  { value: 'tech', label: 'Tech', icon: Code },
  { value: 'office', label: 'Corporate', icon: Briefcase }
]

function generate() {
  generatedText.value = generateLorem({
    type: loremType.value,
    count: count.value,
    startWithLorem: startWithLorem.value,
    htmlTags: htmlTags.value && loremType.value === 'paragraphs',
    style: textStyle.value
  })
}

function applyPreset(preset: keyof typeof PRESETS) {
  const config = PRESETS[preset]
  loremType.value = config.type
  count.value = config.count
  generate()
}

function handleSaveFavorite() {
  const name = prompt('Enter a name for this favorite:')
  if (name && generatedText.value) {
    addFavorite('lorem', name, `${count.value} ${loremType.value}`, generatedText.value, {
      type: loremType.value,
      count: count.value,
      startWithLorem: startWithLorem.value,
      htmlTags: htmlTags.value,
      style: textStyle.value
    })
  }
}

// Auto-regenerate when options change
watch([loremType, count, startWithLorem, htmlTags, textStyle], () => {
  generate()
})

// Generate initial text
generate()
</script>

<template>
  <div class="space-y-6 animate-fade-in">
    <!-- Controls Row 1: Style Selector -->
    <div class="flex flex-wrap items-center gap-3">
      <!-- Style Selector -->
      <div class="flex items-center bg-neutral-100 dark:bg-surface-elevated rounded-lg p-1">
        <button
          v-for="option in styleOptions"
          :key="option.value"
          @click="textStyle = option.value"
          class="flex items-center gap-2 px-3 py-2 rounded-md font-mono text-sm transition-all duration-150"
          :class="textStyle === option.value
            ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 shadow-sm'
            : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'"
        >
          <component :is="option.icon" class="w-4 h-4" />
          {{ option.label }}
        </button>
      </div>

      <div class="hidden sm:block text-xs text-neutral-400 dark:text-neutral-500">
        {{ STYLE_INFO[textStyle].description }}
      </div>
    </div>

    <!-- Controls Row 2: Type and Options -->
    <div class="flex flex-wrap items-center gap-3">
      <!-- Type Selector -->
      <div class="flex items-center bg-neutral-100 dark:bg-surface-elevated rounded-lg p-1">
        <button
          v-for="option in typeOptions"
          :key="option.value"
          @click="loremType = option.value"
          class="flex items-center gap-2 px-4 py-2 rounded-md font-mono text-sm transition-all duration-150"
          :class="loremType === option.value
            ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 shadow-sm'
            : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'"
        >
          <component :is="option.icon" class="w-4 h-4" />
          {{ option.label }}
        </button>
      </div>

      <!-- Count Input -->
      <div class="flex items-center gap-2">
        <span class="text-xs font-mono text-neutral-500 dark:text-neutral-400">Count:</span>
        <input
          v-model.number="count"
          type="number"
          min="1"
          :max="loremType === 'words' ? 1000 : loremType === 'sentences' ? 100 : 20"
          class="w-20 px-3 py-1.5 font-mono text-sm bg-neutral-100 dark:bg-surface-elevated border border-neutral-200 dark:border-neutral-700 rounded-lg focus:border-accent-lime focus:outline-none"
        />
      </div>

      <!-- Options -->
      <label class="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          v-model="startWithLorem"
          class="w-4 h-4 rounded border-neutral-300 dark:border-neutral-600 text-accent-lime focus:ring-accent-lime dark:bg-surface-elevated"
        />
        <span class="text-sm font-mono text-neutral-600 dark:text-neutral-400">Start with opening</span>
      </label>

      <label v-if="loremType === 'paragraphs'" class="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          v-model="htmlTags"
          class="w-4 h-4 rounded border-neutral-300 dark:border-neutral-600 text-accent-lime focus:ring-accent-lime dark:bg-surface-elevated"
        />
        <span class="text-sm font-mono text-neutral-600 dark:text-neutral-400">&lt;p&gt; tags</span>
      </label>

      <div class="flex-1" />

      <button
        @click="handleSaveFavorite"
        :disabled="!generatedText"
        class="flex items-center gap-2 px-3 py-1.5 rounded-lg font-mono text-sm text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Star class="w-4 h-4" />
        Save
      </button>
    </div>

    <!-- Quick Presets -->
    <div class="flex flex-wrap gap-2">
      <span class="text-xs font-mono text-neutral-500 dark:text-neutral-400 self-center">Quick:</span>
      <button
        @click="applyPreset('short')"
        class="px-3 py-1 text-xs font-mono bg-neutral-100 dark:bg-surface-elevated hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-lg transition-colors"
      >
        1 Paragraph
      </button>
      <button
        @click="applyPreset('medium')"
        class="px-3 py-1 text-xs font-mono bg-neutral-100 dark:bg-surface-elevated hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-lg transition-colors"
      >
        3 Paragraphs
      </button>
      <button
        @click="applyPreset('long')"
        class="px-3 py-1 text-xs font-mono bg-neutral-100 dark:bg-surface-elevated hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-lg transition-colors"
      >
        5 Paragraphs
      </button>
      <button
        @click="applyPreset('words50')"
        class="px-3 py-1 text-xs font-mono bg-neutral-100 dark:bg-surface-elevated hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-lg transition-colors"
      >
        50 Words
      </button>
      <button
        @click="applyPreset('words100')"
        class="px-3 py-1 text-xs font-mono bg-neutral-100 dark:bg-surface-elevated hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-lg transition-colors"
      >
        100 Words
      </button>
      <button
        @click="applyPreset('sentences5')"
        class="px-3 py-1 text-xs font-mono bg-neutral-100 dark:bg-surface-elevated hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-lg transition-colors"
      >
        5 Sentences
      </button>
    </div>

    <!-- Generated Text -->
    <ToolCard>
      <template #header>
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <Type class="w-4 h-4 text-accent-lime" />
            <h3 class="font-display font-bold text-neutral-900 dark:text-neutral-100">Generated Text</h3>
            <span class="text-xs px-2 py-0.5 bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400 rounded-full font-mono">
              {{ STYLE_INFO[textStyle].name }}
            </span>
          </div>
          <div class="flex items-center gap-2">
            <button
              @click="generate"
              class="flex items-center gap-2 px-3 py-1.5 bg-accent-lime text-neutral-900 font-mono text-xs font-medium rounded-lg hover:bg-accent-lime/80 transition-colors"
            >
              <RefreshCw class="w-3.5 h-3.5" />
              Regenerate
            </button>
            <CopyButton v-if="generatedText" :text="generatedText" />
          </div>
        </div>
      </template>

      <div class="space-y-4">
        <div
          class="p-4 bg-neutral-50 dark:bg-surface-elevated rounded-lg border border-neutral-200 dark:border-neutral-700 max-h-96 overflow-auto"
        >
          <p
            v-if="generatedText"
            class="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed whitespace-pre-wrap font-mono"
          >{{ generatedText }}</p>
          <p v-else class="text-sm text-neutral-400 dark:text-neutral-600 italic">
            Click generate to create placeholder text
          </p>
        </div>

        <!-- Stats -->
        <div class="flex flex-wrap gap-4">
          <div class="flex items-center gap-2">
            <Hash class="w-4 h-4 text-neutral-400" />
            <span class="text-xs font-mono text-neutral-500 dark:text-neutral-400">
              {{ stats.words }} words
            </span>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-xs font-mono text-neutral-500 dark:text-neutral-400">
              {{ stats.characters }} characters
            </span>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-xs font-mono text-neutral-500 dark:text-neutral-400">
              {{ stats.charactersNoSpaces }} (no spaces)
            </span>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-xs font-mono text-neutral-500 dark:text-neutral-400">
              {{ stats.sentences }} sentences
            </span>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-xs font-mono text-neutral-500 dark:text-neutral-400">
              {{ stats.paragraphs }} paragraphs
            </span>
          </div>
        </div>
      </div>
    </ToolCard>

    <!-- Style Info Cards -->
    <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
      <div
        v-for="(info, key) in STYLE_INFO"
        :key="key"
        @click="textStyle = key as TextStyle"
        class="p-3 rounded-lg border-2 cursor-pointer transition-all"
        :class="textStyle === key
          ? 'bg-accent-lime/10 border-accent-lime'
          : 'bg-neutral-50 dark:bg-surface-elevated border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600'"
      >
        <div class="flex items-center gap-2 mb-1">
          <component
            :is="styleOptions.find(s => s.value === key)?.icon"
            class="w-4 h-4"
            :class="textStyle === key ? 'text-accent-lime' : 'text-neutral-400'"
          />
          <span class="font-mono text-sm font-medium text-neutral-900 dark:text-neutral-100">{{ info.name }}</span>
        </div>
        <p class="text-xs text-neutral-500 dark:text-neutral-400">{{ info.description }}</p>
      </div>
    </div>
  </div>
</template>
