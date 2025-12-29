import { computed } from 'vue'
import { useLocalStorage } from './useLocalStorage'
import type { Favorite, ToolId } from '../types'

const favorites = useLocalStorage<Favorite[]>('devtoolkit-favorites', [])

export function useFavorites() {
  function addFavorite(
    toolId: ToolId,
    name: string,
    input: string,
    output?: string,
    options?: Record<string, unknown>
  ): Favorite {
    const favorite: Favorite = {
      id: crypto.randomUUID(),
      toolId,
      name,
      input,
      output,
      options,
      createdAt: Date.now()
    }

    favorites.value = [favorite, ...favorites.value]
    return favorite
  }

  function removeFavorite(id: string): void {
    favorites.value = favorites.value.filter(f => f.id !== id)
  }

  function updateFavorite(id: string, updates: Partial<Omit<Favorite, 'id' | 'createdAt'>>): void {
    favorites.value = favorites.value.map(f =>
      f.id === id ? { ...f, ...updates } : f
    )
  }

  function getFavoritesByTool(toolId: ToolId) {
    return computed(() =>
      favorites.value.filter(f => f.toolId === toolId)
    )
  }

  function clearFavorites(toolId?: ToolId): void {
    if (toolId) {
      favorites.value = favorites.value.filter(f => f.toolId !== toolId)
    } else {
      favorites.value = []
    }
  }

  return {
    favorites,
    addFavorite,
    removeFavorite,
    updateFavorite,
    getFavoritesByTool,
    clearFavorites
  }
}
