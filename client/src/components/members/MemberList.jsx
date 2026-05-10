import { useState, useEffect, useCallback } from 'react'
import {
  Users, Search, Filter, Plus, Check, X,
  ChevronLeft, ChevronRight,
  RefreshCw, AlertCircle, Clock,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { memberService } from '../../services/authService.js'
import Button from '../Button.jsx'
import Card from '../Card.jsx'
import PageFrame from '../layout/PageFrame.jsx'

// Durum badge renkleri - her durum icin farkli renk kombinasyonu
const STATUS_CONFIG = {
  pending: { label: 'Beklemede', bg: 'bg-amber-100', text: 'text-amber-800', dot: 'bg-amber-500' },
  approved: { label: 'Onaylı', bg: 'bg-emerald-100', text: 'text-emerald-800', dot: 'bg-emerald-500' },
  rejected: { label: 'Reddedildi', bg: 'bg-red-100', text: 'text-red-800', dot: 'bg-red-500' },
  suspended: { label: 'Askıda', bg: 'bg-zinc-100', text: 'text-zinc-700', dot: 'bg-zinc-400' },
}

// Durum badge bileseni - kucuk, renkli etiket
function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  )
}

// Uye satirinin iskelet yukleme animasyonu - veri gelmeden once gosterilir
function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      {[...Array(6)].map((_, i) => (
        <td key={i} className="px-4 py-4">
          <div className="h-4 bg-red-100 dark:bg-red-950/40 rounded" />
        </td>
      ))}
    </tr>
  )
}

// Bos durum bileseni - veri yoksa gosterilir
function EmptyState({ message, onReset }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-14 h-14 bg-red-50 dark:bg-red-950/50 rounded-2xl flex items-center justify-center mb-4">
        <Users size={24} className="text-red-400" />
      </div>
      <p className="text-zinc-600 dark:text-red-100/80 font-medium mb-1">{message}</p>
      <p className="text-zinc-400 dark:text-red-200/60 text-sm mb-4">Filtreleri değiştirmeyi deneyin</p>
      {onReset && (
        <Button variant="secondary" size="sm" onClick={onReset}>
          <RefreshCw size={13} /> Filtreleri Temizle
        </Button>
      )}
    </div>
  )
}

export default function MemberList() {
  // Sayfa durumu
  const [members,  setMembers]  = useState([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState(null)
  const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0, totalPages: 1 })

  // Filtre durumu - arama, durum ve sayfa
  const [search,     setSearch]     = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  // Arama kutusunda yazarken her tusa basin istek atmamak icin debounce uygula
  // 400ms bekler, sonra state'i gunceller -> useEffect tetiklenir
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400)
    return () => clearTimeout(timer)
  }, [search])

  // Uyeleri API'dan getir - filtreler veya sayfa degisince tekrar cagrilir
  const fetchMembers = useCallback(async (page = 1) => {
    setLoading(true)
    setError(null)
    try {
      const params = { page, limit: pagination.limit }
      if (statusFilter)    params.status = statusFilter
      // Not: backend'de arama parametresi henuz yok, ileride eklenebilir
      const { data } = await memberService.getAll(params)
      setMembers(data.data?.members   ?? [])
      setPagination((prev) => ({ ...prev, ...data.data?.pagination, page }))
    } catch (err) {
      setError(err.message || 'Üyeler yüklenemedi')
      toast.error('Üyeler yüklenirken bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }, [statusFilter, pagination.limit])

  // statusFilter veya debounced arama degisince 1. sayfadan baslat
  useEffect(() => {
    fetchMembers(1)
  }, [statusFilter, debouncedSearch])

  // Uye durumunu guncelle - onay, red, askiya alma
  const handleStatusChange = async (memberId, newStatus) => {
    try {
      await memberService.update(memberId, { status: newStatus })
      toast.success(`Üye durumu «${STATUS_CONFIG[newStatus]?.label}» olarak güncellendi`)
      // Sadece o satiri guncelle - tum listeyi yeniden cekme
      setMembers((prev) =>
        prev.map((m) => m.id === memberId ? { ...m, status: newStatus } : m)
      )
    } catch (err) {
      toast.error(err.message || 'Durum guncellenemedi')
    }
  }

  // Uye sil - onay sonrasi API cagrisi
  const handleDelete = async (memberId) => {
    if (!window.confirm('Bu üye kaydını silmek istediğinize emin misiniz?')) return
    try {
      await memberService.remove(memberId)
      toast.success('Üye kaydı silindi')
      setMembers((prev) => prev.filter((m) => m.id !== memberId))
      setPagination((prev) => ({ ...prev, total: prev.total - 1 }))
    } catch (err) {
      toast.error(err.message || 'Uye silinemedi')
    }
  }

  // Istemci tarafinda arama filtreleme (backend'e gitmeden)
  const filteredMembers = members.filter((m) => {
    if (!debouncedSearch) return true
    const q = debouncedSearch.toLowerCase()
    return (
      m.user?.firstName?.toLowerCase().includes(q) ||
      m.user?.lastName?.toLowerCase().includes(q)  ||
      m.user?.email?.toLowerCase().includes(q)      ||
      m.club?.name?.toLowerCase().includes(q)
    )
  })

  return (
    <PageFrame
      title="Kulüp üyelik kayıtları"
      description={`Toplam ${pagination.total} kayıt — Hacettepe öğrenci topluluğu`}
      actions={
        <Button size="md" className="gap-2">
          <Plus size={15} /> Yeni kayıt
        </Button>
      }
    >
      <div className="max-w-7xl space-y-4 animate-fade-up">
          {/* Filtre bar */}
          <Card className="p-4 mb-5 animate-fade-up animation-delay-100">
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Arama kutusu */}
              <div className="relative flex-1">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Ad, e-posta veya kulüp ara…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="input-base pl-10 text-sm"
                />
              </div>

              {/* Durum filtresi */}
              <div className="relative">
                <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="input-base pl-9 pr-8 text-sm appearance-none w-full sm:w-44"
                >
                  <option value="">Tüm durumlar</option>
                  {Object.entries(STATUS_CONFIG).map(([val, cfg]) => (
                    <option key={val} value={val}>{cfg.label}</option>
                  ))}
                </select>
              </div>

              {/* Yenile */}
              <Button
                variant="secondary" size="md"
                onClick={() => fetchMembers(pagination.page)}
                className="gap-1.5 shrink-0"
              >
                <RefreshCw size={14} />
              </Button>
            </div>
          </Card>

          {/* Hata mesaji */}
          {error && (
            <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm mb-5">
              <AlertCircle size={16} className="shrink-0" />
              {error}
              <button onClick={() => fetchMembers(pagination.page)} className="ml-auto underline underline-offset-2">
                Tekrar dene
              </button>
            </div>
          )}

          {/* Tablo */}
          <Card className="overflow-hidden animate-fade-up animation-delay-200">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-zinc-100 bg-cream-50">
                    {['Üye', 'E-posta', 'Üniversite / bölüm', 'Kulüp', 'Durum', 'İşlemler'].map((th) => (
                      <th key={th} className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                        {th}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy-50">
                  {loading ? (
                    // Yukleme iskelet animasyonu
                    [...Array(8)].map((_, i) => <SkeletonRow key={i} />)
                  ) : filteredMembers.length === 0 ? (
                    <tr>
                      <td colSpan={6}>
                        <EmptyState
                          message={search || statusFilter ? 'Filtreye uygun üye bulunamadı' : 'Henüz üye kaydı yok'}
                          onReset={search || statusFilter ? () => { setSearch(''); setStatusFilter('') } : null}
                        />
                      </td>
                    </tr>
                  ) : (
                    filteredMembers.map((member) => (
                      <tr key={member.id} className="hover:bg-cream-50 transition-colors">
                        {/* Ad - soyad + kullanici adi */}
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-navy-100 rounded-full flex items-center justify-center text-xs font-semibold text-navy-700 shrink-0">
                              {member.user?.firstName?.[0]}{member.user?.lastName?.[0]}
                            </div>
                            <div>
                              <div className="text-sm font-medium text-navy-900">
                                {member.user?.firstName} {member.user?.lastName}
                              </div>
                              <div className="text-xs text-zinc-400">@{member.user?.username}</div>
                            </div>
                          </div>
                        </td>

                        {/* E-posta */}
                        <td className="px-4 py-4">
                          <span className="text-sm text-navy-700">{member.user?.email}</span>
                        </td>

                        {/* Universite bilgileri */}
                        <td className="px-4 py-4">
                          <div className="text-sm text-navy-700">{member.user?.university || '-'}</div>
                          {member.user?.department && (
                            <div className="text-xs text-zinc-400">{member.user.department}</div>
                          )}
                        </td>

                        {/* Kulup adi */}
                        <td className="px-4 py-4">
                          <div className="text-sm text-navy-800 font-medium">{member.club?.name}</div>
                          <div className="text-xs text-zinc-400">{member.role}</div>
                        </td>

                        {/* Durum */}
                        <td className="px-4 py-4">
                          <StatusBadge status={member.status} />
                          {member.joinedAt && (
                            <div className="text-xs text-zinc-400 mt-1 flex items-center gap-1">
                              <Clock size={10} />
                              {new Date(member.joinedAt).toLocaleDateString('tr-TR')}
                            </div>
                          )}
                        </td>

                        {/* Islem butonlari */}
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-1.5">
                            {/* Bekleyen uyeler icin hizli onay / red butonlari */}
                            {member.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleStatusChange(member.id, 'approved')}
                                  className="w-7 h-7 rounded-lg bg-green-100 text-green-700 hover:bg-green-200 flex items-center justify-center transition-colors"
                                  title="Onayla"
                                >
                                  <Check size={13} strokeWidth={2.5} />
                                </button>
                                <button
                                  onClick={() => handleStatusChange(member.id, 'rejected')}
                                  className="w-7 h-7 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 flex items-center justify-center transition-colors"
                                  title="Reddet"
                                >
                                  <X size={13} strokeWidth={2.5} />
                                </button>
                              </>
                            )}
                            {/* Onaylanmis uyeyi askiya alma */}
                            {member.status === 'approved' && (
                              <button
                                onClick={() => handleStatusChange(member.id, 'suspended')}
                                className="text-xs px-2.5 py-1 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                              >
                                Askıya al
                              </button>
                            )}
                            {/* Askiyadaki veya reddedilmis uyeyi tekrar onayla */}
                            {(member.status === 'suspended' || member.status === 'rejected') && (
                              <button
                                onClick={() => handleStatusChange(member.id, 'approved')}
                                className="text-xs px-2.5 py-1 rounded-lg bg-green-100 text-green-700 hover:bg-green-200 transition-colors"
                              >
                                Yeniden onayla
                              </button>
                            )}
                            {/* Sil butonu her zaman gozukur */}
                            <button
                              onClick={() => handleDelete(member.id)}
                              className="w-7 h-7 rounded-lg bg-cream-200 text-zinc-500 hover:bg-red-100 hover:text-red-600 flex items-center justify-center transition-colors"
                              title="Sil"
                            >
                              <X size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Sayfalama */}
            {pagination.totalPages > 1 && (
              <div className="border-t border-zinc-100 px-4 py-3 flex items-center justify-between">
                <span className="text-xs text-zinc-500">
                  {((pagination.page - 1) * pagination.limit) + 1} -{' '}
                  {Math.min(pagination.page * pagination.limit, pagination.total)} / {pagination.total} üye
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => fetchMembers(pagination.page - 1)}
                    disabled={pagination.page <= 1}
                    className="w-8 h-8 rounded-lg border border-zinc-200 flex items-center justify-center text-zinc-600 hover:bg-cream-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <span className="text-xs font-medium text-navy-700 min-w-[60px] text-center">
                    {pagination.page} / {pagination.totalPages}
                  </span>
                  <button
                    onClick={() => fetchMembers(pagination.page + 1)}
                    disabled={pagination.page >= pagination.totalPages}
                    className="w-8 h-8 rounded-lg border border-zinc-200 flex items-center justify-center text-zinc-600 hover:bg-cream-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </Card>
      </div>
    </PageFrame>
  )
}
