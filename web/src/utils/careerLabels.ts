import type { AcademicOffer } from '../types/offer'

export type CareerSort = 'name' | 'vacancies'

export const careerSortOptions: { value: CareerSort; label: string }[] = [
  { value: 'name', label: 'Nombre (A-Z)' },
  { value: 'vacancies', label: 'Más vacantes' },
]

export function readCareerSort(value: string | null): CareerSort {
  return value === 'vacancies' ? 'vacancies' : 'name'
}

export function sortCareers(offers: AcademicOffer[], sort: CareerSort) {
  return [...offers].sort((a, b) =>
    sort === 'vacancies'
      ? b.vacantes - a.vacantes || a.carrera.localeCompare(b.carrera, 'es')
      : a.carrera.localeCompare(b.carrera, 'es') || a.universidad.localeCompare(b.universidad),
  )
}
