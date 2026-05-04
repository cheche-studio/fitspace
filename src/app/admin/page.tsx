'use client'

import { useEffect, useState, useCallback } from 'react'

type PaymentStatus = 'pending' | 'confirmed' | 'rejected'
type PaymentMethod = 'card' | 'transfer' | 'cash'

interface Registration {
  id: string
  created_at: string
  full_name: string
  email: string
  phone: string
  payment_method: PaymentMethod
  discount_code: string | null
  amount_paid: number
  payment_status: PaymentStatus
  notes: string | null
}

const STATUS_LABELS: Record<PaymentStatus, string> = {
  pending: 'Pendiente',
  confirmed: 'Confirmado',
  rejected: 'Rechazado',
}

const STATUS_STYLES: Record<PaymentStatus, string> = {
  pending: 'bg-amber-50 text-amber-700 border border-amber-200',
  confirmed: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  rejected: 'bg-red-50 text-red-600 border border-red-200',
}

const METHOD_LABELS: Record<PaymentMethod, string> = {
  card: 'Tarjeta',
  transfer: 'Transferencia',
  cash: 'Efectivo',
}

export default function BellyDanceAdmin() {
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<PaymentStatus | 'all'>('all')
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [notesModal, setNotesModal] = useState<{ id: string; current: string } | null>(null)
  const [notesDraft, setNotesDraft] = useState('')
  const [search, setSearch] = useState('')

  const fetchRegistrations = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/registrations')
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Error al cargar')
      setRegistrations(json.registrations || [])
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchRegistrations()
  }, [fetchRegistrations])

  const updateStatus = async (id: string, payment_status: PaymentStatus) => {
    setUpdatingId(id)
    try {
      const res = await fetch('/api/admin/registrations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, payment_status }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      setRegistrations(prev =>
        prev.map(r => (r.id === id ? { ...r, payment_status } : r))
      )
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Error al actualizar')
    } finally {
      setUpdatingId(null)
    }
  }

  const saveNotes = async () => {
    if (!notesModal) return
    setUpdatingId(notesModal.id)
    try {
      const res = await fetch('/api/admin/registrations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: notesModal.id, notes: notesDraft }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      setRegistrations(prev =>
        prev.map(r => (r.id === notesModal.id ? { ...r, notes: notesDraft } : r))
      )
      setNotesModal(null)
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Error al guardar nota')
    } finally {
      setUpdatingId(null)
    }
  }

  const filtered = registrations.filter(r => {
    const matchFilter = filter === 'all' || r.payment_status === filter
    const matchSearch =
      search === '' ||
      r.full_name.toLowerCase().includes(search.toLowerCase()) ||
      r.email.toLowerCase().includes(search.toLowerCase()) ||
      (r.phone || '').includes(search)
    return matchFilter && matchSearch
  })

  const counts = {
    all: registrations.length,
    pending: registrations.filter(r => r.payment_status === 'pending').length,
    confirmed: registrations.filter(r => r.payment_status === 'confirmed').length,
    rejected: registrations.filter(r => r.payment_status === 'rejected').length,
  }

  const totalConfirmed = registrations
    .filter(r => r.payment_status === 'confirmed')
    .reduce((sum, r) => sum + (r.amount_paid || 0), 0)

  const formatDate = (iso: string) => {
    const d = new Date(iso)
    return d.toLocaleDateString('es-MX', {
      day: '2-digit', month: 'short', year: 'numeric',
    }) + ' · ' + d.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <div className="bg-white border-b border-stone-200 px-6 py-5">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-stone-400 uppercase tracking-widest mb-1 font-medium">
                Che' Che' Studio · Admin
              </p>
              <h1 className="text-xl font-semibold text-stone-800">
                Belly Dance — Inscripciones
              </h1>
              <p className="text-sm text-stone-500 mt-0.5">
                Sábados 11:30am · Cupo máx. 12
              </p>
            </div>
            <button
              onClick={fetchRegistrations}
              className="text-sm text-stone-500 hover:text-stone-800 border border-stone-200 rounded-lg px-3 py-1.5 transition-colors"
            >
              ↻ Actualizar
            </button>
          </div>

          {/* Summary cards */}
          <div className="grid grid-cols-4 gap-3 mt-5">
            <div className="bg-stone-50 rounded-xl p-4 border border-stone-100">
              <p className="text-xs text-stone-400 mb-1">Total inscritas</p>
              <p className="text-2xl font-semibold text-stone-800">{counts.all}</p>
              <p className="text-xs text-stone-400">de 12 lugares</p>
            </div>
            <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
              <p className="text-xs text-amber-600 mb-1">Pago pendiente</p>
              <p className="text-2xl font-semibold text-amber-700">{counts.pending}</p>
              <p className="text-xs text-amber-500">por confirmar</p>
            </div>
            <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
              <p className="text-xs text-emerald-600 mb-1">Confirmadas</p>
              <p className="text-2xl font-semibold text-emerald-700">{counts.confirmed}</p>
              <p className="text-xs text-emerald-500">pago verificado</p>
            </div>
            <div className="bg-stone-50 rounded-xl p-4 border border-stone-100">
              <p className="text-xs text-stone-400 mb-1">Recaudado</p>
              <p className="text-2xl font-semibold text-stone-800">
                ${totalConfirmed.toLocaleString('es-MX')}
              </p>
              <p className="text-xs text-stone-400">MXN confirmado</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters + search */}
      <div className="max-w-6xl mx-auto px-6 py-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex gap-2">
            {(['all', 'pending', 'confirmed', 'rejected'] as const).map(s => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                  filter === s
                    ? 'bg-stone-800 text-white border-stone-800'
                    : 'bg-white text-stone-600 border-stone-200 hover:border-stone-400'
                }`}
              >
                {s === 'all' ? 'Todas' : STATUS_LABELS[s]}
                <span className={`ml-1.5 text-xs ${filter === s ? 'opacity-70' : 'opacity-50'}`}>
                  {counts[s]}
                </span>
              </button>
            ))}
          </div>
          <input
            type="text"
            placeholder="Buscar por nombre, email o teléfono…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 border border-stone-200 rounded-lg px-3 py-1.5 text-sm bg-white text-stone-800 placeholder-stone-400 focus:outline-none focus:border-stone-400"
          />
        </div>
      </div>

      {/* Table */}
      <div className="max-w-6xl mx-auto px-6 pb-12">
        {loading ? (
          <div className="text-center py-16 text-stone-400 text-sm">Cargando inscripciones…</div>
        ) : error ? (
          <div className="text-center py-16 text-red-500 text-sm">{error}</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-stone-400 text-sm">No hay inscripciones con este filtro.</div>
        ) : (
          <div className="space-y-2">
            {filtered.map(reg => (
              <div
                key={reg.id}
                className="bg-white rounded-xl border border-stone-100 px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-4"
              >
                {/* Alumna info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-stone-800 text-sm">{reg.full_name}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLES[reg.payment_status]}`}>
                      {STATUS_LABELS[reg.payment_status]}
                    </span>
                    {reg.discount_code && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-violet-50 text-violet-600 border border-violet-200 font-medium">
                        {reg.discount_code}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-stone-400 mt-0.5">
                    {reg.email} · {reg.phone}
                  </p>
                  <p className="text-xs text-stone-400 mt-0.5">
                    {METHOD_LABELS[reg.payment_method]} ·{' '}
                    <span className="text-stone-600 font-medium">
                      ${(reg.amount_paid || 0).toLocaleString('es-MX')} MXN
                    </span>
                    {' · '}{formatDate(reg.created_at)}
                  </p>
                  {reg.notes && (
                    <p className="text-xs text-stone-500 mt-1 bg-stone-50 rounded px-2 py-1 border border-stone-100">
                      📝 {reg.notes}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => {
                      setNotesModal({ id: reg.id, current: reg.notes || '' })
                      setNotesDraft(reg.notes || '')
                    }}
                    className="text-xs text-stone-400 hover:text-stone-700 border border-stone-200 rounded-lg px-3 py-1.5 transition-colors bg-white"
                  >
                    Nota
                  </button>
                  {reg.payment_status !== 'confirmed' && (
                    <button
                      disabled={updatingId === reg.id}
                      onClick={() => updateStatus(reg.id, 'confirmed')}
                      className="text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg px-3 py-1.5 transition-colors disabled:opacity-50"
                    >
                      {updatingId === reg.id ? '…' : '✓ Confirmar'}
                    </button>
                  )}
                  {reg.payment_status !== 'rejected' && (
                    <button
                      disabled={updatingId === reg.id}
                      onClick={() => updateStatus(reg.id, 'rejected')}
                      className="text-xs text-red-500 hover:text-red-700 border border-stone-200 hover:border-red-200 rounded-lg px-3 py-1.5 transition-colors disabled:opacity-50 bg-white"
                    >
                      Rechazar
                    </button>
                  )}
                  {reg.payment_status !== 'pending' && (
                    <button
                      disabled={updatingId === reg.id}
                      onClick={() => updateStatus(reg.id, 'pending')}
                      className="text-xs text-amber-600 hover:text-amber-800 border border-stone-200 hover:border-amber-200 rounded-lg px-3 py-1.5 transition-colors disabled:opacity-50 bg-white"
                    >
                      Pendiente
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Notes modal */}
      {notesModal && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
          onClick={e => { if (e.target === e.currentTarget) setNotesModal(null) }}
        >
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h2 className="font-semibold text-stone-800 mb-3 text-base">Agregar nota interna</h2>
            <textarea
              autoFocus
              value={notesDraft}
              onChange={e => setNotesDraft(e.target.value)}
              rows={4}
              placeholder="Ej: Pagó en efectivo el sábado 20/04, recibo enviado por WhatsApp…"
              className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm text-stone-700 placeholder-stone-400 focus:outline-none focus:border-stone-400 resize-none"
            />
            <div className="flex gap-2 mt-4 justify-end">
              <button
                onClick={() => setNotesModal(null)}
                className="px-4 py-2 text-sm text-stone-500 hover:text-stone-800 border border-stone-200 rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={saveNotes}
                disabled={updatingId === notesModal.id}
                className="px-4 py-2 text-sm font-medium bg-stone-800 text-white rounded-xl hover:bg-stone-700 transition-colors disabled:opacity-50"
              >
                {updatingId === notesModal.id ? 'Guardando…' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
