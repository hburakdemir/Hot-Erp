import { Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from './hooks/useAuth.js'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Dashboard from './pages/Dashboard.jsx'
import DeactivePage from './pages/DeactivePage.jsx'
import MemberList from './components/members/MemberList.jsx'
import AdminLayout from './components/layout/AdminLayout.jsx'
import UsersPage from './pages/admin/UsersPage.jsx'
import UserDetailPage from './pages/admin/UserDetailPage.jsx'
import UserCreatePage from './pages/admin/UserCreatePage.jsx'
import RolesPage from './pages/admin/RolesPage.jsx'
import RoleDetailPage from './pages/admin/RoleDetailPage.jsx'
import AuditLogsPage from './pages/admin/AuditLogsPage.jsx'
import EventsPage from './pages/admin/EventsPage.jsx'
import EventDetailPage from './pages/admin/EventDetailPage.jsx'
import MeetingsPage from './pages/admin/MeetingsPage.jsx'
import AnnouncementsPage from './pages/admin/AnnouncementsPage.jsx'
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

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}

function FullPortalLayout() {
  const { user } = useAuth()
  const location = useLocation()

  if (user?.portalDeactivated) {
    return <Navigate to="/deactive" replace state={{ from: location }} />
  }

  return <AdminLayout />
}

function DeactiveGate() {
  const { user } = useAuth()
  if (!user?.portalDeactivated) {
    return <Navigate to="/dashboard" replace />
  }
  return <DeactivePage />
}

function GuestRoute({ children }) {
  const { user, loading } = useAuth()
  const location = useLocation()
  if (loading) return null
  if (!user) return children
  if (user.portalDeactivated) {
    return <Navigate to="/deactive" replace state={{ from: location }} />
  }
  return <Navigate to="/dashboard" replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
      <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />

      <Route element={<ProtectedShell />}>
        <Route path="/deactive" element={<DeactiveGate />} />

        <Route element={<FullPortalLayout />}>
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
            path="/announcements"
            element={
              <RequirePermission permission="announcement.view">
                <AnnouncementsPage />
              </RequirePermission>
            }
          />
          <Route
            path="/events"
            element={
              <RequirePermission permission="event.view">
                <EventsPage />
              </RequirePermission>
            }
          />
          <Route
            path="/events/:id"
            element={
              <RequirePermission permission="event.view">
                <EventDetailPage />
              </RequirePermission>
            }
          />
          <Route
            path="/meetings"
            element={
              <RequirePermission permission="meeting.view">
                <MeetingsPage />
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
      </Route>

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
