import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from 'recharts'
import { Users, Shield, ScrollText, TrendingUp, PieChart as PieChartIcon } from 'lucide-react'
import { usersApi } from '../api/users.js'
import { dashboardApi } from '../api/dashboard.js'
import { useAuth } from '../hooks/useAuth.js'
import Card from '../components/Card.jsx'
import Can from '../components/permission/Can.jsx'
import PageFrame from '../components/layout/PageFrame.jsx'

export default function Dashboard() {
  const { user, hasPermission } = useAuth()

  const { data: userStats } = useQuery({
    queryKey: ['users', { page: 1, limit: 1 }],
    queryFn: () => usersApi.list({ page: 1, limit: 1 }),
    enabled: hasPermission('member.view'),
  })

  const { data: dash } = useQuery({
    queryKey: ['dashboard', 'summary'],
    queryFn: dashboardApi.summary,
    enabled: hasPermission('member.view') || hasPermission('event.view'),
  })

  const totalMembers = userStats?.pagination?.total ?? '—'

  const facultyChart =
    hasPermission('member.view') && dash?.membersByFaculty?.length
      ? dash.membersByFaculty.map((r) => ({
          label: r.label.length > 18 ? `${r.label.slice(0, 18)}…` : r.label,
          count: r.count,
        }))
      : []

  const roleChart =
    hasPermission('member.view') && dash?.membersByRole?.length
      ? dash.membersByRole.map((r) => ({
          label: r.roleName.length > 16 ? `${r.roleName.slice(0, 16)}…` : r.roleName,
          count: r.count,
        }))
      : []

  const eventCatChart =
    hasPermission('event.view') && dash?.eventsByCategory?.length
      ? dash.eventsByCategory.map((r) => ({
          label: (r.label || '—').length > 14 ? `${(r.label || '').slice(0, 14)}…` : r.label || '—',
          count: r.count,
        }))
      : []

  return (
    <PageFrame
      title={`Merhaba, ${user?.firstName ?? 'üye'}`}
      description={
        user?.faculty && user?.department
          ? `${user.faculty} • ${user.department}`
          : 'Hacettepe Üniversitesi öğrenci topluluğu'
      }
    >
      <div className="space-y-6 max-w-6xl">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-5 dark:bg-navy-900 dark:border-red-950/50">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-navy-900 text-white flex items-center justify-center dark:bg-red-700">
                <Users size={18} />
              </div>
              <TrendingUp size={14} className="text-red-500" />
            </div>
            <div className="font-display text-3xl text-navy-900 dark:text-white">{totalMembers}</div>
            <div className="text-xs text-zinc-500 dark:text-red-100/70 mt-1">Kayıtlı üye</div>
            <Can permission="member.view">
              <Link
                to="/users"
                className="text-xs text-red-700 dark:text-red-300 mt-3 inline-block hover:underline"
              >
                Üye listesine git →
              </Link>
            </Can>
          </Card>

          <Can permission="role.view">
            <Link to="/roles">
              <Card className="p-5 h-full hover:shadow-card-lg transition-shadow dark:bg-navy-900 dark:border-red-950/50">
                <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-950 flex items-center justify-center mb-3">
                  <Shield className="text-navy-900 dark:text-red-200" size={18} />
                </div>
                <div className="font-display text-lg text-navy-900 dark:text-white">Roller ve izinler</div>
                <div className="text-xs text-zinc-500 dark:text-red-100/70 mt-1">Dinamik RBAC yönetimi</div>
              </Card>
            </Link>
          </Can>

          <Can permission="audit.view">
            <Link to="/audit">
              <Card className="p-5 h-full hover:shadow-card-lg transition-shadow dark:bg-navy-900 dark:border-red-950/50">
                <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-950 flex items-center justify-center mb-3">
                  <ScrollText className="text-navy-900 dark:text-red-200" size={18} />
                </div>
                <div className="font-display text-lg text-navy-900 dark:text-white">Denetim günlüğü</div>
                <div className="text-xs text-zinc-500 dark:text-red-100/70 mt-1">Kritik işlem kayıtları</div>
              </Card>
            </Link>
          </Can>

          <Card className="p-5 dark:bg-navy-900 dark:border-red-950/50">
            <div className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-red-200/60 mb-2">
              Rol rozetleri
            </div>
            <div className="flex flex-wrap gap-1">
              {(user?.roles ?? []).map((r) => (
                <span
                  key={r.id ?? r.name}
                  className="text-[11px] px-2 py-1 rounded-full bg-navy-900 text-white dark:bg-red-800 dark:text-white"
                >
                  {r.name}
                </span>
              ))}
            </div>
          </Card>
        </div>

        {(facultyChart.length > 0 || roleChart.length > 0 || eventCatChart.length > 0) && (
          <div className="grid lg:grid-cols-2 gap-4">
            {facultyChart.length > 0 && (
              <Card className="p-5 dark:bg-navy-900 dark:border-red-950/50">
                <h2 className="font-display text-sm font-semibold text-navy-900 dark:text-white mb-3 flex items-center gap-2">
                  <PieChartIcon size={16} className="text-red-600" />
                  Fakülte dağılımı
                </h2>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={facultyChart} margin={{ top: 8, right: 8, left: 0, bottom: 40 }}>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis dataKey="label" tick={{ fontSize: 10 }} interval={0} angle={-25} textAnchor="end" height={60} />
                      <YAxis allowDecimals={false} width={32} />
                      <Tooltip />
                      <Bar dataKey="count" name="Üye" fill="#991b1b" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            )}

            {roleChart.length > 0 && (
              <Card className="p-5 dark:bg-navy-900 dark:border-red-950/50">
                <h2 className="font-display text-sm font-semibold text-navy-900 dark:text-white mb-3">
                  Rol başına üye
                </h2>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={roleChart} layout="vertical" margin={{ top: 8, right: 16, left: 8, bottom: 8 }}>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis type="number" allowDecimals={false} />
                      <YAxis type="category" dataKey="label" width={100} tick={{ fontSize: 10 }} />
                      <Tooltip />
                      <Bar dataKey="count" name="Üye" fill="#0f172a" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            )}

            {eventCatChart.length > 0 && (
              <Card className="p-5 dark:bg-navy-900 dark:border-red-950/50 lg:col-span-2">
                <h2 className="font-display text-sm font-semibold text-navy-900 dark:text-white mb-3">
                  Etkinlikler — kategori sayıları
                </h2>
                <div className="h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={eventCatChart}>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="count" name="Etkinlik" fill="#b45309" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            )}
          </div>
        )}

        <Card className="p-6 dark:bg-navy-900 dark:border-red-950/50">
          <h2 className="font-display text-lg text-navy-900 dark:text-white mb-2">Güvenlik ve oturum</h2>
          <p className="text-sm text-zinc-600 dark:text-red-100/80 leading-relaxed">
            Oturum bilgileriniz yalnızca HTTPOnly çerezlerde tutulur; tarayıcıda erişim/refresh jetonu saklanmaz. Yetkiler
            sunucuda her istekte güncellenir. Pasif hesaplarda panel API’leri kapatılır; çıkış ile oturum sonlanır.
          </p>
        </Card>
      </div>
    </PageFrame>
  )
}
