export function formatNote(note: number | null): string {
  return note === null ? '—' : note.toFixed(2)
}

export function formatDate(date: string): string {
  return new Intl.DateTimeFormat('fr-FR').format(new Date(date))
}
