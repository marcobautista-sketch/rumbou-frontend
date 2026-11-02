import type { QuestionPresentation, SolutionStep } from '../../types/presentation'
import type { Figure } from '../../utils/figure'

// Una pregunta del banco (Geometría, fácil) para mostrar en la portada cómo se ve un ejercicio.
const figura: Figure = {
  descripcion:
    'Triángulo rectángulo ABC, recto en B. El cateto AB mide 8 y la hipotenusa AC mide 10.',
  vista: { xmin: -2, xmax: 10, ymin: -2, ymax: 8 },
  puntos: [
    { nombre: 'B', x: 0, y: 0 },
    { nombre: 'A', x: 8, y: 0 },
    { nombre: 'C', x: 0, y: 6 },
  ],
  elementos: [
    { tipo: 'poligono', puntos: ['B', 'A', 'C'] },
    { tipo: 'angulo_recto', vertice: 'B', a: 'A', b: 'C' },
    { tipo: 'etiqueta', x: -0.5, y: -0.5, texto: 'B', estilo: 'variable' },
    { tipo: 'etiqueta', x: 8.5, y: -0.5, texto: 'A', estilo: 'variable' },
    { tipo: 'etiqueta', x: -0.5, y: 6.5, texto: 'C', estilo: 'variable' },
    { tipo: 'etiqueta', x: 4, y: -0.5, texto: '8', estilo: 'normal' },
    { tipo: 'etiqueta', x: 4.5, y: 3.5, texto: '10', estilo: 'normal' },
    { tipo: 'etiqueta', x: -0.5, y: 3, texto: '?', estilo: 'destacado' },
  ],
}

export const sampleQuestion = {
  tema: 'Geometría',
  enunciado:
    'En un triángulo rectángulo ABC, recto en B, el cateto adyacente al ángulo A mide 8 cm y la hipotenusa mide 10 cm. Halle el valor de tan(A).',
  alternativas: ['3/5', '4/5', '3/4', '4/3', '5/3'],
  claveCorrecta: 2,
  presentacion: {
    enunciado:
      'En un triángulo rectángulo ABC, recto en B, el cateto adyacente al ángulo A mide $8\\ \\text{cm}$ y la hipotenusa mide $10\\ \\text{cm}$. Halle el valor de $\\tan(A)$.',
    alternativas: [
      '$\\dfrac{3}{5}$',
      '$\\dfrac{4}{5}$',
      '$\\dfrac{3}{4}$',
      '$\\dfrac{4}{3}$',
      '$\\dfrac{5}{3}$',
    ],
    figura,
  } satisfies QuestionPresentation & { figura: Figure },
  pasos: [
    {
      titulo: 'Aplica el teorema de Pitágoras',
      detalle:
        'Para hallar el cateto opuesto al ángulo $A$ (lado $BC$), usamos el teorema de Pitágoras en el triángulo rectángulo $ABC$: $$BC = \\sqrt{10^2 - 8^2} = \\sqrt{36} = 6\\ \\text{cm}$$',
      tabla: null,
    },
    {
      titulo: 'Calcula la tangente de A',
      detalle:
        'La tangente es la razón entre el cateto opuesto y el cateto adyacente al ángulo $A$. Por lo tanto: $$\\tan(A) = \\frac{BC}{AB} = \\frac{6}{8} = \\frac{3}{4}$$',
      tabla: null,
    },
  ] satisfies SolutionStep[],
}
