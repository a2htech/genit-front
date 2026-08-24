import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import type { Level } from './academic-year.types'

const STORAGE_KEY = 'genit:context'

function loadPersistedLevel(): Level | null {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as { level?: Level | null }
    return parsed.level ?? null
  } catch {
    return null
  }
}

/** Le niveau consulté est une préférence d'affichage locale ; l'année universitaire est un état serveur global (voir academic-year.queries). */
export const useContextStore = defineStore('context', () => {
  const level = ref<Level | null>(loadPersistedLevel())

  const hasContext = computed(() => level.value !== null)

  function setLevel(value: Level): void {
    level.value = value
  }

  function reset(): void {
    level.value = null
  }

  watch(level, () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ level: level.value }))
  })

  return { level, hasContext, setLevel, reset }
})
