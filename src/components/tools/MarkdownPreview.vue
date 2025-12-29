<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  FileText,
  Eye,
  Code,
  Star,
  List,
  Hash,
  Link,
  Image
} from 'lucide-vue-next'
import ToolCard from '../shared/ToolCard.vue'
import CopyButton from '../shared/CopyButton.vue'
import {
  markdownToHtml,
  getMarkdownStats,
  generateTableOfContents,
  type MarkdownStats,
  type TocEntry
} from '../../utils/markdown'
import { useFavorites } from '../../composables/useFavorites'

const { addFavorite } = useFavorites()

const inputMarkdown = ref('')
const showHtmlSource = ref(false)

const htmlOutput = computed(() => {
  if (!inputMarkdown.value.trim()) return ''
  return markdownToHtml(inputMarkdown.value)
})

const stats = computed((): MarkdownStats => {
  return getMarkdownStats(inputMarkdown.value)
})

const toc = computed((): TocEntry[] => {
  return generateTableOfContents(inputMarkdown.value)
})

function loadSample() {
  inputMarkdown.value = `# Markdown Preview Demo

This is a **live preview** of your markdown content with _styling support_.

## Features

- Real-time preview
- Syntax highlighting
- Table of contents generation
- Statistics tracking

### Code Examples

Inline \`code\` and code blocks:

\`\`\`javascript
function hello() {
  console.log("Hello, World!");
}
\`\`\`

## Links and Images

Check out [GitHub](https://github.com) for more info.

![Alt text](https://via.placeholder.com/150)

## Tables

| Feature | Status |
|---------|--------|
| Headers | Done |
| Lists | Done |
| Tables | Done |

## Blockquotes

> This is a blockquote.
> It can span multiple lines.

## Task Lists

- [x] Completed task
- [ ] Pending task
- [ ] Another task

---

That's all! ***Happy writing!***`
}

function clearAll() {
  inputMarkdown.value = ''
}

function handleSaveFavorite() {
  const name = prompt('Enter a name for this favorite:')
  if (name && inputMarkdown.value) {
    addFavorite('markdown', name, `${stats.value.words} words`, htmlOutput.value, {
      inputMarkdown: inputMarkdown.value
    })
  }
}

function scrollToHeader(slug: string) {
  // In the preview, we'd need to add IDs to headers for this to work
  // For now, this is a placeholder
  console.log('Scroll to:', slug)
}
</script>

<template>
  <div class="space-y-6 animate-fade-in">
    <!-- Controls -->
    <div class="flex flex-wrap items-center gap-3">
      <button
        @click="showHtmlSource = false"
        class="flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-sm transition-colors border"
        :class="!showHtmlSource
          ? 'bg-accent-lime text-neutral-900 border-transparent'
          : 'bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-700'"
      >
        <Eye class="w-4 h-4" />
        Preview
      </button>

      <button
        @click="showHtmlSource = true"
        class="flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-sm transition-colors border"
        :class="showHtmlSource
          ? 'bg-accent-lime text-neutral-900 border-transparent'
          : 'bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-700'"
      >
        <Code class="w-4 h-4" />
        HTML Source
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
        :disabled="!inputMarkdown"
        class="flex items-center gap-2 px-3 py-2 rounded-lg font-mono text-sm text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Star class="w-4 h-4" />
        Save
      </button>
    </div>

    <!-- Stats Bar -->
    <div class="flex flex-wrap items-center gap-4 px-4 py-3 bg-neutral-100 dark:bg-surface-elevated rounded-lg">
      <div class="flex items-center gap-2">
        <Hash class="w-4 h-4 text-accent-lime" />
        <span class="text-sm font-mono text-neutral-600 dark:text-neutral-400">
          {{ stats.headers }} headers
        </span>
      </div>
      <div class="flex items-center gap-2">
        <Link class="w-4 h-4 text-neutral-400" />
        <span class="text-sm font-mono text-neutral-600 dark:text-neutral-400">
          {{ stats.links }} links
        </span>
      </div>
      <div class="flex items-center gap-2">
        <Image class="w-4 h-4 text-neutral-400" />
        <span class="text-sm font-mono text-neutral-600 dark:text-neutral-400">
          {{ stats.images }} images
        </span>
      </div>
      <div class="flex items-center gap-2">
        <Code class="w-4 h-4 text-neutral-400" />
        <span class="text-sm font-mono text-neutral-600 dark:text-neutral-400">
          {{ stats.codeBlocks }} code blocks
        </span>
      </div>
      <div class="flex items-center gap-2">
        <span class="text-sm font-mono text-neutral-600 dark:text-neutral-400">
          {{ stats.words }} words
        </span>
      </div>
      <div class="flex items-center gap-2">
        <span class="text-sm font-mono text-neutral-600 dark:text-neutral-400">
          {{ stats.characters }} chars
        </span>
      </div>
    </div>

    <!-- Main Content -->
    <div class="grid lg:grid-cols-2 gap-4">
      <!-- Input -->
      <ToolCard>
        <template #header>
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <FileText class="w-4 h-4 text-accent-lime" />
              <h3 class="font-display font-bold text-neutral-900 dark:text-neutral-100">Markdown</h3>
            </div>
            <CopyButton v-if="inputMarkdown" :text="inputMarkdown" />
          </div>
        </template>

        <textarea
          v-model="inputMarkdown"
          placeholder="Type or paste your markdown here..."
          class="w-full h-[500px] px-4 py-3 font-mono text-sm bg-neutral-50 dark:bg-surface-elevated border border-neutral-200 dark:border-neutral-700 rounded-lg focus:border-accent-lime focus:outline-none resize-none"
          spellcheck="false"
        />
      </ToolCard>

      <!-- Output -->
      <ToolCard>
        <template #header>
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <component :is="showHtmlSource ? Code : Eye" class="w-4 h-4 text-accent-lime" />
              <h3 class="font-display font-bold text-neutral-900 dark:text-neutral-100">
                {{ showHtmlSource ? 'HTML Source' : 'Preview' }}
              </h3>
            </div>
            <CopyButton v-if="htmlOutput" :text="htmlOutput" />
          </div>
        </template>

        <!-- HTML Source View -->
        <div
          v-if="showHtmlSource"
          class="w-full h-[500px] px-4 py-3 font-mono text-sm bg-neutral-50 dark:bg-surface-elevated border border-neutral-200 dark:border-neutral-700 rounded-lg overflow-auto"
        >
          <pre v-if="htmlOutput" class="whitespace-pre-wrap break-words text-neutral-700 dark:text-neutral-300">{{ htmlOutput }}</pre>
          <p v-else class="text-neutral-400 dark:text-neutral-600 italic">
            HTML will appear here...
          </p>
        </div>

        <!-- Preview View -->
        <div
          v-else
          class="w-full h-[500px] px-4 py-3 bg-white dark:bg-surface-elevated border border-neutral-200 dark:border-neutral-700 rounded-lg overflow-auto markdown-preview"
        >
          <div
            v-if="htmlOutput"
            class="prose prose-neutral dark:prose-invert max-w-none"
            v-html="htmlOutput"
          />
          <p v-else class="text-neutral-400 dark:text-neutral-600 italic">
            Preview will appear here...
          </p>
        </div>
      </ToolCard>
    </div>

    <!-- Table of Contents -->
    <div v-if="toc.length > 0" class="p-4 bg-neutral-50 dark:bg-surface-elevated rounded-lg border border-neutral-200 dark:border-neutral-700">
      <div class="flex items-center gap-2 mb-3">
        <List class="w-4 h-4 text-accent-lime" />
        <h4 class="text-sm font-mono font-medium text-neutral-700 dark:text-neutral-300">Table of Contents</h4>
      </div>
      <ul class="space-y-1">
        <li
          v-for="(entry, index) in toc"
          :key="index"
          class="font-mono text-sm"
          :style="{ paddingLeft: `${(entry.level - 1) * 16}px` }"
        >
          <button
            @click="scrollToHeader(entry.slug)"
            class="text-neutral-600 dark:text-neutral-400 hover:text-accent-lime transition-colors text-left"
          >
            {{ entry.text }}
          </button>
        </li>
      </ul>
    </div>

    <!-- Markdown Cheatsheet -->
    <div class="p-4 bg-neutral-50 dark:bg-surface-elevated rounded-lg border border-neutral-200 dark:border-neutral-700">
      <h4 class="text-sm font-mono font-medium text-neutral-700 dark:text-neutral-300 mb-3">Quick Reference</h4>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
        <div>
          <div class="text-neutral-500 dark:text-neutral-400 mb-1">Headers</div>
          <div class="space-y-0.5 text-neutral-600 dark:text-neutral-300">
            <div># H1</div>
            <div>## H2</div>
            <div>### H3</div>
          </div>
        </div>
        <div>
          <div class="text-neutral-500 dark:text-neutral-400 mb-1">Emphasis</div>
          <div class="space-y-0.5 text-neutral-600 dark:text-neutral-300">
            <div>**bold**</div>
            <div>*italic*</div>
            <div>~~strike~~</div>
          </div>
        </div>
        <div>
          <div class="text-neutral-500 dark:text-neutral-400 mb-1">Lists</div>
          <div class="space-y-0.5 text-neutral-600 dark:text-neutral-300">
            <div>- item</div>
            <div>1. item</div>
            <div>- [x] task</div>
          </div>
        </div>
        <div>
          <div class="text-neutral-500 dark:text-neutral-400 mb-1">Links</div>
          <div class="space-y-0.5 text-neutral-600 dark:text-neutral-300">
            <div>[text](url)</div>
            <div>![alt](img)</div>
            <div>`code`</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Markdown preview styles */
.markdown-preview :deep(h1) {
  @apply text-2xl font-bold text-neutral-900 dark:text-neutral-100 mt-6 mb-4;
}

.markdown-preview :deep(h2) {
  @apply text-xl font-bold text-neutral-900 dark:text-neutral-100 mt-5 mb-3;
}

.markdown-preview :deep(h3) {
  @apply text-lg font-bold text-neutral-900 dark:text-neutral-100 mt-4 mb-2;
}

.markdown-preview :deep(h4),
.markdown-preview :deep(h5),
.markdown-preview :deep(h6) {
  @apply text-base font-bold text-neutral-900 dark:text-neutral-100 mt-3 mb-2;
}

.markdown-preview :deep(p) {
  @apply text-neutral-700 dark:text-neutral-300 my-3 leading-relaxed;
}

.markdown-preview :deep(a) {
  @apply text-accent-lime hover:underline;
}

.markdown-preview :deep(strong) {
  @apply font-bold text-neutral-900 dark:text-neutral-100;
}

.markdown-preview :deep(em) {
  @apply italic;
}

.markdown-preview :deep(del) {
  @apply line-through text-neutral-500;
}

.markdown-preview :deep(code) {
  @apply font-mono text-sm bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded text-pink-600 dark:text-pink-400;
}

.markdown-preview :deep(pre) {
  @apply bg-neutral-100 dark:bg-neutral-800 p-4 rounded-lg my-4 overflow-x-auto;
}

.markdown-preview :deep(pre code) {
  @apply bg-transparent p-0 text-neutral-700 dark:text-neutral-300;
}

.markdown-preview :deep(blockquote) {
  @apply border-l-4 border-accent-lime pl-4 my-4 italic text-neutral-600 dark:text-neutral-400;
}

.markdown-preview :deep(ul),
.markdown-preview :deep(ol) {
  @apply my-3 pl-6;
}

.markdown-preview :deep(ul) {
  @apply list-disc;
}

.markdown-preview :deep(ol) {
  @apply list-decimal;
}

.markdown-preview :deep(li) {
  @apply text-neutral-700 dark:text-neutral-300 my-1;
}

.markdown-preview :deep(hr) {
  @apply my-6 border-neutral-200 dark:border-neutral-700;
}

.markdown-preview :deep(table) {
  @apply w-full my-4 border-collapse;
}

.markdown-preview :deep(th),
.markdown-preview :deep(td) {
  @apply border border-neutral-200 dark:border-neutral-700 px-3 py-2 text-left;
}

.markdown-preview :deep(th) {
  @apply bg-neutral-100 dark:bg-neutral-800 font-medium text-neutral-900 dark:text-neutral-100;
}

.markdown-preview :deep(img) {
  @apply max-w-full h-auto rounded my-4;
}

.markdown-preview :deep(input[type="checkbox"]) {
  @apply mr-2;
}
</style>
