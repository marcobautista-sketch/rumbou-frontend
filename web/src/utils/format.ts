export function formatDate(isoDate: string) {
  return new Date(`${isoDate}T00:00:00`).toLocaleDateString('es-PE', { dateStyle: 'long' })
}

export function formatLongDate(isoDateTime: string) {
  return new Date(isoDateTime).toLocaleDateString('es-PE', { dateStyle: 'long' })
}

export function formatShortDate(isoDateTime: string) {
  return new Date(isoDateTime).toLocaleDateString('es-PE', { day: 'numeric', month: 'short' })
}

export function formatScore(score: number) {
  return score.toLocaleString('es-PE', { maximumFractionDigits: 2 })
}

export function daysUntil(isoDate: string) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(`${isoDate}T00:00:00`)
  return Math.round((target.getTime() - today.getTime()) / 86_400_000)
}

export function formatDuration(totalSeconds: number) {
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  const twoDigits = (value: number) => String(value).padStart(2, '0')
  return `${hours > 0 ? `${hours}:` : ''}${twoDigits(minutes)}:${twoDigits(seconds)}`
}

export function alternativeLetter(position: number) {
  return String.fromCharCode(65 + position)
}
