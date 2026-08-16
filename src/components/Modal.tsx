import { useEffect, useId, useRef, type ReactNode } from 'react'

type ModalProps = {
  open: boolean
  title: string
  onClose: () => void
  children: ReactNode
}

export function Modal({ open, title, onClose, children }: ModalProps) {
  const titleId = useId()
  const dialogRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const previouslyFocused = document.activeElement as HTMLElement | null
    const frame = window.requestAnimationFrame(() => {
      const focusable = dialogRef.current?.querySelector<HTMLElement>(
        'input, select, textarea, button',
      )
      focusable?.focus()
    })

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.cancelAnimationFrame(frame)
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousOverflow
      previouslyFocused?.focus()
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
      <button
        type="button"
        aria-label="Fechar"
        className="absolute inset-0 bg-stone-900/45 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 flex max-h-[92svh] w-full max-w-md flex-col rounded-t-2xl border border-stone-200 bg-white shadow-xl sm:rounded-2xl"
      >
        <header className="flex items-center justify-between gap-3 border-b border-stone-100 px-4 py-3 sm:px-5">
          <h2 id={titleId} className="font-display text-lg font-semibold text-stone-900">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex size-9 items-center justify-center rounded-lg text-xl text-stone-500 transition hover:bg-stone-100 hover:text-stone-800"
            aria-label="Fechar modal"
          >
            ×
          </button>
        </header>
        <div className="overflow-y-auto px-4 py-4 sm:px-5 sm:py-5">{children}</div>
      </div>
    </div>
  )
}
