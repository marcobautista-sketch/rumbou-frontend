import type { MasteryTone } from '../../utils/progressLabels'

// Color de la barra de aciertos de un tema: verde si lo domina, ámbar si va a medias y rojo
// si necesita refuerzo (los mismos cortes de masteryTone).
export const masteryBar: Record<MasteryTone, string> = {
  success: 'bg-success',
  warning: 'bg-warning',
  danger: 'bg-danger',
}
