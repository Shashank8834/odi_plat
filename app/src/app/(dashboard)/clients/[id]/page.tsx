'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import PipelineStepper from '@/components/PipelineStepper'
import StatusPill from '@/components/StatusPill'
import {
  STAGES,
  STAGE_OPTIONS,
  STATUS_LABELS,
  INVOICE_STATUS_OPTIONS,
  PAYMENT_STATUS_OPTIONS,
  FURTHER_WORK_OPTIONS,
  BANK_OPTIONS,
} from '@/lib/constants'

interface Note {
  id: string
  content: string
  author: string | null
  createdAt: string
}

interface StatusLog {
  id: string
  field: string
  oldValue: string | null
  newValue: string | null
  changedBy: string | null
  timestamp: string
}

interface Invoice {
  id: string
  invoiceNo: string | null
  amount: number | null
  status: string
  paymentDate: string | null
  createdAt: string
}

interface Client {
  id: string
  serialNo: number
  name: string
  partner: string | null
  llpStatus: string | null
  odiStatus: string | null
  indianBankStatus: string | null
  indianBankName: string | null
  foreignBankStatus: string | null
  companyStatus: string | null
  fcgprStatus: string | null
  shareCertStatus: string | null
  form3Status: string | null
  billingEntity: string | null
  invoiceStatus: string | null
  invoiceNo: string | null
  paymentStatus: string | null
  furtherWork: string | null
  notes: string | null
  createdAt: string
  updatedAt: string
  invoices: Invoice[]
  statusLogs: StatusLog[]
  clientNotes: Note[]
}

const FIELD_LABELS: Record<string, string> = {
  llpStatus: 'LLP Status',
  odiStatus: 'ODI Status',
  indianBankStatus: 'Indian Bank Status',
  indianBankName: 'Indian Bank Name',
  foreignBankStatus: 'Foreign Bank Status',
  companyStatus: 'Company Status',
  fcgprStatus: 'FCGPR Status',
  shareCertStatus: 'Share Certificate',
  form3Status: 'Form 3 Filing',
  billingEntity: 'Billing Entity',
  invoiceStatus: 'Invoice Status',
  invoiceNo: 'Invoice No',
  paymentStatus: 'Payment Status',
  furtherWork: 'Further Work',
  name: 'Client Name',
  partner: 'Partner',
  notes: 'Notes',
  CLIENT_CREATED: 'Client Created',
  MIGRATION: 'Imported from Excel',
}

function timeAgo(dateStr: string) {
  const d = new Date(dateStr)
  const now = new Date()
  const diff = Math.floor((now.getTime() - d.getTime()) / 1000)
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function ClientDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [client, setClient] = useState<Client | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [tab, setTab] = useState<'overview' | 'activity' | 'notes'>('overview')
  const [noteText, setNoteText] = useState('')
  const [noteLoading, setNoteLoading] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [form, setForm] = useState<Partial<Client>>({})
  const [deleteConfirm, setDeleteConfirm] = useState(false)

  const fetchClient = useCallback(async () => {
    const res = await fetch(`/api/clients/${id}`)
    if (!res.ok) { router.push('/clients'); return }
    const data = await res.json()
    setClient(data)
    setForm(data)
    setLoading(false)
  }, [id, router])

  useEffect(() => { fetchClient() }, [fetchClient])

  const handleSave = async () => {
    setSaving(true)
    const { invoices, statusLogs, clientNotes, ...payload } = form as any
    await fetch(`/api/clients/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    await fetchClient()
    setEditMode(false)
    setSaving(false)
  }

  const handleStageChange = async (field: string, value: string) => {
    const res = await fetch(`/api/clients/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [field]: value }),
    })
    if (res.ok) {
      await fetchClient()
    }
  }

  const handleAddNote = async () => {
    if (!noteText.trim()) return
    setNoteLoading(true)
    await fetch(`/api/clients/${id}/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: noteText }),
    })
    setNoteText('')
    await fetchClient()
    setNoteLoading(false)
  }

  const handleDelete = async () => {
    await fetch(`/api/clients/${id}`, { method: 'DELETE' })
    router.push('/clients')
  }

  if (loading || !client) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-cyan-400 border-t-transparent" />
      </div>
    )
  }

  const stageData = STAGES.map((stage) => ({
    ...stage,
    status: (client as any)[stage.key] as string | null,
  }))

  return (
    <div>
      {/* Header */}
      <div className="page-header flex items-center gap-4">
        <Link href="/clients" className="btn-ghost p-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M5 12l7 7M5 12l7-7" />
          </svg>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <div
              className="rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0"
              style={{ width: '36px', height: '36px', background: 'rgba(34,211,238,0.1)', color: '#22d3ee' }}
            >
              {client.serialNo}
            </div>
            {editMode ? (
              <input
                className="input-field text-xl font-bold"
                value={form.name || ''}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                style={{ fontSize: '1.25rem', fontWeight: 700 }}
              />
            ) : (
              <h1 className="text-xl font-bold text-white">{client.name}</h1>
            )}
          </div>
          {editMode ? (
            <input
              className="input-field mt-1 text-sm"
              placeholder="Partner name..."
              value={form.partner || ''}
              onChange={(e) => setForm((f) => ({ ...f, partner: e.target.value }))}
            />
          ) : (
            <p className="text-sm mt-1" style={{ color: '#94a3b8' }}>
              {client.partner || 'No partner assigned'} · Updated {timeAgo(client.updatedAt)}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {editMode ? (
            <>
              <button onClick={() => { setEditMode(false); setForm(client) }} className="btn-ghost">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="btn-primary">
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </>
          ) : (
            <>
              <button onClick={() => setEditMode(true)} className="btn-secondary">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
                Edit
              </button>
              {!deleteConfirm ? (
                <button onClick={() => setDeleteConfirm(true)} className="btn-ghost" style={{ color: '#ef4444' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                  </svg>
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-xs" style={{ color: '#ef4444' }}>Confirm delete?</span>
                  <button onClick={handleDelete} className="btn-ghost text-xs" style={{ color: '#ef4444', borderColor: '#ef4444' }}>Yes</button>
                  <button onClick={() => setDeleteConfirm(false)} className="btn-ghost text-xs">No</button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Pipeline Stepper */}
      <div className="glass-card p-5 mb-6">
        <h2 className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: '#64748b' }}>
          Pipeline Progress
        </h2>
        <PipelineStepper stages={stageData} onStatusChange={handleStageChange} editable={!editMode} />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4" style={{ borderBottom: '1px solid rgba(34,211,238,0.08)' }}>
        {(['overview', 'activity', 'notes'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="px-4 py-2 text-sm font-medium capitalize transition-colors"
            style={{
              color: tab === t ? '#22d3ee' : '#64748b',
              borderBottom: tab === t ? '2px solid #22d3ee' : '2px solid transparent',
              marginBottom: '-1px',
            }}
          >
            {t}
            {t === 'notes' && client.clientNotes.length > 0 && (
              <span
                className="ml-2 rounded-full px-1.5 py-0.5 text-xs"
                style={{ background: 'rgba(34,211,238,0.15)', color: '#22d3ee' }}
              >
                {client.clientNotes.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {tab === 'overview' && (
        <div className="grid grid-cols-2 gap-6">
          {/* Stage Statuses */}
          <div className="glass-card p-5">
            <h3 className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: '#64748b' }}>
              Stage Statuses
            </h3>
            <div className="flex flex-col gap-3">
              {STAGES.map((stage) => {
                const currentVal = (editMode ? form : client) as any
                const options = STAGE_OPTIONS[stage.key] as readonly string[]
                return (
                  <div key={stage.key} className="flex items-center justify-between gap-3">
                    <span className="text-sm flex-shrink-0" style={{ color: '#94a3b8', minWidth: '110px' }}>
                      {stage.shortLabel}
                    </span>
                    {editMode ? (
                      <select
                        className="select-field text-xs flex-1"
                        value={currentVal[stage.key] || ''}
                        onChange={(e) => setForm((f) => ({ ...f, [stage.key]: e.target.value || null }))}
                      >
                        <option value="">— Not set —</option>
                        {options.map((opt) => (
                          <option key={opt} value={opt}>{STATUS_LABELS[opt] || opt}</option>
                        ))}
                      </select>
                    ) : (
                      <div className="flex-1 flex justify-end">
                        <StatusPill status={(client as any)[stage.key]} size="sm" />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Billing & Invoice */}
          <div className="flex flex-col gap-4">
            <div className="glass-card p-5">
              <h3 className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: '#64748b' }}>
                Billing & Invoice
              </h3>
              <div className="flex flex-col gap-3">
                {[
                  { label: 'Billing Entity', key: 'billingEntity', type: 'text' },
                  { label: 'Invoice No', key: 'invoiceNo', type: 'text' },
                ].map(({ label, key, type }) => (
                  <div key={key} className="flex items-center justify-between gap-3">
                    <span className="text-sm" style={{ color: '#94a3b8' }}>{label}</span>
                    {editMode ? (
                      <input
                        className="input-field text-sm text-right flex-1 max-w-[180px]"
                        type={type}
                        value={(form as any)[key] || ''}
                        onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value || null }))}
                      />
                    ) : (
                      <span className="text-sm text-white">{(client as any)[key] || '—'}</span>
                    )}
                  </div>
                ))}
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm" style={{ color: '#94a3b8' }}>Invoice Status</span>
                  {editMode ? (
                    <select
                      className="select-field text-sm flex-1 max-w-[180px]"
                      value={form.invoiceStatus || ''}
                      onChange={(e) => setForm((f) => ({ ...f, invoiceStatus: e.target.value || null }))}
                    >
                      <option value="">— Not set —</option>
                      {INVOICE_STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                      ))}
                    </select>
                  ) : (
                    <StatusPill status={client.invoiceStatus} size="sm" />
                  )}
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm" style={{ color: '#94a3b8' }}>Payment Status</span>
                  {editMode ? (
                    <select
                      className="select-field text-sm flex-1 max-w-[180px]"
                      value={form.paymentStatus || ''}
                      onChange={(e) => setForm((f) => ({ ...f, paymentStatus: e.target.value || null }))}
                    >
                      <option value="">— Not set —</option>
                      {PAYMENT_STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                      ))}
                    </select>
                  ) : (
                    <StatusPill status={client.paymentStatus} size="sm" />
                  )}
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm" style={{ color: '#94a3b8' }}>Further Work</span>
                  {editMode ? (
                    <select
                      className="select-field text-sm flex-1 max-w-[180px]"
                      value={form.furtherWork || ''}
                      onChange={(e) => setForm((f) => ({ ...f, furtherWork: e.target.value || null }))}
                    >
                      <option value="">— Not set —</option>
                      {FURTHER_WORK_OPTIONS.map((s) => (
                        <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                      ))}
                    </select>
                  ) : (
                    <StatusPill status={client.furtherWork} size="sm" />
                  )}
                </div>
              </div>
            </div>

            {/* Bank Info */}
            <div className="glass-card p-5">
              <h3 className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: '#64748b' }}>
                Banking Details
              </h3>
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm" style={{ color: '#94a3b8' }}>Indian Bank</span>
                  {editMode ? (
                    <select
                      className="select-field text-sm max-w-[180px]"
                      value={form.indianBankName || ''}
                      onChange={(e) => setForm((f) => ({ ...f, indianBankName: e.target.value || null }))}
                    >
                      <option value="">— Select bank —</option>
                      {BANK_OPTIONS.map((b) => <option key={b} value={b}>{b}</option>)}
                    </select>
                  ) : (
                    <span className="text-sm text-white">{client.indianBankName || '—'}</span>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm" style={{ color: '#94a3b8' }}>Indian Bank Status</span>
                  <StatusPill status={client.indianBankStatus} size="sm" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm" style={{ color: '#94a3b8' }}>Foreign Bank Status</span>
                  <StatusPill status={client.foreignBankStatus} size="sm" />
                </div>
              </div>
            </div>

            {/* Invoices */}
            {client.invoices.length > 0 && (
              <div className="glass-card p-5">
                <h3 className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: '#64748b' }}>
                  Invoice Records
                </h3>
                <div className="flex flex-col gap-2">
                  {client.invoices.map((inv) => (
                    <div key={inv.id} className="flex items-center justify-between py-2 border-b" style={{ borderColor: 'rgba(34,211,238,0.06)' }}>
                      <div>
                        <p className="text-sm text-white">{inv.invoiceNo || '—'}</p>
                        <p className="text-xs" style={{ color: '#64748b' }}>{new Date(inv.createdAt).toLocaleDateString('en-IN')}</p>
                      </div>
                      <div className="text-right">
                        {inv.amount && (
                          <p className="text-sm font-semibold" style={{ color: '#22d3ee' }}>
                            ₹{inv.amount.toLocaleString('en-IN')}
                          </p>
                        )}
                        <StatusPill status={inv.status} size="sm" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {tab === 'activity' && (
        <div className="glass-card p-5">
          <h3 className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: '#64748b' }}>
            Audit Trail ({client.statusLogs.length} entries)
          </h3>
          {client.statusLogs.length === 0 ? (
            <p className="text-sm text-center py-8" style={{ color: '#64748b' }}>No activity yet</p>
          ) : (
            <div className="flex flex-col gap-3">
              {client.statusLogs.map((log) => (
                <div key={log.id} className="flex items-start gap-3 py-2 border-b" style={{ borderColor: 'rgba(34,211,238,0.06)' }}>
                  <div
                    className="rounded-full flex-shrink-0 mt-1"
                    style={{ width: '8px', height: '8px', background: '#22d3ee', marginTop: '6px' }}
                  />
                  <div className="flex-1">
                    <p className="text-sm text-white">
                      <span style={{ color: '#94a3b8' }}>{FIELD_LABELS[log.field] || log.field}</span>
                      {log.oldValue && log.newValue && (
                        <>
                          {' '}changed from{' '}
                          <span style={{ color: '#ef4444' }}>{STATUS_LABELS[log.oldValue] || log.oldValue}</span>
                          {' '}to{' '}
                          <span style={{ color: '#10b981' }}>{STATUS_LABELS[log.newValue] || log.newValue}</span>
                        </>
                      )}
                      {!log.oldValue && log.newValue && (
                        <> set to <span style={{ color: '#22d3ee' }}>{STATUS_LABELS[log.newValue] || log.newValue}</span></>
                      )}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: '#64748b' }}>
                      {log.changedBy || 'system'} · {timeAgo(log.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'notes' && (
        <div className="flex flex-col gap-4">
          {/* Add note */}
          <div className="glass-card p-4">
            <textarea
              className="input-field w-full resize-none"
              rows={3}
              placeholder="Add a note about this client..."
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleAddNote()
              }}
            />
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs" style={{ color: '#64748b' }}>Ctrl+Enter to submit</span>
              <button onClick={handleAddNote} disabled={noteLoading || !noteText.trim()} className="btn-primary">
                {noteLoading ? 'Adding...' : 'Add Note'}
              </button>
            </div>
          </div>

          {/* Notes list */}
          {client.clientNotes.length === 0 ? (
            <p className="text-sm text-center py-8" style={{ color: '#64748b' }}>No notes yet. Add the first one!</p>
          ) : (
            client.clientNotes.map((note) => (
              <div key={note.id} className="glass-card p-4">
                <p className="text-sm text-white leading-relaxed">{note.content}</p>
                <p className="text-xs mt-2" style={{ color: '#64748b' }}>
                  {note.author || 'Anonymous'} · {timeAgo(note.createdAt)}
                </p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
