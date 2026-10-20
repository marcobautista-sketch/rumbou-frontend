import { X } from 'lucide-react'
import { useEffect, useId, useRef, type ReactNode } from 'react'

type ModalSize = 'sm' | 'md' | 'lg'

const sizes: Record<ModalSize, string> = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
}

interface ModalProps {
  open: boolean
  title: string
  description?: string
  size?: ModalSize
  dismissible?: boolean
  footer?: ReactNode
  onClose: () => void
  children?: ReactNode
}

export function Modal({
  open,
  title,
  description,
  size = 'md',
  dismissible = true,
  footer,
  onClose,
  children,
}: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  const descriptionId = useId()

  useEffect(() => {
    const dialog = dialogRef.current
    if (open && !dialog?.open) dialog?.showModal()
    if (!open && dialog?.open) dialog.close()
  }, [open])

  const requestClose = () => {
    if (dismissible) onClose()
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      onCancel={(event) => {
        event.preventDefault()
        requestClose()
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) requestClose()
      }}
      className={`m-auto w-[calc(100%-2rem)] rounded-2xl bg-surface p-0 text-ink shadow-raised backdrop:bg-primary/60 backdrop:backdrop-blur-sm ${sizes[size]}`}
    >
      <div className="space-y-4 p-6">
        <header className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h2 id={titleId} className="text-lg font-semibold">
              {title}
            </h2>
            {description && (
              <p id={descriptionId} className="text-ink-muted">
                {description}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={requestClose}
            disabled={!dismissible}
            aria-label="Cerrar"
            className="rounded-lg p-1 text-ink-muted transition hover:bg-surface-muted hover:text-ink focus-visible:outline-2 focus-visible:outline-accent disabled:opacity-50"
          >
            <X aria-hidden className="size-5" />
          </button>
        </header>
        {children}
        {footer && <footer className="flex flex-wrap justify-end gap-3 pt-2">{footer}</footer>}
      </div>
    </dialog>
  )
}
