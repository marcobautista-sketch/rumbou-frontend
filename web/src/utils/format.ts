export function formatDate(isoDate: string) {
  return new Date(`${isoDate}T00:00:00`).toLocaleDateString('es-PE', { dateStyle: 'long' })
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
