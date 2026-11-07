import type { Page } from './page'

export interface LeagueEntry {
  posicion: number
  alias: string
  xpSemanal: number
  esUsuarioActual: boolean
}

export interface League {
  universidad: string | null
  semanaInicio: string
  participa: boolean
  alias: string | null
  miPosicion: number | null
  miXpSemanal: number
  entradas: Pick<Page<LeagueEntry>, 'content' | 'totalElements' | 'totalPages' | 'number' | 'size'>
}
