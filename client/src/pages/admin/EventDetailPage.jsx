import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useParams } from 'react-router-dom'
import { Calendar, ArrowLeft } from 'lucide-react'
import { eventsApi } from '../../api/events.js'
import PageFrame from '../../components/layout/PageFrame.jsx'
import Card from '../../components/Card.jsx'
import { Skeleton } from '../../components/ui/Skeleton.jsx'
import Button from '../../components/Button.jsx'
import { useAuth } from '../../hooks/useAuth.js'
import toast from 'react-hot-toast'
import api from '../../api/client.js'

export default function EventDetailPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const qc = useQueryClient()

  const { data: ev, isLoading } = useQuery({
    queryKey: ['event', id],
    queryFn: () => eventsApi.get(id),
    enabled: !!id,
  })

  const { data: statuses } = useQuery({
    queryKey: ['events', 'participation-statuses'],
    queryFn: eventsApi.participationStatuses,
  })

  const setStatus = async (participationStatusId) => {
    try {
      await api.post(`/events/${id}/participation`, { participationStatusId })
      toast.success('Katılım kaydedildi')
      await qc.invalidateQueries({ queryKey: ['event', id] })
      await qc.invalidateQueries({ queryKey: ['events'] })
    } catch (e) {
      toast.error(e.message)
    }
  }

  if (isLoading || !ev) {
    return (
      <PageFrame title="Etkinlik" description="">
        <Skeleton className="h-48 w-full max-w-2xl" />
      </PageFrame>
    )
  }

  return (
    <PageFrame
      title={ev.title}
      description={ev.description || 'Açıklama yok'}
      actions={
        <Link to="/events" className="text-sm text-red-700 dark:text-red-300 hover:underline inline-flex items-center gap-1">
          <ArrowLeft size={14} /> Listeye dön
        </Link>
      }
    >
      <div className="max-w-2xl space-y-4">
        <Card className="p-4 text-sm space-y-2 dark:bg-navy-900 dark:border-red-950/40">
          <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-300">
            <Calendar size={16} />
            {ev.startUndetermined ? 'Başlangıç belirsiz' : ev.startDate ? new Date(ev.startDate).toLocaleString('tr-TR') : '—'}
            {' → '}
            {ev.endUndetermined ? 'Bitiş belirsiz' : ev.endDate ? new Date(ev.endDate).toLocaleString('tr-TR') : '—'}
          </div>
          {ev.location && <div className="text-zinc-500">Yer: {ev.location}</div>}
          {ev.category && (
            <div>
              <span className="text-xs px-2 py-1 rounded-full bg-red-100 dark:bg-red-950">{ev.category.name}</span>
            </div>
          )}
        </Card>

        <Card className="p-4 dark:bg-navy-900 dark:border-red-950/40">
          <div className="text-sm font-medium text-navy-900 dark:text-white mb-3">Katılım durumun</div>
          <div className="flex flex-wrap gap-2">
            {(statuses ?? []).map((s) => (
              <Button
                key={s.id}
                type="button"
                size="sm"
                variant="secondary"
                style={{
                  color: s.color || undefined,
                  fontWeight: s.fontWeight || undefined,
                  fontStyle: s.fontStyle || undefined,
                }}
                onClick={() => setStatus(s.id)}
              >
                {s.label}
              </Button>
            ))}
          </div>
          <p className="text-xs text-zinc-500 mt-3">Oturum: {user?.email}</p>
        </Card>
      </div>
    </PageFrame>
  )
}
