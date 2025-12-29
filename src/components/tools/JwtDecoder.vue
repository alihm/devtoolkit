<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { AlertTriangle, CheckCircle, Clock, Star, ShieldCheck, ShieldX } from 'lucide-vue-next'
import CodeEditor from '../shared/CodeEditor.vue'
import ToolCard from '../shared/ToolCard.vue'
import CopyButton from '../shared/CopyButton.vue'
import { decodeJwt, formatJwtPayload, getJwtClaims, isValidJwtFormat } from '../../utils/jwt'
import { useFavorites } from '../../composables/useFavorites'
import { useRecentInputs } from '../../composables/useRecentInputs'

const { addFavorite } = useFavorites()
const { addRecentInput } = useRecentInputs()

const token = ref('')

const result = computed(() => {
  if (!token.value.trim()) {
    return null
  }
  return decodeJwt(token.value)
})

const formattedHeader = computed(() => {
  if (!result.value?.success || !result.value.payload) return ''
  return JSON.stringify(result.value.payload.header, null, 2)
})

const formattedPayload = computed(() => {
  if (!result.value?.success || !result.value.payload) return ''
  return JSON.stringify(result.value.payload.payload, null, 2)
})

const claimDescriptions = getJwtClaims()

watch(token, (val) => {
  if (val.trim()) {
    addRecentInput('jwt', val)
  }
})

function handleSaveFavorite() {
  const name = prompt('Enter a name for this favorite:')
  if (name && result.value?.success) {
    addFavorite('jwt', name, token.value)
  }
}

function formatExpiry(date: Date): string {
  const now = new Date()
  const diff = date.getTime() - now.getTime()

  if (diff < 0) {
    const absDiff = Math.abs(diff)
    const days = Math.floor(absDiff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((absDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))

    if (days > 0) return `Expired ${days} day${days > 1 ? 's' : ''} ago`
    if (hours > 0) return `Expired ${hours} hour${hours > 1 ? 's' : ''} ago`
    return 'Just expired'
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))

  if (days > 0) return `Expires in ${days} day${days > 1 ? 's' : ''}`
  if (hours > 0) return `Expires in ${hours} hour${hours > 1 ? 's' : ''}`
  return 'Expires soon'
}
</script>

<template>
  <div class="space-y-6 animate-fade-in">
    <!-- Token Input -->
    <ToolCard>
      <template #header>
        <div class="flex items-center justify-between">
          <div>
            <h3 class="font-display font-bold text-neutral-900 dark:text-neutral-100">JWT Token</h3>
            <p class="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
              Paste your JSON Web Token
            </p>
          </div>

          <button
            @click="handleSaveFavorite"
            :disabled="!token.trim() || !result?.success"
            class="flex items-center gap-2 px-3 py-1.5 rounded-lg font-mono text-sm text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Star class="w-4 h-4" />
            Save
          </button>
        </div>
      </template>

      <CodeEditor
        v-model="token"
        placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"
        :rows="4"
        :error="result && !result.success ? result.error : undefined"
      />

      <!-- Quick Status -->
      <div v-if="result?.success && result.payload" class="mt-4 flex flex-wrap items-center gap-3">
        <!-- Validity Status -->
        <div
          class="flex items-center gap-2 px-3 py-1.5 rounded-lg"
          :class="result.payload.isExpired
            ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
            : 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400'"
        >
          <component
            :is="result.payload.isExpired ? ShieldX : ShieldCheck"
            class="w-4 h-4"
          />
          <span class="font-mono text-sm">
            {{ result.payload.isExpired ? 'Expired' : 'Valid' }}
          </span>
        </div>

        <!-- Expiry Time -->
        <div
          v-if="result.payload.expiresAt"
          class="flex items-center gap-2 px-3 py-1.5 bg-neutral-100 dark:bg-surface-elevated rounded-lg"
        >
          <Clock class="w-4 h-4 text-neutral-500" />
          <span class="font-mono text-sm text-neutral-600 dark:text-neutral-400">
            {{ formatExpiry(result.payload.expiresAt) }}
          </span>
        </div>

        <!-- Algorithm -->
        <div
          v-if="result.payload.header.alg"
          class="px-3 py-1.5 bg-accent-cyan/10 text-accent-cyan rounded-lg font-mono text-sm"
        >
          {{ result.payload.header.alg }}
        </div>
      </div>
    </ToolCard>

    <!-- Decoded Parts -->
    <div v-if="result?.success && result.payload" class="grid lg:grid-cols-3 gap-6">
      <!-- Header -->
      <ToolCard>
        <template #header>
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <div class="w-3 h-3 rounded-full bg-red-500" />
              <h3 class="font-display font-bold text-neutral-900 dark:text-neutral-100">Header</h3>
            </div>
            <CopyButton :text="formattedHeader" size="sm" />
          </div>
        </template>

        <pre class="font-mono text-sm text-neutral-900 dark:text-neutral-100 whitespace-pre-wrap overflow-auto max-h-64 p-3 bg-neutral-50 dark:bg-surface-elevated rounded-lg">{{ formattedHeader }}</pre>
      </ToolCard>

      <!-- Payload -->
      <ToolCard>
        <template #header>
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <div class="w-3 h-3 rounded-full bg-violet-500" />
              <h3 class="font-display font-bold text-neutral-900 dark:text-neutral-100">Payload</h3>
            </div>
            <CopyButton :text="formattedPayload" size="sm" />
          </div>
        </template>

        <pre class="font-mono text-sm text-neutral-900 dark:text-neutral-100 whitespace-pre-wrap overflow-auto max-h-64 p-3 bg-neutral-50 dark:bg-surface-elevated rounded-lg">{{ formattedPayload }}</pre>
      </ToolCard>

      <!-- Signature -->
      <ToolCard>
        <template #header>
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <div class="w-3 h-3 rounded-full bg-cyan-500" />
              <h3 class="font-display font-bold text-neutral-900 dark:text-neutral-100">Signature</h3>
            </div>
            <CopyButton :text="result.payload.signature" size="sm" />
          </div>
        </template>

        <div class="space-y-3">
          <pre class="font-mono text-xs text-neutral-900 dark:text-neutral-100 break-all p-3 bg-neutral-50 dark:bg-surface-elevated rounded-lg">{{ result.payload.signature }}</pre>

          <div class="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
            <AlertTriangle class="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
            <span class="text-xs text-amber-700 dark:text-amber-300">
              Signature verification requires the secret key and is not performed client-side.
            </span>
          </div>
        </div>
      </ToolCard>
    </div>

    <!-- Claims Reference -->
    <ToolCard v-if="result?.success && result.payload">
      <template #header>
        <h3 class="font-display font-bold text-neutral-900 dark:text-neutral-100">Payload Claims</h3>
      </template>

      <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="(value, key) in result.payload.payload"
          :key="key"
          class="p-3 bg-neutral-50 dark:bg-surface-elevated rounded-lg"
        >
          <div class="flex items-center gap-2 mb-1">
            <span class="font-mono text-sm font-medium text-accent-lime">{{ key }}</span>
            <span
              v-if="claimDescriptions[key as string]"
              class="text-xs text-neutral-500 dark:text-neutral-400"
            >
              ({{ claimDescriptions[key as string] }})
            </span>
          </div>
          <div class="font-mono text-sm text-neutral-900 dark:text-neutral-100 break-all">
            <!-- Format timestamps -->
            <template v-if="['exp', 'iat', 'nbf'].includes(key as string) && typeof value === 'number'">
              <div>{{ value }}</div>
              <div class="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                {{ new Date(value * 1000).toLocaleString() }}
              </div>
            </template>
            <template v-else-if="typeof value === 'object'">
              {{ JSON.stringify(value) }}
            </template>
            <template v-else>
              {{ value }}
            </template>
          </div>
        </div>
      </div>
    </ToolCard>

    <!-- Info Box -->
    <div class="p-4 bg-neutral-50 dark:bg-surface-elevated rounded-xl border border-neutral-200 dark:border-neutral-800">
      <h4 class="font-mono text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">About JWT</h4>
      <p class="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
        JSON Web Tokens (JWT) consist of three parts: <span class="text-red-500 font-medium">Header</span>.<span class="text-violet-500 font-medium">Payload</span>.<span class="text-cyan-500 font-medium">Signature</span>. The header and payload are Base64URL encoded JSON. This tool decodes and displays the contents but does not verify the signature.
      </p>
    </div>
  </div>
</template>
