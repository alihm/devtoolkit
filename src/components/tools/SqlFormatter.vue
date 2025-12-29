<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import {
  Database,
  Star,
  Sparkles,
  Minimize2,
  AlertCircle,
  AlertTriangle,
  CheckCircle
} from 'lucide-vue-next'
import ToolCard from '../shared/ToolCard.vue'
import CopyButton from '../shared/CopyButton.vue'
import {
  formatSQL,
  minifySQL,
  validateSQL,
  SQL_KEYWORDS,
  type FormatOptions,
  type ValidationResult
} from '../../utils/sql'
import { useFavorites } from '../../composables/useFavorites'

const { addFavorite } = useFavorites()

const inputSQL = ref('')
const outputSQL = ref('')

const options = ref<FormatOptions>({
  uppercase: true,
  indentSize: 2,
  lineWidth: 80
})

const validation = computed((): ValidationResult => {
  if (!inputSQL.value.trim()) {
    return { isValid: true, errors: [], warnings: [] }
  }
  return validateSQL(inputSQL.value)
})

function format() {
  if (!inputSQL.value.trim()) {
    outputSQL.value = ''
    return
  }
  outputSQL.value = formatSQL(inputSQL.value, options.value)
}

function minify() {
  if (!inputSQL.value.trim()) {
    outputSQL.value = ''
    return
  }
  outputSQL.value = minifySQL(inputSQL.value)
}

// Auto-format on input change
watch([inputSQL, options], () => {
  format()
}, { deep: true })

function loadSample() {
  inputSQL.value = `SELECT users.id, users.name, users.email, orders.total, orders.created_at FROM users INNER JOIN orders ON users.id = orders.user_id WHERE users.status = 'active' AND orders.total > 100 ORDER BY orders.created_at DESC LIMIT 10;`
}

function clearAll() {
  inputSQL.value = ''
  outputSQL.value = ''
}

function applyToInput() {
  inputSQL.value = outputSQL.value
}

function handleSaveFavorite() {
  const name = prompt('Enter a name for this favorite:')
  if (name && outputSQL.value) {
    addFavorite('sql', name, `${inputSQL.value.split(/\s+/).length} tokens`, outputSQL.value, {
      inputSQL: inputSQL.value,
      options: options.value
    })
  }
}

// Syntax highlighting helper
function highlightSQL(sql: string): string {
  if (!sql) return ''

  // Escape HTML first
  let highlighted = sql
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

  // Highlight strings
  highlighted = highlighted.replace(/'([^']*)'/g, '<span class="text-green-600 dark:text-green-400">\'$1\'</span>')

  // Highlight numbers
  highlighted = highlighted.replace(/\b(\d+\.?\d*)\b/g, '<span class="text-blue-600 dark:text-blue-400">$1</span>')

  // Highlight keywords
  const keywordPattern = new RegExp(`\\b(${SQL_KEYWORDS.join('|')})\\b`, 'gi')
  highlighted = highlighted.replace(keywordPattern, '<span class="text-purple-600 dark:text-purple-400 font-medium">$1</span>')

  // Highlight comments
  highlighted = highlighted.replace(/(--[^\n]*)/g, '<span class="text-neutral-400 dark:text-neutral-500 italic">$1</span>')
  highlighted = highlighted.replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="text-neutral-400 dark:text-neutral-500 italic">$1</span>')

  return highlighted
}
</script>

<template>
  <div class="space-y-6 animate-fade-in">
    <!-- Controls -->
    <div class="flex flex-wrap items-center gap-3">
      <button
        @click="format"
        class="flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-sm bg-accent-lime text-neutral-900 hover:bg-accent-lime/90 transition-colors"
      >
        <Sparkles class="w-4 h-4" />
        Format
      </button>

      <button
        @click="minify"
        class="flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-sm bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-300 dark:hover:bg-neutral-600 transition-colors"
      >
        <Minimize2 class="w-4 h-4" />
        Minify
      </button>

      <div class="flex-1" />

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
        :disabled="!outputSQL"
        class="flex items-center gap-2 px-3 py-2 rounded-lg font-mono text-sm text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Star class="w-4 h-4" />
        Save
      </button>
    </div>

    <!-- Options -->
    <div class="p-4 bg-neutral-50 dark:bg-surface-elevated rounded-lg border border-neutral-200 dark:border-neutral-700">
      <div class="flex flex-wrap items-center gap-6">
        <label class="flex items-center gap-2 text-sm font-mono text-neutral-600 dark:text-neutral-400">
          <input
            v-model="options.uppercase"
            type="checkbox"
            class="w-4 h-4 rounded border-neutral-300 dark:border-neutral-600 text-accent-lime focus:ring-accent-lime"
          />
          Uppercase keywords
        </label>

        <div class="flex items-center gap-2 text-sm font-mono text-neutral-600 dark:text-neutral-400">
          <span>Indent size:</span>
          <select
            v-model.number="options.indentSize"
            class="px-2 py-1 rounded border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 focus:border-accent-lime focus:outline-none"
          >
            <option :value="2">2 spaces</option>
            <option :value="4">4 spaces</option>
            <option :value="8">8 spaces</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Validation Status -->
    <div
      v-if="inputSQL.trim()"
      class="flex items-center gap-3 px-4 py-3 rounded-lg border"
      :class="[
        validation.errors.length > 0
          ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
          : validation.warnings.length > 0
            ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
            : 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
      ]"
    >
      <component
        :is="validation.errors.length > 0 ? AlertCircle : validation.warnings.length > 0 ? AlertTriangle : CheckCircle"
        class="w-5 h-5"
        :class="[
          validation.errors.length > 0 ? 'text-red-500' : validation.warnings.length > 0 ? 'text-yellow-500' : 'text-green-500'
        ]"
      />
      <div class="flex-1">
        <div
          class="text-sm font-medium"
          :class="[
            validation.errors.length > 0 ? 'text-red-700 dark:text-red-300' : validation.warnings.length > 0 ? 'text-yellow-700 dark:text-yellow-300' : 'text-green-700 dark:text-green-300'
          ]"
        >
          {{ validation.errors.length > 0 ? 'Syntax Errors' : validation.warnings.length > 0 ? 'Warnings' : 'Valid SQL' }}
        </div>
        <div v-if="validation.errors.length > 0" class="text-xs text-red-600 dark:text-red-400 mt-1">
          {{ validation.errors.join(', ') }}
        </div>
        <div v-else-if="validation.warnings.length > 0" class="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
          {{ validation.warnings.join(', ') }}
        </div>
      </div>
    </div>

    <!-- Input/Output -->
    <div class="grid lg:grid-cols-2 gap-4">
      <!-- Input -->
      <ToolCard>
        <template #header>
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <Database class="w-4 h-4 text-accent-lime" />
              <h3 class="font-display font-bold text-neutral-900 dark:text-neutral-100">Input SQL</h3>
            </div>
            <CopyButton v-if="inputSQL" :text="inputSQL" />
          </div>
        </template>

        <textarea
          v-model="inputSQL"
          placeholder="Paste your SQL query here..."
          class="w-full h-80 px-4 py-3 font-mono text-sm bg-neutral-50 dark:bg-surface-elevated border border-neutral-200 dark:border-neutral-700 rounded-lg focus:border-accent-lime focus:outline-none resize-none"
          spellcheck="false"
        />
      </ToolCard>

      <!-- Output -->
      <ToolCard>
        <template #header>
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <Sparkles class="w-4 h-4 text-accent-lime" />
              <h3 class="font-display font-bold text-neutral-900 dark:text-neutral-100">Formatted SQL</h3>
            </div>
            <div class="flex items-center gap-2">
              <button
                v-if="outputSQL"
                @click="applyToInput"
                class="flex items-center gap-1 px-2 py-1 text-xs font-mono bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 rounded hover:bg-neutral-300 dark:hover:bg-neutral-600 transition-colors"
              >
                Apply to Input
              </button>
              <CopyButton v-if="outputSQL" :text="outputSQL" />
            </div>
          </div>
        </template>

        <div
          class="w-full h-80 px-4 py-3 font-mono text-sm bg-neutral-50 dark:bg-surface-elevated border border-neutral-200 dark:border-neutral-700 rounded-lg overflow-auto"
        >
          <pre
            v-if="outputSQL"
            class="whitespace-pre-wrap"
            v-html="highlightSQL(outputSQL)"
          />
          <p v-else class="text-neutral-400 dark:text-neutral-600 italic">
            Formatted SQL will appear here...
          </p>
        </div>
      </ToolCard>
    </div>

    <!-- Common SQL Patterns -->
    <div class="p-4 bg-neutral-50 dark:bg-surface-elevated rounded-lg border border-neutral-200 dark:border-neutral-700">
      <h4 class="text-sm font-mono font-medium text-neutral-700 dark:text-neutral-300 mb-3">Quick Templates</h4>
      <div class="flex flex-wrap gap-2">
        <button
          @click="inputSQL = 'SELECT * FROM table_name WHERE condition;'"
          class="px-3 py-1.5 text-xs font-mono bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg hover:border-accent-lime transition-colors text-neutral-600 dark:text-neutral-400"
        >
          SELECT
        </button>
        <button
          @click="inputSQL = 'INSERT INTO table_name (column1, column2) VALUES (value1, value2);'"
          class="px-3 py-1.5 text-xs font-mono bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg hover:border-accent-lime transition-colors text-neutral-600 dark:text-neutral-400"
        >
          INSERT
        </button>
        <button
          @click="inputSQL = 'UPDATE table_name SET column1 = value1 WHERE condition;'"
          class="px-3 py-1.5 text-xs font-mono bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg hover:border-accent-lime transition-colors text-neutral-600 dark:text-neutral-400"
        >
          UPDATE
        </button>
        <button
          @click="inputSQL = 'DELETE FROM table_name WHERE condition;'"
          class="px-3 py-1.5 text-xs font-mono bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg hover:border-accent-lime transition-colors text-neutral-600 dark:text-neutral-400"
        >
          DELETE
        </button>
        <button
          @click="inputSQL = 'SELECT a.*, b.column FROM table_a a INNER JOIN table_b b ON a.id = b.a_id WHERE a.status = 1;'"
          class="px-3 py-1.5 text-xs font-mono bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg hover:border-accent-lime transition-colors text-neutral-600 dark:text-neutral-400"
        >
          JOIN
        </button>
        <button
          @click="inputSQL = 'SELECT column, COUNT(*) as count FROM table_name GROUP BY column HAVING count > 1 ORDER BY count DESC;'"
          class="px-3 py-1.5 text-xs font-mono bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg hover:border-accent-lime transition-colors text-neutral-600 dark:text-neutral-400"
        >
          GROUP BY
        </button>
        <button
          @click="inputSQL = 'CREATE TABLE table_name (id INT PRIMARY KEY AUTO_INCREMENT, name VARCHAR(255) NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);'"
          class="px-3 py-1.5 text-xs font-mono bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg hover:border-accent-lime transition-colors text-neutral-600 dark:text-neutral-400"
        >
          CREATE TABLE
        </button>
      </div>
    </div>
  </div>
</template>
