export function formatDate(isoDate: string) {
  return new Date(`${isoDate}T00:00:00`).toLocaleDateString('es-PE', { dateStyle: 'long' })
}
