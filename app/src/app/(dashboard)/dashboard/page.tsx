'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import StatusPill from '@/components/StatusPill'
import { STATUS_LABELS } from '@/lib/constants'

interface PipelineData {
  total: number
  active: number
  cancelled: number
  stalled: number
  llpStats: Array<{ llpStatus: string | null; _count: number }>
  paymentStats: Array<{ paymentStatus: string | null; _count: number }>
}

interface Client {
  id: string
  serialNo: number
  name: string
  partner: string
  llpStatus: string
  paymentStatus: string
  updatedAt: string
}

export default function DashboardPage() {
  const [data, setData] = useState<PipelineData | null>(null)
  const [stalledClients, setStalledClients] = useState<Client[]>([])
  const [unpaidClients, setUnpaidClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/analytics/pipeline').then((r) => r.json()),
      fetch('/api/clients?limit=5&paymentStatus=TO_BE_PAID').then((r) => r.json()),
    ]).then(([pipeline, unpaid]) => {
      setData(pipeline)
      setUnpaidClients(unpaid.clients || [])
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

  const stats = [
    {
      label: 'Total Clients',
      value: data?.total ?? 0,
      icon: '👥',
      color: '#22d3ee',
      bg: 'rgba(34, 211, 238, 0.08)',
    },
    {
      label: 'Active',
      value: data?.active ?? 0,
      icon: '✅',
      color: '#10b981',
      bg: 'rgba(16, 185, 129, 0.08)',
    },
    {
      label: 'Cancelled',
      value: data?.cancelled ?? 0,
      icon: '❌',
      color: '#ef4444',
      bg: 'rgba(239, 68, 68, 0.08)',
    },
    {
      label: 'Stalled (7d+)',
      value: data?.stalled ?? 0,
      icon: '⏸',
      color: '#fbbf24',
      bg: 'rgba(251, 191, 36, 0.08)',
    },
  ]

  const llpBreakdown = (data?.llpStats || [])
    .filter((s) => s.llpStatus)
    .sort((a, b) => b._count - a._count)

  const paymentBreakdown = (data?.paymentStats || [])
    .filter((s) => s.paymentStatus)
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
            Real-time overview of your ODI client pipeline
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
          <div
            key={stat.label}
            className="stat-card"
            style={{ borderColor: `${stat.color}20` }}
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
          </div>
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
                          : item.llpStatus === 'REGISTERED'
                          ? 'rgba(16, 185, 129, 0.5)'
                          : 'rgba(34, 211, 238, 0.3)',
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

        {/* Pending Payments */}
        <div className="glass-card p-5 col-span-3">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider" style={{ color: '#94a3b8' }}>
              ⚠️ Pending Payments
            </h2>
            <Link href="/clients?paymentStatus=TO_BE_PAID" className="btn-ghost text-xs">
              View all →
            </Link>
          </div>
          {unpaidClients.length === 0 ? (
            <p className="text-sm text-center py-4" style={{ color: '#64748b' }}>
              No pending payments 🎉
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
