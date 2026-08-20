export function formatNote(note: number | null | undefined): string {
  return typeof note === 'number' ? String(note) : '—'
}

export function formatMoyenne(moyenne: number | null | undefined): string {
  return typeof moyenne === 'number' ? moyenne.toFixed(2) : '—'
}

export function formatDate(date: string): string {
  return new Intl.DateTimeFormat('fr-FR').format(new Date(date))
}

export function isNoteEchouee(note: number | null | undefined): boolean {
  return typeof note === 'number' && note < 10
}
