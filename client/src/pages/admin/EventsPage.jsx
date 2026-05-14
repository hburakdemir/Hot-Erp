import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Calendar, Tag } from 'lucide-react'
import { eventsApi } from '../../api/events.js'
import PageFrame from '../../components/layout/PageFrame.jsx'
import Card from '../../components/Card.jsx'
import { Skeleton } from '../../components/ui/Skeleton.jsx'

export default function EventsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['events', { page: 1, limit: 30 }],
    queryFn: () => eventsApi.list({ page: 1, limit: 30 }),
  })

  const { data: categories, isLoading: catLoading } = useQuery({
    queryKey: ['event-categories'],
    queryFn: eventsApi.categories,
  })

  const items = data?.items ?? []
  const cats = categories ?? []

  return (
    <PageFrame
      title="Etkinlikler"
      description="Kulüp etkinlikleri; detayda katılım durumu seçebilirsiniz."
    >
      <div className="space-y-6 max-w-4xl">
        <Card className="p-4 dark:bg-navy-900 dark:border-navy-800">
          <div className="flex items-center gap-2 text-sm font-medium text-navy-900 dark:text-cream-50 mb-3">
            <Tag size={16} className="text-red-600 dark:text-red-400" />
            Etkinlik kategorileri
          </div>
          {catLoading ? (
            <Skeleton className="h-10 w-full" />
          ) : cats.length === 0 ? (
            <p className="text-sm text-zinc-500">
              Tanımlı kategori yok. Kategori eklemek için{' '}
              <span className="font-mono">event.update</span> yetkisiyle etkinlik düzenleme akışını kullanın veya
              seed/migration ile kategori oluşturun.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {cats.map((c) => (
                <span
                  key={c.id}
                  title={c.description || undefined}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border border-zinc-200 dark:border-navy-600 bg-zinc-50 dark:bg-navy-800/60 text-navy-800 dark:text-cream-100"
                  style={
                    c.color
                      ? {
                          borderColor: c.color,
                          backgroundColor: `${c.color}18`,
                        }
                      : undefined
                  }
                >
                  {c.name}
                </span>
              ))}
            </div>
          )}
        </Card>

        <div className="space-y-3">
        {isLoading ? (
          <Skeleton className="h-32 w-full" />
        ) : items.length === 0 ? (
          <Card className="p-6 text-sm text-zinc-500">Henüz etkinlik yok.</Card>
        ) : (
          items.map((ev) => (
            <Link key={ev.id} to={`/events/${ev.id}`}>
              <Card className="p-4 hover:shadow-md transition-shadow dark:bg-navy-900 dark:border-red-950/40">
                <div className="font-medium text-navy-900 dark:text-white">{ev.title}</div>
                <div className="text-xs text-zinc-500 mt-1 flex items-center gap-2 flex-wrap">
                  <Calendar size={12} />
                  {ev.startUndetermined
                    ? 'Başlangıç belirsiz'
                    : ev.startDate
                      ? new Date(ev.startDate).toLocaleString('tr-TR')
                      : '—'}
                  {ev.category?.name && (
                    <span className="px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-950 text-red-900 dark:text-red-200">
                      {ev.category.name}
                    </span>
                  )}
                  <span className="text-zinc-400">Katılım: {ev._count?.attendees ?? 0}</span>
                </div>
              </Card>
            </Link>
          ))
        )}
        </div>
      </div>
    </PageFrame>
  )
}
