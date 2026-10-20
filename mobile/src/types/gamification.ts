export interface Achievement {
  id: number
  nombre: string
  descripcion: string
  fechaDesbloqueo: string
}

export interface Gamification {
  xpTotal: number
  xpSemanal: number
  rachaActual: number
  rachaMaxima: number
  ultimaActividad: string | null
  logros: Achievement[]
}
