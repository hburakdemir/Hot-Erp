import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth.js'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Dashboard from './pages/Dashboard.jsx'
import MemberList from './components/members/MemberList.jsx'
import AdminLayout from './components/layout/AdminLayout.jsx'
import UsersPage from './pages/admin/UsersPage.jsx'
import UserDetailPage from './pages/admin/UserDetailPage.jsx'
import UserCreatePage from './pages/admin/UserCreatePage.jsx'
import RolesPage from './pages/admin/RolesPage.jsx'
import RoleDetailPage from './pages/admin/RoleDetailPage.jsx'
import AuditLogsPage from './pages/admin/AuditLogsPage.jsx'
import RequirePermission from './components/permission/RequirePermission.jsx'

function ProtectedShell() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream-100 dark:bg-navy-950">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-navy-300 border-t-navy-700 rounded-full animate-spin" />
          <span className="text-sm text-zinc-500 font-mono">Oturum yükleniyor…</span>
        </div>
      </div>
    )
  }

  return user ? <AdminLayout /> : <Navigate to="/login" replace />
}

function GuestRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return null
  return user ? <Navigate to="/dashboard" replace /> : children
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
      <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />

      <Route element={<ProtectedShell />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route
          path="/users"
          element={
            <RequirePermission permission="member.view">
              <UsersPage />
            </RequirePermission>
          }
        />
        <Route
          path="/users/new"
          element={
            <RequirePermission permission="member.create">
              <UserCreatePage />
            </RequirePermission>
          }
        />
        <Route
          path="/users/:id"
          element={
            <RequirePermission permission="member.view">
              <UserDetailPage />
            </RequirePermission>
          }
        />
        <Route
          path="/roles"
          element={
            <RequirePermission permission="role.view">
              <RolesPage />
            </RequirePermission>
          }
        />
        <Route
          path="/roles/:id"
          element={
            <RequirePermission permission="role.view">
              <RoleDetailPage />
            </RequirePermission>
          }
        />
        <Route
          path="/audit"
          element={
            <RequirePermission permission="audit.view">
              <AuditLogsPage />
            </RequirePermission>
          }
        />
        <Route
          path="/members"
          element={
            <RequirePermission permission="member.view">
              <MemberList />
            </RequirePermission>
          }
        />
      </Route>

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
