import { useQuery } from '@tanstack/react-query'
import { announcementsApi } from '../../api/announcements.js'
import PageFrame from '../../components/layout/PageFrame.jsx'
import Card from '../../components/Card.jsx'
import { Skeleton } from '../../components/ui/Skeleton.jsx'

export default function AnnouncementsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['announcements', { page: 1, limit: 20 }],
    queryFn: () => announcementsApi.list({ page: 1, limit: 20 }),
  })

  const items = data?.items ?? []

  return (
    <PageFrame title="Duyurular" description="Topluluk duyuruları (liste)." >
      <div className="space-y-3 max-w-3xl">
        {isLoading ? (
          <Skeleton className="h-24 w-full" />
        ) : items.length === 0 ? (
          <Card className="p-6 text-sm text-zinc-500">Duyuru yok.</Card>
        ) : (
          items.map((a) => (
            <Card key={a.id} className="p-4 dark:bg-navy-900 dark:border-red-950/40">
              <div className="font-medium text-navy-900 dark:text-white">{a.title}</div>
              <p className="text-sm text-zinc-600 dark:text-zinc-300 mt-2 line-clamp-4 whitespace-pre-wrap">{a.content}</p>
              <div className="text-xs text-zinc-400 mt-2">
                {new Date(a.createdAt).toLocaleString('tr-TR')}
              </div>
            </Card>
          ))
        )}
      </div>
    </PageFrame>
  )
}
