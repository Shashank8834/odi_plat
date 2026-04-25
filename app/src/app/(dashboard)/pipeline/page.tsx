'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import StatusPill from '@/components/StatusPill'
import { STATUS_LABELS, STAGE_OPTIONS, STAGES } from '@/lib/constants'

interface Client {
  id: string
  serialNo: number
  name: string
  partner: string | null
  llpStatus: string | null
  odiStatus: string | null
  indianBankStatus: string | null
  foreignBankStatus: string | null
  companyStatus: string | null
  fcgprStatus: string | null
  shareCertStatus: string | null
  form3Status: string | null
  paymentStatus: string | null
  updatedAt: string
}

type GroupedStage = {
  key: string
  label: string
  shortLabel: string
  clients: Array<{ client: Client; status: string | null }>
}

const STAGE_ORDER = ['TO_START', 'NAME_YET_TO_BE_APPLIED', 'NAME_APPLIED', 'INCORPORATION_FILED', 'SHARE_ALLOTMENT', 'IN_PROCESS', 'ON_HOLD', 'CLIENT_HAS_ENTITY', 'REGISTERED', 'CANCELLED']

const COLUMN_COLORS: Record<string, string> = {
  REGISTERED: 'rgba(16, 185, 129, 0.08)',
  IN_PROCESS: 'rgba(251, 191, 36, 0.08)',
  CANCELLED: 'rgba(239, 68, 68, 0.08)',
  ON_HOLD: 'rgba(148, 163, 184, 0.06)',
  NAME_APPLIED: 'rgba(34, 211, 238, 0.06)',
  CLIENT_HAS_ENTITY: 'rgba(34, 211, 238, 0.08)',
  NAME_YET_TO_BE_APPLIED: 'rgba(100, 116, 139, 0.06)',
  INCORPORATION_FILED: 'rgba(251, 191, 36, 0.06)',
  SHARE_ALLOTMENT: 'rgba(251, 191, 36, 0.06)',
  TO_START: 'rgba(100, 116, 139, 0.05)',
}

const COLUMN_BORDER: Record<string, string> = {
  REGISTERED: 'rgba(16, 185, 129, 0.2)',
  IN_PROCESS: 'rgba(251, 191, 36, 0.2)',
  CANCELLED: 'rgba(239, 68, 68, 0.2)',
  ON_HOLD: 'rgba(148, 163, 184, 0.15)',
  NAME_APPLIED: 'rgba(34, 211, 238, 0.15)',
  CLIENT_HAS_ENTITY: 'rgba(34, 211, 238, 0.2)',
}

function timeAgo(dateStr: string) {
  const d = new Date(dateStr)
  const now = new Date()
  const diff = Math.floor((now.getTime() - d.getTime()) / 1000)
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

export default function PipelinePage() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)
  const [dragClient, setDragClient] = useState<Client | null>(null)
  const [dragOver, setDragOver] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/clients?limit=200')
      .then((r) => r.json())
      .then((data) => {
        setClients(data.clients || [])
        setLoading(false)
      })
  }, [])

  // Group clients by llpStatus
  const columns = STAGE_ORDER.map((status) => ({
    status,
    label: STATUS_LABELS[status] || status,
    clients: clients.filter((c) => c.llpStatus === status),
  }))

  const handleDragStart = (client: Client) => setDragClient(client)
  const handleDragOver = (e: React.DragEvent, status: string) => {
    e.preventDefault()
    setDragOver(status)
  }
  const handleDrop = async (e: React.DragEvent, newStatus: string) => {
    e.preventDefault()
    if (!dragClient || dragClient.llpStatus === newStatus) {
      setDragClient(null)
      setDragOver(null)
      return
    }
    setUpdating(dragClient.id)
    setClients((prev) =>
      prev.map((c) => (c.id === dragClient.id ? { ...c, llpStatus: newStatus } : c))
    )
    await fetch(`/api/clients/${dragClient.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ llpStatus: newStatus }),
    })
    setDragClient(null)
    setDragOver(null)
    setUpdating(null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-cyan-400 border-t-transparent" />
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="page-header flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold"><span className="glow-text">Pipeline</span></h1>
          <p className="text-sm mt-0.5" style={{ color: '#94a3b8' }}>
            Drag & drop clients between LLP stages · {clients.length} clients
          </p>
        </div>
        <Link href="/clients/new" className="btn-primary">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Add Client
        </Link>
      </div>

      {/* Summary counts */}
      <div className="flex gap-3 mb-5 flex-wrap">
        {[
          { label: 'Total', count: clients.length, color: '#22d3ee' },
          { label: 'Active', count: clients.filter((c) => c.llpStatus && !['CANCELLED', 'ON_HOLD'].includes(c.llpStatus)).length, color: '#10b981' },
          { label: 'Cancelled', count: clients.filter((c) => c.llpStatus === 'CANCELLED').length, color: '#ef4444' },
          { label: 'On Hold', count: clients.filter((c) => c.llpStatus === 'ON_HOLD').length, color: '#fbbf24' },
          { label: 'Registered', count: clients.filter((c) => c.llpStatus === 'REGISTERED').length, color: '#10b981' },
        ].map((s) => (
          <div
            key={s.label}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <span style={{ color: s.color, fontSize: '0.875rem', fontWeight: 700 }}>{s.count}</span>
            <span style={{ color: '#64748b' }}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* Kanban Board */}
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-4" style={{ minWidth: '1400px' }}>
          {columns.map((col) => (
            <div
              key={col.status}
              className="flex flex-col rounded-xl transition-all"
              style={{
                width: '200px',
                minWidth: '200px',
                background: dragOver === col.status
                  ? (COLUMN_COLORS[col.status] || 'rgba(34,211,238,0.08)')
                  : (COLUMN_COLORS[col.status] || 'rgba(255,255,255,0.02)'),
                border: `1px solid ${dragOver === col.status ? '#22d3ee' : (COLUMN_BORDER[col.status] || 'rgba(255,255,255,0.06)')}`,
                transition: 'all 0.15s ease',
              }}
              onDragOver={(e) => handleDragOver(e, col.status)}
              onDrop={(e) => handleDrop(e, col.status)}
              onDragLeave={() => setDragOver(null)}
            >
              {/* Column header */}
              <div className="flex items-center justify-between px-3 py-3 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                <div>
                  <StatusPill status={col.status} size="sm" />
                </div>
                <span
                  className="text-xs font-bold rounded-full px-1.5"
                  style={{ background: 'rgba(255,255,255,0.08)', color: '#94a3b8' }}
                >
                  {col.clients.length}
                </span>
              </div>

              {/* Cards */}
              <div className="p-2 flex flex-col gap-2 flex-1" style={{ minHeight: '300px' }}>
                {col.clients.map((client) => (
                  <Link
                    key={client.id}
                    href={`/clients/${client.id}`}
                    className="block rounded-lg p-3 transition-all cursor-grab active:cursor-grabbing"
                    style={{
                      background: updating === client.id ? 'rgba(34,211,238,0.05)' : 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.06)',
                      opacity: updating === client.id ? 0.6 : 1,
                    }}
                    draggable
                    onDragStart={(e) => {
                      e.stopPropagation()
                      handleDragStart(client)
                    }}
                    onClick={(e) => {
                      if (dragClient) e.preventDefault()
                    }}
                  >
                    <div className="flex items-start justify-between gap-1 mb-2">
                      <p className="text-xs font-medium text-white leading-snug line-clamp-2">
                        {client.name}
                      </p>
                      <span
                        className="text-xs flex-shrink-0 rounded font-mono px-1"
                        style={{ background: 'rgba(34,211,238,0.08)', color: '#22d3ee' }}
                      >
                        {client.serialNo}
                      </span>
                    </div>
                    {client.partner && (
                      <p className="text-xs mb-2 truncate" style={{ color: '#64748b' }}>
                        {client.partner}
                      </p>
                    )}
                    <div className="flex items-center justify-between">
                      <StatusPill status={client.paymentStatus} size="sm" />
                      <span className="text-xs" style={{ color: '#475569' }}>{timeAgo(client.updatedAt)}</span>
                    </div>
                  </Link>
                ))}
                {col.clients.length === 0 && (
                  <div
                    className="flex items-center justify-center rounded-lg text-xs"
                    style={{
                      minHeight: '60px',
                      border: '1px dashed rgba(255,255,255,0.06)',
                      color: '#374151',
                    }}
                  >
                    Drop here
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <p className="text-xs mt-3 text-center" style={{ color: '#374151' }}>
        Drag cards to update LLP status. Changes are saved automatically.
      </p>
    </div>
  )
}
