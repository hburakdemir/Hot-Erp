import { useQuery } from '@tanstack/react-query'
import { Calendar } from 'lucide-react'
import { meetingsApi } from '../../api/meetings.js'
import PageFrame from '../../components/layout/PageFrame.jsx'
import Card from '../../components/Card.jsx'
import { Skeleton } from '../../components/ui/Skeleton.jsx'

export default function MeetingsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['meetings', { page: 1, limit: 30 }],
    queryFn: () => meetingsApi.list({ page: 1, limit: 30 }),
  })

  const items = data?.items ?? []

  return (
    <PageFrame title="Toplantılar" description="Kulüp toplantı kayıtları (salt liste)." >
      <div className="space-y-3 max-w-4xl">
        {isLoading ? (
          <Skeleton className="h-32 w-full" />
        ) : items.length === 0 ? (
          <Card className="p-6 text-sm text-zinc-500">Henüz toplantı yok.</Card>
        ) : (
          items.map((m) => (
            <Card key={m.id} className="p-4 dark:bg-navy-900 dark:border-red-950/40">
              <div className="font-medium text-navy-900 dark:text-white">{m.title}</div>
              <div className="text-xs text-zinc-500 mt-1 flex items-center gap-2">
                <Calendar size={12} />
                {m.startUndetermined ? 'Başlangıç belirsiz' : m.startDate ? new Date(m.startDate).toLocaleString('tr-TR') : '—'}
                {m.category?.name && (
                  <span className="px-2 py-0.5 rounded-full bg-navy-100 dark:bg-navy-800 text-xs">{m.category.name}</span>
                )}
              </div>
            </Card>
          ))
        )}
      </div>
    </PageFrame>
  )
}
