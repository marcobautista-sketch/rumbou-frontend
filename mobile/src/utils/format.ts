export function formatDays(days: number) {
  return `${days} ${days === 1 ? 'día' : 'días'}`
}

export function daysUntil(isoDate: string) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(`${isoDate}T00:00:00`)
  return Math.round((target.getTime() - today.getTime()) / 86_400_000)
}
