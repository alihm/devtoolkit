import { ref, watch, type Ref } from 'vue'

export function useLocalStorage<T>(key: string, defaultValue: T): Ref<T> {
  const stored = localStorage.getItem(key)
  const value = ref<T>(stored ? JSON.parse(stored) : defaultValue) as Ref<T>

  watch(
    value,
    (newValue) => {
      localStorage.setItem(key, JSON.stringify(newValue))
    },
    { deep: true }
  )

  return value
}

export function exportAllData(): string {
  const data: Record<string, unknown> = {}

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key?.startsWith('devtoolkit-')) {
      const value = localStorage.getItem(key)
      if (value) {
        data[key] = JSON.parse(value)
      }
    }
  }

  return JSON.stringify(data, null, 2)
}

export function importAllData(jsonString: string): boolean {
  try {
    const data = JSON.parse(jsonString)

    for (const [key, value] of Object.entries(data)) {
      if (key.startsWith('devtoolkit-')) {
        localStorage.setItem(key, JSON.stringify(value))
      }
    }

    return true
  } catch {
    return false
  }
}

export function clearAllData(): void {
  const keysToRemove: string[] = []

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key?.startsWith('devtoolkit-')) {
      keysToRemove.push(key)
    }
  }

  keysToRemove.forEach(key => localStorage.removeItem(key))
}
