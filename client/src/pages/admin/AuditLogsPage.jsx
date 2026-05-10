import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { auditApi } from '../../api/audit.js'
import Card from '../../components/Card.jsx'

export default function AuditLogsPage() {
  const [page, setPage] = useState(1)
  const [action, setAction] = useState('')
  const [entityType, setEntityType] = useState('')

  const params = useMemo(
    () => ({
      page,
      limit: 25,
      action: action.trim() || undefined,
      entityType: entityType.trim() || undefined,
      sortOrder: 'desc',
    }),
    [page, action, entityType]
  )

  const { data, isLoading } = useQuery({
    queryKey: ['audit', params],
    queryFn: () => auditApi.list(params),
  })

  const items = data?.items ?? []
  const pagination = data?.pagination

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h1 className="font-display text-2xl md:text-3xl text-navy-900 dark:text-cream-50">
          Denetim kayıtları
        </h1>
        <p className="text-sm text-zinc-500 mt-1">
          Kritik işlemler — filtreleyerek inceleyin
        </p>
      </div>

      <Card className="p-4 dark:bg-navy-900 dark:border-navy-800 flex flex-wrap gap-3">
        <input
          className="rounded-xl border border-zinc-200 dark:border-navy-700 px-3 py-2 text-sm bg-white dark:bg-navy-950 flex-1 min-w-[140px]"
          placeholder="Aksiyon içerir…"
          value={action}
          onChange={(e) => {
            setAction(e.target.value)
            setPage(1)
          }}
        />
        <input
          className="rounded-xl border border-zinc-200 dark:border-navy-700 px-3 py-2 text-sm bg-white dark:bg-navy-950 flex-1 min-w-[140px]"
          placeholder="Varlık tipi…"
          value={entityType}
          onChange={(e) => {
            setEntityType(e.target.value)
            setPage(1)
          }}
        />
      </Card>

      <Card className="overflow-hidden dark:bg-navy-900 dark:border-navy-800">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-navy-50 dark:bg-navy-800 text-left text-xs uppercase text-zinc-500">
              <tr>
                <th className="px-4 py-3">Zaman</th>
                <th className="px-4 py-3">Aksiyon</th>
                <th className="px-4 py-3">Varlık</th>
                <th className="px-4 py-3 hidden lg:table-cell">Oyuncu</th>
                <th className="px-4 py-3 hidden xl:table-cell">IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-100 dark:divide-navy-800">
              {isLoading && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-zinc-400">
                    Yükleniyor…
                  </td>
                </tr>
              )}
              {!isLoading &&
                items.map((row) => (
                  <tr key={row.id} className="hover:bg-navy-50/80 dark:hover:bg-navy-800/30">
                    <td className="px-4 py-3 whitespace-nowrap text-xs text-zinc-500">
                      {new Date(row.createdAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">{row.action}</td>
                    <td className="px-4 py-3">
                      <span className="text-navy-700 dark:text-cream-200">{row.entityType}</span>
                      {row.entityId && (
                        <span className="block text-[10px] text-zinc-400 truncate max-w-[180px]">
                          {row.entityId}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-xs">
                      {row.actor
                        ? `${row.actor.firstName} ${row.actor.lastName}`
                        : '—'}
                    </td>
                    <td className="px-4 py-3 hidden xl:table-cell text-xs font-mono text-zinc-400">
                      {row.ipAddress ?? '—'}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        {pagination && pagination.totalPages > 1 && (
          <div className="flex justify-between items-center px-4 py-3 border-t border-zinc-100 dark:border-navy-800 text-sm">
            <span>Sayfa {pagination.page} / {pagination.totalPages}</span>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={page <= 1}
                className="px-3 py-1 rounded-lg bg-navy-100 dark:bg-navy-800 disabled:opacity-40"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Önceki
              </button>
              <button
                type="button"
                disabled={page >= pagination.totalPages}
                className="px-3 py-1 rounded-lg bg-navy-100 dark:bg-navy-800 disabled:opacity-40"
                onClick={() => setPage((p) => p + 1)}
              >
                Sonraki
              </button>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
