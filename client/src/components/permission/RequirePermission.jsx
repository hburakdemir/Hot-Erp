import { Navigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth.js'

export default function RequirePermission({ permission, children }) {
  const { hasPermission, loading } = useAuth()
  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-zinc-500">
        Yetkiler yükleniyor…
      </div>
    )
  }
  if (!permission || hasPermission(permission)) return children
  return <Navigate to="/dashboard" replace />
}
