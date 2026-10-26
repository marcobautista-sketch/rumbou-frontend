export type PreparationStatus = 'HOLGADO' | 'AJUSTADO' | 'CERCA' | 'REFORZAR'

export interface Goal {
  id: number
  ofertaAcademicaId: number
  universidad: string
  areaId: number
  area: string
  carrera: string
  procesoAdmision: string
  puntajeUltimoIngresante: number
  ultimoPsp: number | null
  indicePreparacion: number | null
  estado: PreparationStatus | null
  estadoDescripcion: string | null
  fechaActualizacion: string
}
