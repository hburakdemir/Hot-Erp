export default function Card({ children, className = '' }) {
  return (
    <div
      className={`bg-white dark:bg-navy-900 rounded-2xl shadow-card border border-zinc-100 dark:border-red-950/40 ${className}`}
    >
      {children}
    </div>
  )
}
