import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import type { Niveau } from './academic-year.types'

const STORAGE_KEY = 'genit:context'

interface PersistedContexte {
  annee: number | null
  niveau: Niveau | null
}

function loadPersisted(): PersistedContexte {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return { annee: null, niveau: null }
  try {
    const parsed = JSON.parse(raw) as Partial<PersistedContexte>
    return {
      annee: typeof parsed.annee === 'number' ? parsed.annee : null,
      niveau: parsed.niveau ?? null,
    }
  } catch {
    return { annee: null, niveau: null }
  }
}

export const useContextStore = defineStore('context', () => {
  const initial = loadPersisted()
  const annee = ref<number | null>(initial.annee)
  const niveau = ref<Niveau | null>(initial.niveau)

  const hasContext = computed(() => annee.value !== null && niveau.value !== null)
  /** "2025-2026" à partir de la seule année stockée (sa fin, ex. 2026). */
  const anneeLibelle = computed(() => (annee.value !== null ? `${annee.value - 1}-${annee.value}` : null))

  function setAnnee(value: number): void {
    annee.value = value
  }

  function setNiveau(value: Niveau): void {
    niveau.value = value
  }

  function reset(): void {
    annee.value = null
    niveau.value = null
  }

  watch([annee, niveau], () => {
    const payload: PersistedContexte = { annee: annee.value, niveau: niveau.value }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
  })

  return { annee, niveau, hasContext, anneeLibelle, setAnnee, setNiveau, reset }
})
