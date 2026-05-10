/**
 * Her ekranın kendi üst çubuğu — sol ana menü sabit, içerik bu çerçevede kayar.
 */
export default function PageFrame({ title, description, actions = null, children }) {
  return (
    <div className="flex flex-col h-full min-h-0 p-4 md:p-6">
      <header className="shrink-0 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 pb-4 border-b border-zinc-200 dark:border-red-950/50 mb-4">
        <div className="min-w-0">
          {title && (
            <h1 className="font-display text-xl md:text-2xl text-navy-900 dark:text-white truncate">
              {title}
            </h1>
          )}
          {description && (
            <p className="text-sm text-zinc-500 dark:text-red-100/70 mt-0.5">{description}</p>
          )}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2 shrink-0">{actions}</div>}
      </header>
      <div className="flex-1 min-h-0 overflow-auto">{children}</div>
    </div>
  )
}
