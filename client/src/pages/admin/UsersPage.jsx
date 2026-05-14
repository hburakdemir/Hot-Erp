import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Search, LayoutGrid, Table2, MoreHorizontal } from 'lucide-react'
import toast from 'react-hot-toast'
import { usersApi } from '../../api/users.js'
import { rolesApi } from '../../api/roles.js'
import Can from '../../components/permission/Can.jsx'
import Card from '../../components/Card.jsx'
import Button from '../../components/Button.jsx'
import { Skeleton } from '../../components/ui/Skeleton.jsx'
import PageFrame from '../../components/layout/PageFrame.jsx'
import { useAuth } from '../../hooks/useAuth.js'

const EMP_LABEL = {
  ACTIVE: 'Görevde',
  ON_LEAVE: 'İzinli',
  PROBATION: 'Deneme süresi',
  TERMINATED: 'Ayrılmış',
}

const ALL_COLUMN_IDS = [
  'id',
  'avatar',
  'fullName',
  'email',
  'username',
  'phone',
  'university',
  'faculty',
  'department',
  'year',
  'roles',
  'employmentStatus',
  'isActive',
  'registrationStatus',
  'approvedAt',
  'approvedBy',
  'portalDeactivated',
  'createdAt',
  'updatedAt',
]

const COLUMN_LABELS = {
  id: 'Kayıt no',
  avatar: 'Avatar',
  fullName: 'Ad soyad',
  email: 'E-posta',
  username: 'Kullanıcı adı',
  phone: 'Telefon',
  university: 'Üniversite',
  faculty: 'Fakülte',
  department: 'Bölüm',
  year: 'Sınıf / yıl',
  roles: 'Roller',
  employmentStatus: 'İstihdam',
  isActive: 'Hesap',
  registrationStatus: 'Onay',
  approvedAt: 'Onay tarihi',
  approvedBy: 'Onaylayan',
  portalDeactivated: 'Portal pasif',
  createdAt: 'Kayıt tarihi',
  updatedAt: 'Güncelleme',
}

const DEFAULT_COLUMNS = [
  'id',
  'avatar',
  'fullName',
  'email',
  'username',
  'faculty',
  'department',
  'university',
  'phone',
  'year',
  'roles',
  'employmentStatus',
  'isActive',
  'createdAt',
]

const DEFAULT_WIDTH = {
  id: 220,
  avatar: 72,
  fullName: 200,
  email: 220,
  username: 130,
  phone: 120,
  university: 160,
  faculty: 160,
  department: 140,
  year: 88,
  roles: 200,
  employmentStatus: 120,
  isActive: 100,
  registrationStatus: 100,
  approvedAt: 120,
  approvedBy: 140,
  portalDeactivated: 100,
  createdAt: 112,
  updatedAt: 112,
}

function statusBadge(emp, active) {
  if (!active)
    return (
      <span className="px-2 py-0.5 rounded-full text-xs bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200">
        Hesap kapalı
      </span>
    )
  const map = {
    ACTIVE: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200',
    ON_LEAVE: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200',
    PROBATION: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200',
    TERMINATED: 'bg-zinc-200 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200',
  }
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs ${map[emp] || map.ACTIVE}`}>
      {EMP_LABEL[emp] ?? emp}
    </span>
  )
}

function ResizableTh({ colId, label, width, onResizeStart }) {
  return (
    <th
      className="relative px-2 py-3 text-left text-xs uppercase tracking-wide text-zinc-500 align-top group bg-navy-50 dark:bg-navy-800/80 border-b border-zinc-200 dark:border-navy-700"
      style={{ width, minWidth: 48 }}
    >
      <div className="pr-2">{label}</div>
      <button
        type="button"
        aria-label={`${label} sütun genişliği`}
        onMouseDown={(e) => onResizeStart(e, colId)}
        className="absolute right-0 top-0 bottom-0 w-1.5 cursor-col-resize hover:bg-red-400/80 z-10"
      />
    </th>
  )
}

export default function UsersPage() {
  const { refetchProfile, hasPermission } = useAuth()
  const qc = useQueryClient()
  const [view, setView] = useState(() =>
    typeof window !== 'undefined' && window.innerWidth < 768 ? 'cards' : 'table'
  )
  const [search, setSearch] = useState('')
  const [roleId, setRoleId] = useState('')
  const [employmentStatus, setEmploymentStatus] = useState('')
  const [isActive, setIsActive] = useState('')
  const [registrationStatus, setRegistrationStatus] = useState('')
  const [portalFilter, setPortalFilter] = useState('')
  const [selectedIds, setSelectedIds] = useState(() => new Set())

  const [columns, setColumns] = useState(() => [...DEFAULT_COLUMNS])
  const [colWidths, setColWidths] = useState({})
  const [columnMenuOpen, setColumnMenuOpen] = useState(false)
  const prefsHydrated = useRef(false)

  const { data: prefs, isSuccess: prefsReady } = useQuery({
    queryKey: ['ui-prefs', 'members'],
    queryFn: usersApi.getMyUiPreferences,
  })

  useEffect(() => {
    if (!prefsReady || prefsHydrated.current) return
    const c = prefs?.membersTable?.columns
    if (Array.isArray(c) && c.length > 0) {
      const valid = c.filter((id) => ALL_COLUMN_IDS.includes(id))
      if (valid.length) setColumns(valid)
    }
    prefsHydrated.current = true
  }, [prefsReady, prefs])

  const bulkApprove = useMutation({
    mutationFn: (userIds) => usersApi.bulkApproveRegistration(userIds),
    onSuccess: (res) => {
      toast.success(`${res.updated} üye onaylandı`)
      setSelectedIds(new Set())
      qc.invalidateQueries({ queryKey: ['users'] })
    },
    onError: (e) => toast.error(e.message),
  })

  const bulkPortal = useMutation({
    mutationFn: ({ userIds, portalDeactivated }) => usersApi.bulkSetPortalDeactivated(userIds, portalDeactivated),
    onSuccess: (res) => {
      toast.success(`${res.updated} hesap güncellendi`)
      setSelectedIds(new Set())
      qc.invalidateQueries({ queryKey: ['users'] })
    },
    onError: (e) => toast.error(e.message),
  })

  const patchPrefs = useMutation({
    mutationFn: (body) => usersApi.patchMyUiPreferences(body),
    onSuccess: async () => {
      toast.success('Kolon tercihleri kaydedildi')
      await qc.invalidateQueries({ queryKey: ['ui-prefs', 'members'] })
      await refetchProfile?.()
    },
    onError: (e) => toast.error(e.message),
  })

  const saveColumnPrefs = () => {
    const valid = columns.filter((id) => ALL_COLUMN_IDS.includes(id))
    if (valid.length === 0) {
      toast.error('En az bir kolon seçin')
      return
    }
    patchPrefs.mutate({ membersTable: { columns: valid } })
    setColumnMenuOpen(false)
  }

  const onResizeStart = useCallback((e, colId) => {
    e.preventDefault()
    const startX = e.clientX
    const startW = colWidths[colId] ?? DEFAULT_WIDTH[colId] ?? 120
    const onMove = (ev) => {
      const nw = Math.max(48, startW + ev.clientX - startX)
      setColWidths((w) => ({ ...w, [colId]: nw }))
    }
    const onUp = () => {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
    }
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
  }, [colWidths])

  const toggleColumn = (id) => {
    setColumns((prev) => {
      if (prev.includes(id)) {
        if (prev.length <= 1) {
          toast.error('En az bir kolon kalmalı')
          return prev
        }
        return prev.filter((x) => x !== id)
      }
      return [...prev, id]
    })
  }

  const queryParams = useMemo(
    () => ({
      page,
      limit: 12,
      search: search.trim() || undefined,
      roleId: roleId || undefined,
      employmentStatus: employmentStatus || undefined,
      isActive: isActive || undefined,
      registrationStatus: registrationStatus || undefined,
      portalDeactivated: portalFilter || undefined,
      sortBy,
      sortOrder,
    }),
    [page, search, roleId, employmentStatus, isActive, registrationStatus, portalFilter, sortBy, sortOrder]
  )

  const { data, isLoading, isFetching, isError, error, refetch } = useQuery({
    queryKey: ['users', queryParams],
    queryFn: () => usersApi.list(queryParams),
    placeholderData: (prev) => prev,
  })

  useEffect(() => {
    if (isError) toast.error(error?.message || 'Üye listesi yüklenemedi')
  }, [isError, error])

  const { data: roles } = useQuery({
    queryKey: ['roles'],
    queryFn: rolesApi.list,
  })

  const users = data?.users ?? []
  const pagination = data?.pagination
  const canBulk = hasPermission('member.update')

  const toggleSelect = (id) => {
    setSelectedIds((prev) => {
      const n = new Set(prev)
      if (n.has(id)) n.delete(id)
      else n.add(id)
      return n
    })
  }

  const allOnPageSelected = users.length > 0 && users.every((u) => selectedIds.has(u.id))

  const toggleSelectAllPage = () => {
    const idsOnPage = users.map((u) => u.id)
    setSelectedIds((prev) => {
      const allSel = idsOnPage.length > 0 && idsOnPage.every((id) => prev.has(id))
      const n = new Set(prev)
      if (allSel) idsOnPage.forEach((id) => n.delete(id))
      else idsOnPage.forEach((id) => n.add(id))
      return n
    })
  }

  const renderCell = (colId, u) => {
    switch (colId) {
      case 'id':
        return (
          <Link to={`/users/${u.id}`} className="font-mono text-[11px] text-red-800 dark:text-red-300 hover:underline block truncate" title={u.id}>
            {u.id}
          </Link>
        )
      case 'avatar':
        return (
          <img
            src={u.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.username}`}
            alt=""
            className="w-9 h-9 rounded-full bg-navy-100 shrink-0"
          />
        )
      case 'fullName':
        return (
          <Link to={`/users/${u.id}`} className="font-medium text-navy-900 dark:text-white hover:underline block truncate">
            {u.firstName} {u.lastName}
          </Link>
        )
      case 'email':
        return <span className="text-zinc-600 dark:text-zinc-300 truncate block">{u.email}</span>
      case 'username':
        return <span className="font-mono text-xs text-zinc-500 truncate block">@{u.username}</span>
      case 'phone':
        return <span className="text-zinc-600 dark:text-zinc-300">{u.phone ?? '—'}</span>
      case 'university':
        return <span className="truncate block">{u.university ?? '—'}</span>
      case 'faculty':
        return <span className="truncate block">{u.faculty ?? '—'}</span>
      case 'department':
        return <span className="truncate block">{u.department ?? '—'}</span>
      case 'year':
        return <span>{u.year ?? '—'}</span>
      case 'roles':
        return (
          <div className="flex flex-wrap gap-1">
            {(u.roles ?? []).map((r) => (
              <span
                key={r.id}
                className="text-[10px] px-1.5 py-0.5 rounded bg-navy-900/90 text-white dark:bg-red-900/80"
              >
                {r.name}
              </span>
            ))}
          </div>
        )
      case 'employmentStatus':
        return statusBadge(u.employmentStatus, u.isActive)
      case 'isActive':
        return <span className="text-xs">{u.isActive ? 'Açık' : 'Kapalı'}</span>
      case 'registrationStatus':
        return (
          <span
            className={`text-[11px] px-2 py-0.5 rounded-full ${
              u.registrationStatus === 'APPROVED'
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40'
                : 'bg-amber-100 text-amber-900 dark:bg-amber-900/40'
            }`}
          >
            {u.registrationStatus === 'APPROVED' ? 'Onaylı' : 'Bekliyor'}
          </span>
        )
      case 'approvedAt':
        return (
          <span className="text-xs text-zinc-500 whitespace-nowrap">
            {u.approvedAt ? new Date(u.approvedAt).toLocaleString('tr-TR') : '—'}
          </span>
        )
      case 'approvedBy':
        return (
          <span className="text-xs truncate block">
            {u.approvedBy ? `${u.approvedBy.firstName} ${u.approvedBy.lastName}` : '—'}
          </span>
        )
      case 'portalDeactivated':
        return (
          <span className={`text-xs ${u.portalDeactivated ? 'text-amber-700 dark:text-amber-300' : 'text-zinc-500'}`}>
            {u.portalDeactivated ? 'Pasif' : 'Aktif'}
          </span>
        )
      case 'createdAt':
        return <span className="text-xs text-zinc-500 whitespace-nowrap">{new Date(u.createdAt).toLocaleString('tr-TR')}</span>
      case 'updatedAt':
        return <span className="text-xs text-zinc-500 whitespace-nowrap">{new Date(u.updatedAt).toLocaleString('tr-TR')}</span>
      default:
        return null
    }
  }

  return (
    <PageFrame
      title="Üyeler"
      description="Tüm kullanıcı alanları API’den gelir; kolonları veritabanında saklanan tercihinize göre seçin. Sütun genişliği yalnızca bu oturumda geçerlidir."
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <Can permission="member.update">
            {selectedIds.size > 0 && (
              <>
                <Button
                  type="button"
                  size="sm"
                  loading={bulkApprove.isPending}
                  onClick={() => bulkApprove.mutate([...selectedIds])}
                >
                  Onayla ({selectedIds.size})
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  loading={bulkPortal.isPending}
                  onClick={() => bulkPortal.mutate({ userIds: [...selectedIds], portalDeactivated: true })}
                >
                  Pasifleştir
                </Button>
              </>
            )}
          </Can>
          <div className="relative">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="gap-1"
              onClick={() => setColumnMenuOpen((o) => !o)}
            >
              <MoreHorizontal size={16} />
              Kolonlar
            </Button>
            {columnMenuOpen && (
              <>
                <button
                  type="button"
                  className="fixed inset-0 z-40 cursor-default"
                  aria-label="Kapat"
                  onClick={() => setColumnMenuOpen(false)}
                />
                <div className="absolute right-0 top-full mt-1 z-50 w-64 max-h-72 overflow-y-auto rounded-xl border border-zinc-200 dark:border-red-950/60 bg-white dark:bg-navy-900 shadow-card-lg p-3 text-sm">
                  <div className="text-xs font-semibold text-zinc-500 mb-2">Görünür kolonlar</div>
                  <div className="space-y-2">
                    {ALL_COLUMN_IDS.map((id) => (
                      <label key={id} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={columns.includes(id)}
                          onChange={() => toggleColumn(id)}
                          className="rounded border-zinc-300"
                        />
                        <span>{COLUMN_LABELS[id]}</span>
                      </label>
                    ))}
                  </div>
                  <div className="flex gap-2 mt-3 pt-2 border-t border-zinc-200 dark:border-navy-700">
                    <Button type="button" size="sm" className="flex-1" loading={patchPrefs.isPending} onClick={saveColumnPrefs}>
                      Kaydet
                    </Button>
                    <Button type="button" variant="secondary" size="sm" onClick={() => setColumnMenuOpen(false)}>
                      Kapat
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
          <Can permission="member.create">
            <Link to="/users/new">
              <Button size="sm">Yeni üye</Button>
            </Link>
          </Can>
        </div>
      }
    >
      <Card className="p-3 md:p-4 space-y-3 dark:bg-navy-900/60 dark:border-red-950/30 border-0 shadow-none rounded-none h-full flex flex-col min-h-0">
        <div className="flex flex-col xl:flex-row gap-2 xl:items-center xl:justify-between shrink-0">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
            <input
              className="w-full pl-10 pr-3 py-2 rounded-xl border border-zinc-200 dark:border-navy-700 bg-white dark:bg-navy-950 text-sm text-navy-900 dark:text-white"
              placeholder="İsim, e-posta, telefon, fakülte…"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
            />
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            <select
              value={roleId}
              onChange={(e) => {
                setRoleId(e.target.value)
                setPage(1)
              }}
              className="rounded-xl border border-zinc-200 dark:border-navy-700 bg-white dark:bg-navy-950 text-sm px-2 py-2"
            >
              <option value="">Tüm roller</option>
              {(roles ?? []).map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
            <select
              value={employmentStatus}
              onChange={(e) => {
                setEmploymentStatus(e.target.value)
                setPage(1)
              }}
              className="rounded-xl border border-zinc-200 dark:border-navy-700 bg-white dark:bg-navy-950 text-sm px-2 py-2"
            >
              <option value="">İstihdam</option>
              {[
                ['ACTIVE', 'Görevde'],
                ['ON_LEAVE', 'İzinli'],
                ['PROBATION', 'Deneme süresi'],
                ['TERMINATED', 'Ayrılmış'],
              ].map(([val, label]) => (
                <option key={val} value={val}>
                  {label}
                </option>
              ))}
            </select>
            <select
              value={isActive}
              onChange={(e) => {
                setIsActive(e.target.value)
                setPage(1)
              }}
              className="rounded-xl border border-zinc-200 dark:border-navy-700 bg-white dark:bg-navy-950 text-sm px-2 py-2"
            >
              <option value="">Hesap</option>
              <option value="true">Aktif</option>
              <option value="false">Kapalı</option>
            </select>
            <select
              value={registrationStatus}
              onChange={(e) => {
                setRegistrationStatus(e.target.value)
                setPage(1)
              }}
              className="rounded-xl border border-zinc-200 dark:border-navy-700 bg-white dark:bg-navy-950 text-sm px-2 py-2"
            >
              <option value="">Kayıt onayı</option>
              <option value="APPROVED">Onaylı</option>
              <option value="PENDING">Bekliyor</option>
            </select>
            <select
              value={portalFilter}
              onChange={(e) => {
                setPortalFilter(e.target.value)
                setPage(1)
              }}
              className="rounded-xl border border-zinc-200 dark:border-navy-700 bg-white dark:bg-navy-950 text-sm px-2 py-2"
            >
              <option value="">Portal</option>
              <option value="true">Pasif</option>
              <option value="false">Aktif</option>
            </select>
            <select
              value={`${sortBy}:${sortOrder}`}
              onChange={(e) => {
                const [sb, so] = e.target.value.split(':')
                setSortBy(sb)
                setSortOrder(so)
                setPage(1)
              }}
              className="rounded-xl border border-zinc-200 dark:border-navy-700 bg-white dark:bg-navy-950 text-sm px-2 py-2 max-w-[200px]"
            >
              <option value="createdAt:desc">Kayıt (önce yeni)</option>
              <option value="createdAt:asc">Kayıt (önce eski)</option>
              <option value="lastName:asc">Soyad A-Z</option>
              <option value="firstName:asc">Ad A-Z</option>
              <option value="email:asc">E-posta A-Z</option>
              <option value="username:asc">Kullanıcı adı A-Z</option>
              <option value="department:asc">Bölüm A-Z</option>
              <option value="faculty:asc">Fakülte A-Z</option>
              <option value="university:asc">Üniversite A-Z</option>
              <option value="updatedAt:desc">Güncelleme (önce yeni)</option>
            </select>
            <div className="flex rounded-xl border border-zinc-200 dark:border-navy-700 overflow-hidden">
              <button
                type="button"
                className={`p-2 ${view === 'table' ? 'bg-navy-900 text-white' : 'bg-white dark:bg-navy-950 text-zinc-600'}`}
                onClick={() => setView('table')}
                aria-label="Tablo"
              >
                <Table2 size={18} />
              </button>
              <button
                type="button"
                className={`p-2 ${view === 'cards' ? 'bg-navy-900 text-white' : 'bg-white dark:bg-navy-950 text-zinc-600'}`}
                onClick={() => setView('cards')}
                aria-label="Kartlar"
              >
                <LayoutGrid size={18} />
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 min-h-0 flex flex-col">
          {isError ? (
            <div className="rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50/80 dark:bg-red-950/30 p-4 text-sm text-red-900 dark:text-red-100 space-y-2">
              <p>Üye listesi alınamadı: {error?.message ?? 'Bilinmeyen hata'}</p>
              <Button type="button" size="sm" variant="secondary" onClick={() => refetch()}>
                Tekrar dene
              </Button>
            </div>
          ) : isLoading && !data ? (
            <div className="space-y-3 p-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-48 w-full" />
            </div>
          ) : view === 'table' ? (
            <div className="overflow-auto rounded-xl border border-zinc-100 dark:border-navy-800 flex-1 min-h-0">
              <table className="text-sm w-max min-w-full table-fixed border-collapse">
                <thead>
                  <tr>
                    {canBulk && (
                      <th className="w-10 px-2 py-3 text-left align-middle bg-navy-50 dark:bg-navy-800/80 border-b border-zinc-200 dark:border-navy-700">
                        <input
                          type="checkbox"
                          className="rounded border-zinc-400"
                          checked={allOnPageSelected}
                          onChange={toggleSelectAllPage}
                          aria-label="Sayfadakilerin tümünü seç"
                        />
                      </th>
                    )}
                    {columns.map((colId) => (
                      <ResizableTh
                        key={colId}
                        colId={colId}
                        label={COLUMN_LABELS[colId] ?? colId}
                        width={colWidths[colId] ?? DEFAULT_WIDTH[colId] ?? 120}
                        onResizeStart={onResizeStart}
                      />
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-navy-800">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-red-50/40 dark:hover:bg-navy-800/50">
                      {canBulk && (
                        <td className="px-2 py-2 align-middle w-10">
                          <input
                            type="checkbox"
                            className="rounded border-zinc-400"
                            checked={selectedIds.has(u.id)}
                            onChange={() => toggleSelect(u.id)}
                            aria-label="Satır seç"
                          />
                        </td>
                      )}
                      {columns.map((colId) => (
                        <td
                          key={colId}
                          className="px-2 py-2 align-middle overflow-hidden text-ellipsis"
                          style={{ width: colWidths[colId] ?? DEFAULT_WIDTH[colId] ?? 120, maxWidth: colWidths[colId] ?? DEFAULT_WIDTH[colId] ?? 400 }}
                        >
                          <div className="min-w-0">{renderCell(colId, u)}</div>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3 overflow-auto flex-1 min-h-0 p-1">
              {users.map((u) => (
                <Link key={u.id} to={`/users/${u.id}`}>
                  <Card className="p-4 h-full hover:shadow-card-lg transition-shadow dark:bg-navy-900 dark:border-red-950/30">
                    <div className="flex gap-3 mb-2">
                      <img
                        src={u.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.username}`}
                        alt=""
                        className="w-12 h-12 rounded-xl object-cover shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="font-medium text-navy-900 dark:text-white truncate">
                          {u.firstName} {u.lastName}
                        </div>
                        <div className="text-xs text-zinc-500 truncate">{u.email}</div>
                        {statusBadge(u.employmentStatus, u.isActive)}
                      </div>
                    </div>
                    <div className="text-xs text-zinc-500 space-y-0.5">
                      <div>{u.faculty ?? '—'} / {u.department ?? '—'}</div>
                      <div>{u.university ?? '—'}</div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}

          {pagination && pagination.totalPages > 1 && (
            <div className="flex justify-between items-center pt-2 text-sm text-zinc-600 shrink-0 border-t border-zinc-100 dark:border-navy-800 mt-2">
              <span>
                Toplam {pagination.total} {isFetching ? '· güncelleniyor…' : ''}
              </span>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Önceki
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  disabled={page >= pagination.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Sonraki
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>
    </PageFrame>
  )
}
