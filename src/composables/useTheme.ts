import { ref, watch, onMounted } from 'vue'
import { useLocalStorage } from './useLocalStorage'

type Theme = 'light' | 'dark' | 'system'

const theme = useLocalStorage<Theme>('devtoolkit-theme', 'system')
const isDark = ref(false)

function getSystemTheme(): boolean {
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

function applyTheme(dark: boolean): void {
  isDark.value = dark
  if (dark) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}

function updateTheme(): void {
  if (theme.value === 'system') {
    applyTheme(getSystemTheme())
  } else {
    applyTheme(theme.value === 'dark')
  }
}

export function useTheme() {
  onMounted(() => {
    updateTheme()

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    mediaQuery.addEventListener('change', () => {
      if (theme.value === 'system') {
        updateTheme()
      }
    })
  })

  watch(theme, updateTheme)

  function toggleTheme(): void {
    if (theme.value === 'light') {
      theme.value = 'dark'
    } else if (theme.value === 'dark') {
      theme.value = 'system'
    } else {
      theme.value = 'light'
    }
  }

  function setTheme(newTheme: Theme): void {
    theme.value = newTheme
  }

  return {
    theme,
    isDark,
    toggleTheme,
    setTheme
  }
}
