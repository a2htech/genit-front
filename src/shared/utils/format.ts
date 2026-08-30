export function formatScore(score: number | null | undefined): string {
  return typeof score === 'number' ? String(score) : '—'
}

export function formatAverage(average: number | null | undefined): string {
  return typeof average === 'number' ? average.toFixed(2) : '—'
}

export function formatDate(date: string): string {
  return new Intl.DateTimeFormat('fr-FR').format(new Date(date))
}

export function isFailingScore(score: number | null | undefined): boolean {
  return typeof score === 'number' && score < 10
}
