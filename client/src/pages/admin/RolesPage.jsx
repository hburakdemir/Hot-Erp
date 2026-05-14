import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { Shield } from 'lucide-react'
import { rolesApi } from '../../api/roles.js'
import Can from '../../components/permission/Can.jsx'
import Card from '../../components/Card.jsx'
import Button from '../../components/Button.jsx'
import Modal from '../../components/ui/Modal.jsx'
import Input from '../../components/Input.jsx'

export default function RolesPage() {
  const qc = useQueryClient()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  const { data: roles, isLoading } = useQuery({
    queryKey: ['roles'],
    queryFn: rolesApi.list,
  })

  const create = useMutation({
    mutationFn: () => rolesApi.create({ name, description }),
    onSuccess: () => {
      toast.success('Rol oluşturuldu')
      qc.invalidateQueries({ queryKey: ['roles'] })
      setOpen(false)
      setName('')
      setDescription('')
    },
    onError: (e) => toast.error(e.message),
  })

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex flex-col sm:flex-row justify-between gap-4 items-start">
        <div>
          <h1 className="font-display text-2xl md:text-3xl text-navy-900 dark:text-cream-50">
            Roller & izinler
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            Dinamik RBAC — rolleri düzenlemek için bir kayda girin
          </p>
        </div>
        <Can permission="role.create">
          <Button onClick={() => setOpen(true)}>Yeni rol</Button>
        </Can>
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {isLoading && (
          <>
            <Card className="p-6 h-28 animate-pulse bg-navy-100 dark:bg-navy-800" />
            <Card className="p-6 h-28 animate-pulse bg-navy-100 dark:bg-navy-800" />
          </>
        )}
        {(roles ?? []).map((r) => (
          <Link key={r.id} to={`/roles/${r.id}`}>
            <Card className="p-5 h-full hover:shadow-card-lg transition-shadow dark:bg-navy-900 dark:border-navy-800">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-navy-900 text-cream-50 flex items-center justify-center shrink-0">
                  <Shield size={18} />
                </div>
                <div className="min-w-0">
                  <div className="font-display text-lg text-navy-900 dark:text-cream-50 truncate">
                    {r.name}
                  </div>
                  <div className="text-xs text-zinc-500 line-clamp-2">{r.description}</div>
                  <div className="text-[11px] text-zinc-400 mt-2 font-mono line-clamp-2" title={(r.permissions ?? []).map((p) => p.key).join(', ')}>
                    {(r.permissions ?? []).length} izin
                    {(r.permissions ?? []).length > 0 && (
                      <span className="block text-zinc-500 normal-case mt-0.5">
                        {(r.permissions ?? [])
                          .slice(0, 6)
                          .map((p) => p.key)
                          .join(' · ')}
                        {(r.permissions ?? []).length > 6 ? '…' : ''}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Yeni rol">
        <div className="space-y-4">
          <Input label="Rol adı (slug)" value={name} onChange={(e) => setName(e.target.value)} />
          <Input
            label="Açıklama"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <Button className="w-full" loading={create.isPending} onClick={() => create.mutate()}>
            Oluştur
          </Button>
        </div>
      </Modal>
    </div>
  )
}
