export default function Button({ children, loading = false, variant = 'primary', size = 'md', className = '', disabled, ...props }) {
  const base = `
    inline-flex items-center justify-center gap-2 font-medium rounded-xl
    transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-cream-50 dark:focus:ring-offset-navy-950
    disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]
  `
  const variants = {
    primary:
      'bg-red-700 text-white hover:bg-red-800 focus:ring-red-600 shadow-sm hover:shadow dark:bg-red-600 dark:hover:bg-red-500',
    secondary:
      'bg-red-100 text-red-900 hover:bg-red-200 focus:ring-red-300 dark:bg-navy-800 dark:text-red-100 dark:hover:bg-navy-700',
    ghost:
      'text-red-800 hover:bg-red-50 focus:ring-red-300 dark:text-red-200 dark:hover:bg-navy-800',
    danger:
      'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
  }
  const sizes = {
    sm: 'text-xs px-3 py-2',
    md: 'text-sm px-4 py-3',
    lg: 'text-base px-6 py-3.5',
    full: 'text-sm px-4 py-3 w-full',
  }
  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={loading || disabled}
      {...props}
    >
      {loading ? (
        <>
          <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          <span>Lütfen bekleyin…</span>
        </>
      ) : (
        children
      )}
    </button>
  )
}
