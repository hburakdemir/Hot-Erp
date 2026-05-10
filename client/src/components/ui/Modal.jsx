import { useEffect } from 'react'
import { X } from 'lucide-react'

export default function Modal({ open, onClose, title, children, size = 'md' }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose?.()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  const width =
    size === 'lg' ? 'max-w-2xl' : size === 'sm' ? 'max-w-md' : 'max-w-lg'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-navy-950/60 backdrop-blur-sm"
        aria-label="Kapat"
        onClick={onClose}
      />
      <div
        className={`relative w-full ${width} rounded-2xl bg-white dark:bg-navy-900 shadow-card-lg border border-zinc-100 dark:border-navy-700 max-h-[90vh] overflow-hidden flex flex-col`}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100 dark:border-navy-700 shrink-0">
          <h2 className="font-display text-lg text-navy-900 dark:text-cream-50">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-zinc-500 hover:bg-navy-50 dark:hover:bg-navy-800"
          >
            <X size={18} />
          </button>
        </div>
        <div className="overflow-y-auto px-5 py-4">{children}</div>
      </div>
    </div>
  )
}
