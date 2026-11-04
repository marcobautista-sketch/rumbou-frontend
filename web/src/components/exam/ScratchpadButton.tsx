import { PenLine } from 'lucide-react'
import { useState } from 'react'
import type { QuestionPresentation } from '../../types/presentation'
import { readScratch, saveScratch } from '../../utils/scratchpad'
import { QuestionStatement } from '../questions/QuestionStatement'
import { Button } from '../ui/Button'
import { Modal } from '../ui/Modal'
import { Scratchpad } from './Scratchpad'

interface ScratchpadButtonProps {
  // Agrupa las pizarras de un mismo simulacro o desafío, para borrarlas juntas al terminar.
  scope: string
  question: { preguntaId: number; enunciado: string; presentacion?: QuestionPresentation | null }
  position?: number
}

// Botón "Pizarra" de cada pregunta: abre una hoja de borrador con el enunciado a la vista. La
// hoja es solo para el postulante; cada pregunta guarda la suya mientras resuelve.
export function ScratchpadButton({ scope, question, position }: ScratchpadButtonProps) {
  const [open, setOpen] = useState(false)
  const [hasNotes, setHasNotes] = useState(() => readScratch(scope, question.preguntaId).length > 0)

  return (
    <>
      <Button variant="secondary" size="sm" onClick={() => setOpen(true)} aria-haspopup="dialog">
        <PenLine aria-hidden className="size-4" />
        Pizarra
        {hasNotes && (
          <span className="size-2 rounded-full bg-accent">
            <span className="sr-only">(con apuntes)</span>
          </span>
        )}
      </Button>
      <Modal
        open={open}
        title={position ? `Pizarra · pregunta ${position}` : 'Pizarra'}
        description="Tu hoja de borrador para resolver. Solo la ves tú y queda guardada en esta pregunta mientras resuelves."
        size="xl"
        onClose={() => setOpen(false)}
        footer={<Button onClick={() => setOpen(false)}>Volver a la pregunta</Button>}
      >
        {open && (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,17rem)_minmax(0,1fr)]">
            <div className="max-h-40 overflow-y-auto rounded-xl bg-surface-muted p-4 text-sm leading-relaxed lg:max-h-[62vh]">
              <QuestionStatement question={question} />
            </div>
            <Scratchpad
              initialStrokes={readScratch(scope, question.preguntaId)}
              onChange={(strokes) => {
                saveScratch(scope, question.preguntaId, strokes)
                setHasNotes(strokes.length > 0)
              }}
            />
          </div>
        )}
      </Modal>
    </>
  )
}
