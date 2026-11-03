// Un punto del trazo en coordenadas de la hoja (1500 × 1000) y el grosor de la línea ahí.
export interface StrokePoint {
  x: number
  y: number
  width: number
}

// Un trazo de la pizarra: con el lápiz pinta y con el borrador quita lo pintado.
export interface Stroke {
  points: StrokePoint[]
  erase?: boolean
}
