import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  Shield,
  ScrollText,
  UserSquare2,
  LogOut,
  Moon,
  Sun,
  MonitorSmartphone,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../../hooks/useAuth.js'
import { useTheme } from '../../context/ThemeContext.jsx'

const SIDEBAR_W = 'w-64'

const nav = [
  { to: '/dashboard', label: 'Özet', icon: LayoutDashboard },
  { to: '/users', label: 'Üyeler', icon: Users, perm: 'member.view' },
  { to: '/roles', label: 'Roller ve izinler', icon: Shield, perm: 'role.view' },
  { to: '/audit', label: 'Denetim günlüğü', icon: ScrollText, perm: 'audit.view' },
  { to: '/members', label: 'Kulüp kayıtları', icon: UserSquare2, perm: 'member.view' },
]

export default function AdminLayout() {
  const { user, logout, logoutAllDevices, hasPermission } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()

  const initials = user
    ? `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase()
    : ''

  const handleLogout = async () => {
    try {
      await logout()
      toast.success('Çıkış yapıldı')
      navigate('/login')
    } catch {
      toast.error('Çıkış başarısız')
    }
  }

  return (
    <div className="h-[100dvh] overflow-hidden flex bg-cream-100 dark:bg-navy-950">
      {/* Sabit genişlik sol menü — tek ekran */}
      <aside
        className={`hidden md:flex flex-col ${SIDEBAR_W} shrink-0 h-full bg-navy-900 text-white py-6 px-3 border-r border-red-900/40`}
      >
        <div className="flex items-center gap-3 mb-8 px-2 shrink-0">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-md shrink-0">
            <span className="font-display text-navy-900 font-bold text-sm">HU</span>
          </div>
          <div className="min-w-0">
            <div className="font-display text-lg leading-tight text-white truncate">HotoKontrol</div>
            <div className="text-[10px] uppercase tracking-widest text-red-200/90 truncate">
              Hacettepe Üniversitesi
            </div>
          </div>
        </div>

        <nav className="flex-1 min-h-0 overflow-y-auto space-y-0.5 pr-1">
          {nav.map(({ to, label, icon: Icon, perm }) => {
            if (perm && !hasPermission(perm)) return null
            return (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-red-700 text-white shadow-md'
                      : 'text-red-100/90 hover:bg-white/10 hover:text-white'
                  }`
                }
              >
                <Icon size={17} strokeWidth={1.75} className="shrink-0" />
                <span className="truncate">{label}</span>
              </NavLink>
            )
          })}
        </nav>

        <div className="border-t border-red-800/60 pt-3 mt-3 space-y-1 shrink-0">
          <div className="flex items-center gap-2 px-2 py-2 rounded-xl bg-white/5 mb-2">
            <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-950 ring-1 ring-red-500/40 flex items-center justify-center text-[10px] font-semibold text-navy-900 dark:text-white overflow-hidden shrink-0">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                initials
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-medium text-white truncate">
                {user?.firstName} {user?.lastName}
              </div>
              <div className="text-[10px] text-red-200/70 truncate">{user?.email}</div>
            </div>
          </div>
          <button
            type="button"
            onClick={toggleTheme}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-red-100/90 hover:bg-white/10 text-sm"
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            {theme === 'dark' ? 'Açık tema' : 'Koyu tema'}
          </button>
          <button
            type="button"
            onClick={() => logoutAllDevices().then(() => navigate('/login'))}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-red-100/90 hover:bg-white/10 text-sm"
          >
            <MonitorSmartphone size={16} />
            Tüm oturumlardan çık
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-red-200 hover:bg-red-950/50 text-sm"
          >
            <LogOut size={16} />
            Çıkış yap
          </button>
        </div>
      </aside>

      {/* İçerik alanı — alt sayfalar kendi PageFrame üst çubuğunu kullanır */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden">
        <main className="flex-1 min-h-0 overflow-hidden p-3 md:p-6 pb-20 md:pb-6">
          <div className="h-full min-h-0 rounded-2xl border border-zinc-200 dark:border-red-950/40 bg-white dark:bg-navy-900/80 shadow-sm overflow-hidden flex flex-col">
            <Outlet />
          </div>
        </main>
      </div>

      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white dark:bg-navy-900 border-t border-zinc-200 dark:border-red-950 flex justify-around py-2 z-30">
        {nav.slice(0, 4).map(({ to, icon: Icon, perm }) => {
          if (perm && !hasPermission(perm)) return null
          return (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `p-2 rounded-lg ${
                  isActive
                    ? 'text-red-700 dark:text-white bg-red-50 dark:bg-red-950/80'
                    : 'text-zinc-400 dark:text-red-200/60'
                }`
              }
            >
              <Icon size={22} />
            </NavLink>
          )
        })}
      </nav>
    </div>
  )
}
