export function Skeleton({ className = '' }) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-navy-100 dark:bg-navy-800 ${className}`}
      aria-hidden
    />
  )
}
