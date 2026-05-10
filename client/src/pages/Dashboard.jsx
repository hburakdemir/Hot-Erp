import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Users, Shield, ScrollText, TrendingUp } from 'lucide-react'
import { usersApi } from '../api/users.js'
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

  const totalMembers = userStats?.pagination?.total ?? '—'

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

        <Card className="p-6 dark:bg-navy-900 dark:border-red-950/50">
          <h2 className="font-display text-lg text-navy-900 dark:text-white mb-2">Güvenlik ve oturum</h2>
          <p className="text-sm text-zinc-600 dark:text-red-100/80 leading-relaxed">
            Oturum bilgileriniz güvenli çerezlerle saklanır; erişim jetonu kısa ömürlüdür. Yetkiler sunucuda her
            istekte güncellenir. Çıkış veya «tüm oturumlardan çık» ile diğer cihazlardaki oturumlar sonlandırılabilir.
          </p>
        </Card>
      </div>
    </PageFrame>
  )
}
