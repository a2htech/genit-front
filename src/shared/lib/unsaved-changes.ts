import { ref } from 'vue'

interface Guard {
  isDirty: () => boolean
  discard: () => void
}

const guard = ref<Guard | null>(null)

/** Une page appelle ça pour bloquer un changement de contexte silencieux tant qu'elle a des modifications non enregistrées. */
export function registerUnsavedGuard(isDirty: () => boolean, discard: () => void): () => void {
  guard.value = { isDirty, discard }
  return () => {
    if (guard.value?.isDirty === isDirty) guard.value = null
  }
}

export function hasUnsavedChanges(): boolean {
  return guard.value?.isDirty() ?? false
}

export function discardUnsavedChanges(): void {
  guard.value?.discard()
}
