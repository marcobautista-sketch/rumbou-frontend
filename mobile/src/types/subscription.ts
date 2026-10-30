export type SubscriptionStatus = 'PENDIENTE' | 'ACTIVA' | 'VENCIDA' | 'CANCELADA'

export interface Subscription {
  id: number
  plan: 'GRATUITO' | 'PRO'
  estado: SubscriptionStatus
  fechaInicio: string | null
  fechaFin: string | null
  linkPago: string | null
}
