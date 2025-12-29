import { computed } from 'vue'
import { useLocalStorage } from './useLocalStorage'
import type { RecentInput, ToolId } from '../types'

const MAX_RECENT_INPUTS = 10

const recentInputs = useLocalStorage<RecentInput[]>('devtoolkit-recent-inputs', [])

export function useRecentInputs() {
  function addRecentInput(toolId: ToolId, value: string): void {
    if (!value.trim()) return

    // Remove duplicate if exists
    const filtered = recentInputs.value.filter(
      r => !(r.toolId === toolId && r.value === value)
    )

    const newInput: RecentInput = {
      id: crypto.randomUUID(),
      toolId,
      value,
      timestamp: Date.now()
    }

    // Add to beginning and limit to max
    recentInputs.value = [newInput, ...filtered].slice(0, MAX_RECENT_INPUTS * 6) // 6 tools
  }

  function getRecentInputsByTool(toolId: ToolId) {
    return computed(() =>
      recentInputs.value
        .filter(r => r.toolId === toolId)
        .slice(0, MAX_RECENT_INPUTS)
    )
  }

  function removeRecentInput(id: string): void {
    recentInputs.value = recentInputs.value.filter(r => r.id !== id)
  }

  function clearRecentInputs(toolId?: ToolId): void {
    if (toolId) {
      recentInputs.value = recentInputs.value.filter(r => r.toolId !== toolId)
    } else {
      recentInputs.value = []
    }
  }

  return {
    recentInputs,
    addRecentInput,
    getRecentInputsByTool,
    removeRecentInput,
    clearRecentInputs
  }
}
