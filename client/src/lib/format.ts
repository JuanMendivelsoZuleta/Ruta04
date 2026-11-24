const priceFormatter = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
})

const dateFormatter = new Intl.DateTimeFormat('es-CO', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
})

export function formatPrice(value: number): string {
  return priceFormatter.format(value)
}

export function formatDate(value: string): string {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : dateFormatter.format(date)
}

export const SPORT_LABELS: Record<string, string> = {
  RUNNING: 'Running',
  CYCLING: 'Ciclismo',
  TRIATHLON: 'Triatlón',
  SWIMMING: 'Natación',
  OTHER: 'Otro',
}

export const SPORT_OPTIONS = Object.entries(SPORT_LABELS).map(([value, label]) => ({
  value,
  label,
}))

export function formatCategory(value: string): string {
  return SPORT_LABELS[value] ?? value
}
