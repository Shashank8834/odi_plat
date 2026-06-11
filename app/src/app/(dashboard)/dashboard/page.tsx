'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import StatusPill from '@/components/StatusPill'
import { STATUS_LABELS, STAGE_OPTIONS, bucketLlpStatus, bucketPaymentStatus, type LlpBucket, type PaymentBucket, type OverallStatus } from '@/lib/constants'

interface ToStartClient {
  id: string
  serialNo: number
  name: string
  partner: string | null
  llpStatus: string | null
  fields: string[]
}

interface PipelineData {
  total: number
  active: number
  cancelled: number
  overallCounts: Record<OverallStatus, number>
  toStart: number
  toStartClients: ToStartClient[]
  llpStats: Array<{ llpStatus: string | null; _count: number }>
  paymentStats: Array<{ paymentStatus: string | null; _count: number }>
}

interface Client {
  id: string
  serialNo: number
  name: string
  partner: string
  llpStatus: string | null
  overallStatus: string | null
  paymentStatus: string
  updatedAt: string
}

const FIELD_LABELS: Record<string, string> = {
  llpStatus: 'LLP',
  odiStatus: 'ODI',
  indianBankStatus: 'LLP Bank',
  foreignBankStatus: 'Foreign Bank',
  companyStatus: 'Subsidiary',
  fcgprStatus: 'FCGPR',
  shareCertStatus: 'Share Cert',
  form3Status: 'Form 3',
}

export default function DashboardPage() {
  const [data, setData] = useState<PipelineData | null>(null)
  const [unpaidClients, setUnpaidClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [savingKey, setSavingKey] = useState<string | null>(null)

  async function changeStatus(clientId: string, field: string, newValue: string) {
    const key = `${clientId}:${field}`
    setSavingKey(key)
    try {
      const res = await fetch(`/api/clients/${clientId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: newValue }),
      })
      if (!res.ok) throw new Error('Update failed')
      setData((prev) => {
        if (!prev) return prev
        const updated = prev.toStartClients
          .map((c) => {
            if (c.id !== clientId) return c
            const remaining = c.fields.filter((f) => f !== field)
            return { ...c, fields: remaining }
          })
          .filter((c) => c.fields.length > 0)
        return { ...prev, toStartClients: updated, toStart: updated.length }
      })
    } catch {
      alert('Failed to update status')
    } finally {
      setSavingKey(null)
    }
  }

  useEffect(() => {
    const PENDING_BUCKETS: PaymentBucket[] = ['TO_BE_PAID', 'PARTIALLY_PAID', 'TO_BE_DISCUSSED']
    Promise.all([
      fetch('/api/analytics/pipeline').then((r) => {
        if (!r.ok) throw new Error('Failed to load pipeline data')
        return r.json()
      }),
      fetch('/api/clients?limit=500').then((r) => {
        if (!r.ok) throw new Error('Failed to load clients')
        return r.json()
      }),
    ]).then(([pipeline, all]) => {
      setData(pipeline)
      const allClients: Client[] = all.clients || []
      const pending = allClients
        .filter((c) => {
          const b = bucketPaymentStatus(c.paymentStatus)
          return b !== null && PENDING_BUCKETS.includes(b)
        })
        .slice(0, 5)
      setUnpaidClients(pending)
      setLoading(false)
    }).catch((err) => {
      setError(err.message || 'Failed to load dashboard data')
      setLoading(false)
    })
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-cyan-400 border-t-transparent" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-sm" style={{ color: '#ef4444' }}>{error}</p>
      </div>
    )
  }

  const oc = data?.overallCounts ?? { IN_PROCESS: 0, TO_START: 0, COMPLETED: 0, CANCELLED: 0 }
  const stats: Array<{ label: string; value: number; icon: string; color: string; bg: string; filter: OverallStatus }> = [
    { label: 'In Process', value: oc.IN_PROCESS, icon: '⚙', color: '#fbbf24', bg: 'rgba(251, 191, 36, 0.08)', filter: 'IN_PROCESS' },
    { label: 'To Start', value: oc.TO_START, icon: '⏸', color: '#94a3b8', bg: 'rgba(148, 163, 184, 0.08)', filter: 'TO_START' },
    { label: 'Completed', value: oc.COMPLETED, icon: '✅', color: '#10b981', bg: 'rgba(16, 185, 129, 0.08)', filter: 'COMPLETED' },
    { label: 'Cancelled', value: oc.CANCELLED, icon: '❌', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.08)', filter: 'CANCELLED' },
  ]

  const LLP_BUCKETS: LlpBucket[] = ['COMPLETED', 'IN_PROCESS', 'CANCELLED', 'UNKNOWN']
  const llpBucketCounts: Record<LlpBucket, number> = { COMPLETED: 0, IN_PROCESS: 0, CANCELLED: 0, UNKNOWN: 0 }
  for (const s of data?.llpStats || []) {
    const b = bucketLlpStatus(s.llpStatus)
    if (b) llpBucketCounts[b] += s._count
  }
  const llpBreakdown = LLP_BUCKETS
    .map((b) => ({ llpStatus: b, _count: llpBucketCounts[b] }))
    .filter((x) => x._count > 0)
    .sort((a, b) => b._count - a._count)

  const PAYMENT_BUCKETS: PaymentBucket[] = ['PAID', 'PARTIALLY_PAID', 'INCORPORATION_PAID', 'TO_BE_DISCUSSED', 'TO_BE_PAID']
  const paymentBucketCounts: Record<PaymentBucket, number> = {
    PAID: 0, PARTIALLY_PAID: 0, INCORPORATION_PAID: 0, TO_BE_DISCUSSED: 0, TO_BE_PAID: 0,
  }
  for (const s of data?.paymentStats || []) {
    const b = bucketPaymentStatus(s.paymentStatus)
    if (b) paymentBucketCounts[b] += s._count
  }
  const paymentBreakdown = PAYMENT_BUCKETS
    .map((b) => ({ paymentStatus: b, _count: paymentBucketCounts[b] }))
    .filter((x) => x._count > 0)
    .sort((a, b) => b._count - a._count)

  return (
    <div>
      {/* Header */}
      <div className="page-header flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            <span className="glow-text">Dashboard</span>
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            {data?.total ?? 0} clients · click a status card to view the list
          </p>
        </div>
        <Link href="/clients/new" className="btn-primary">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14" /></svg>
          Add Client
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 mb-6" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={`/clients?overallStatus=${stat.filter}`}
            className="stat-card"
            style={{ borderColor: `${stat.color}20`, textDecoration: 'none' }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium" style={{ color: '#94a3b8' }}>
                {stat.label}
              </span>
              <div
                className="rounded-lg flex items-center justify-center"
                style={{ width: '32px', height: '32px', background: stat.bg }}
              >
                <span className="text-sm">{stat.icon}</span>
              </div>
            </div>
            <p className="text-3xl font-bold" style={{ color: stat.color }}>
              {stat.value}
            </p>
          </Link>
        ))}
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-3 gap-6">
        {/* LLP Stage Breakdown */}
        <div className="glass-card p-5 col-span-2">
          <h2 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: '#94a3b8' }}>
            LLP Status Distribution
          </h2>
          <div className="flex flex-col gap-3">
            {llpBreakdown.map((item) => {
              const pct = Math.round(((item._count) / (data?.total || 1)) * 100)
              return (
                <div key={item.llpStatus} className="flex items-center gap-3">
                  <div className="w-24 flex-shrink-0">
                    <StatusPill status={item.llpStatus} size="sm" />
                  </div>
                  <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'rgba(34, 211, 238, 0.06)' }}>
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${pct}%`,
                        background: item.llpStatus === 'CANCELLED'
                          ? 'rgba(239, 68, 68, 0.5)'
                          : item.llpStatus === 'COMPLETED'
                          ? 'rgba(16, 185, 129, 0.5)'
                          : item.llpStatus === 'UNKNOWN'
                          ? 'rgba(168, 85, 247, 0.5)'
                          : 'rgba(251, 191, 36, 0.5)',
                      }}
                    />
                  </div>
                  <span className="text-xs font-medium w-8 text-right" style={{ color: '#94a3b8' }}>
                    {item._count}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Payment Status */}
        <div className="glass-card p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: '#94a3b8' }}>
            Payment Status
          </h2>
          <div className="flex flex-col gap-3">
            {paymentBreakdown.map((item) => (
              <div key={item.paymentStatus} className="flex items-center justify-between">
                <StatusPill status={item.paymentStatus} size="sm" />
                <span className="text-lg font-bold" style={{ color: '#e2e8f0' }}>
                  {item._count}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Clients with individual stages still marked "to start" — distinct from
            the top-level "To Start" status card, which tracks whole-lead status. */}
        <div className="glass-card p-5 col-span-3">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-sm font-semibold uppercase tracking-wider" style={{ color: '#94a3b8' }}>
              Pending Stage Actions ({data?.toStartClients?.length ?? 0})
            </h2>
          </div>
          <p className="text-xs mb-4" style={{ color: '#64748b' }}>
            Clients with an individual stage marked “to start” — pick a status to advance it.
          </p>
          {(data?.toStartClients?.length ?? 0) === 0 ? (
            <p className="text-sm text-center py-4" style={{ color: '#64748b' }}>
              No stages pending
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {data!.toStartClients.map((client) => (
                <div
                  key={client.id}
                  className="flex items-center justify-between px-4 py-3 rounded-lg"
                  style={{
                    background: 'rgba(251, 191, 36, 0.04)',
                    border: '1px solid rgba(251, 191, 36, 0.1)',
                  }}
                >
                  <Link href={`/clients/${client.id}`} className="flex items-center gap-3 min-w-0">
                    <div
                      className="rounded-full flex items-center justify-center text-xs font-bold"
                      style={{ width: '32px', height: '32px', background: 'rgba(251, 191, 36, 0.12)', color: '#fbbf24', flexShrink: 0 }}
                    >
                      {client.serialNo}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white truncate">{client.name}</p>
                      <p className="text-xs" style={{ color: '#64748b' }}>{client.partner || '—'}</p>
                    </div>
                  </Link>
                  <div className="flex items-center gap-2 flex-wrap justify-end">
                    {client.fields.map((f) => {
                      const opts = STAGE_OPTIONS[f] || []
                      const key = `${client.id}:${f}`
                      const isSaving = savingKey === key
                      return (
                        <div key={f} className="flex items-center gap-1.5">
                          <span
                            className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded"
                            style={{ background: 'rgba(251, 191, 36, 0.12)', color: '#fbbf24' }}
                          >
                            {FIELD_LABELS[f] || f}
                          </span>
                          <select
                            disabled={isSaving}
                            defaultValue=""
                            onChange={(e) => {
                              const v = e.target.value
                              if (v) changeStatus(client.id, f, v)
                            }}
                            className="text-xs px-2 py-1 rounded"
                            style={{
                              background: 'rgba(15, 23, 42, 0.6)',
                              color: '#e2e8f0',
                              border: '1px solid rgba(251, 191, 36, 0.2)',
                              cursor: isSaving ? 'wait' : 'pointer',
                            }}
                          >
                            <option value="" disabled>{isSaving ? 'Saving…' : 'Change to…'}</option>
                            {opts.map((o) => (
                              <option key={o} value={o}>{STATUS_LABELS[o] || o}</option>
                            ))}
                          </select>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pending Payments */}
        <div className="glass-card p-5 col-span-3">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider" style={{ color: '#94a3b8' }}>
              Pending Payments
            </h2>
            <Link href="/clients?paymentStatus=TO_BE_PAID" className="btn-ghost text-xs">
              View all →
            </Link>
          </div>
          {unpaidClients.length === 0 ? (
            <p className="text-sm text-center py-4" style={{ color: '#64748b' }}>
              No pending payments
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {unpaidClients.map((client) => (
                <Link
                  key={client.id}
                  href={`/clients/${client.id}`}
                  className="flex items-center justify-between px-4 py-3 rounded-lg transition-all"
                  style={{
                    background: 'rgba(34, 211, 238, 0.03)',
                    border: '1px solid rgba(34, 211, 238, 0.06)',
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="rounded-full flex items-center justify-center text-xs font-bold"
                      style={{ width: '32px', height: '32px', background: 'rgba(34, 211, 238, 0.1)', color: '#22d3ee', flexShrink: 0 }}
                    >
                      {client.serialNo}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{client.name}</p>
                      <p className="text-xs" style={{ color: '#64748b' }}>{client.partner}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusPill status={client.llpStatus} size="sm" />
                    <StatusPill status={client.paymentStatus} size="sm" />
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: '#64748b' }}>
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
