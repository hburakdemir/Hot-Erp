import { useAuth } from '../../hooks/useAuth.js'

/**
 * Renders children only if the current user has the given permission key.
 */
export default function Can({ permission, children, fallback = null }) {
  const { hasPermission } = useAuth()
  if (!permission || hasPermission(permission)) return children
  return fallback
}
