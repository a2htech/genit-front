export function formatScore(score: number | null | undefined): string {
  return typeof score === 'number' ? String(score) : '—'
}

export function formatAverage(average: number | null | undefined): string {
  return typeof average === 'number' ? average.toFixed(2) : '—'
}

export function formatDate(date: string): string {
  return new Intl.DateTimeFormat('fr-FR').format(new Date(date))
}

/** L'API n'expose que l'année de fin (2026) ; l'UI affiche la plage universitaire. */
export function formatAcademicYear(year: number): string {
  return `${year - 1}-${year}`
}

export function isFailingScore(score: number | null | undefined): boolean {
  return typeof score === 'number' && score < 10
}
