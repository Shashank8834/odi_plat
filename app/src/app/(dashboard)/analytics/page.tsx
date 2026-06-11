'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'
import { STATUS_LABELS, bucketLlpStatus, bucketPaymentStatus, type LlpBucket, type PaymentBucket } from '@/lib/constants'

interface PipelineData {
  total: number
  active: number
  cancelled: number
  toStart: number
  llpStats: Array<{ llpStatus: string | null; _count: number }>
  odiStats: Array<{ odiStatus: string | null; _count: number }>
  indianBankStats: Array<{ indianBankStatus: string | null; _count: number }>
  companyStats: Array<{ companyStatus: string | null; _count: number }>
  paymentStats: Array<{ paymentStatus: string | null; _count: number }>
}

interface RevenueData {
  totalRevenue: number
  paid: number
  pending: number
  recentInvoices: Array<{
    id: string
    invoiceNo: string | null
    amount: number | null
    status: string
    createdAt: string
    client: { name: string; serialNo: number }
  }>
}

const STATUS_CHART_COLORS: Record<string, string> = {
  COMPLETED: '#10b981',
  IN_PROCESS: '#fbbf24',
  CANCELLED: '#ef4444',
  UNKNOWN: '#a855f7',
  UIN_ALLOTTED: '#10b981',
  NOT_REQUIRED: '#475569',
  OPENED: '#10b981',
  DONE: '#10b981',
  INCORPORATED: '#10b981',
  COMPLETE: '#10b981',
  PAID: '#10b981',
  PARTIALLY_PAID: '#fbbf24',
  TO_BE_PAID: '#ef4444',
  TO_BE_DISCUSSED: '#94a3b8',
  INCORPORATION_PAID: '#22d3ee',
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          background: 'rgba(6, 14, 26, 0.95)',
          border: '1px solid rgba(34,211,238,0.2)',
          borderRadius: '8px',
          padding: '8px 12px',
        }}
      >
        <p style={{ color: '#94a3b8', fontSize: '11px', marginBottom: '4px' }}>
          {STATUS_LABELS[label] || label}
        </p>
        <p style={{ color: '#22d3ee', fontSize: '14px', fontWeight: 700 }}>
          {payload[0].value} clients
        </p>
      </div>
    )
  }
  return null
}

const CustomPieTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          background: 'rgba(6, 14, 26, 0.95)',
          border: '1px solid rgba(34,211,238,0.2)',
          borderRadius: '8px',
          padding: '8px 12px',
        }}
      >
        <p style={{ color: '#94a3b8', fontSize: '11px' }}>{STATUS_LABELS[payload[0].name] || payload[0].name}</p>
        <p style={{ color: payload[0].fill, fontSize: '14px', fontWeight: 700 }}>
          {payload[0].value} ({Math.round(payload[0].percent * 100)}%)
        </p>
      </div>
    )
  }
  return null
}

export default function AnalyticsPage() {
  const [pipeline, setPipeline] = useState<PipelineData | null>(null)
  const [revenue, setRevenue] = useState<RevenueData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([
      fetch('/api/analytics/pipeline').then((r) => {
        if (!r.ok) throw new Error('Failed to load pipeline data')
        return r.json()
      }),
      fetch('/api/analytics/revenue').then((r) => {
        if (!r.ok) throw new Error('Failed to load revenue data')
        return r.json()
      }),
    ]).then(([p, r]) => {
      setPipeline(p)
      setRevenue(r)
      setLoading(false)
    }).catch((err) => {
      setError(err.message || 'Failed to load analytics')
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

  const LLP_BUCKETS: LlpBucket[] = ['COMPLETED', 'IN_PROCESS', 'CANCELLED', 'UNKNOWN']
  const llpCounts: Record<LlpBucket, number> = { COMPLETED: 0, IN_PROCESS: 0, CANCELLED: 0, UNKNOWN: 0 }
  for (const s of pipeline?.llpStats || []) {
    const b = bucketLlpStatus(s.llpStatus)
    if (b) llpCounts[b] += s._count
  }
  const llpChartData = LLP_BUCKETS
    .map((b) => ({ name: b as string, value: llpCounts[b], fill: STATUS_CHART_COLORS[b] || '#64748b' }))
    .filter((x) => x.value > 0)
    .sort((a, b) => b.value - a.value)

  const PAYMENT_BUCKETS: PaymentBucket[] = ['PAID', 'PARTIALLY_PAID', 'INCORPORATION_PAID', 'TO_BE_DISCUSSED', 'TO_BE_PAID']
  const paymentCounts: Record<PaymentBucket, number> = {
    PAID: 0, PARTIALLY_PAID: 0, INCORPORATION_PAID: 0, TO_BE_DISCUSSED: 0, TO_BE_PAID: 0,
  }
  for (const s of pipeline?.paymentStats || []) {
    const b = bucketPaymentStatus(s.paymentStatus)
    if (b) paymentCounts[b] += s._count
  }
  const paymentChartData = PAYMENT_BUCKETS
    .map((b) => ({ name: b as string, value: paymentCounts[b], fill: STATUS_CHART_COLORS[b] || '#64748b' }))
    .filter((x) => x.value > 0)

  const odiChartData = (pipeline?.odiStats || [])
    .filter((s) => s.odiStatus)
    .map((s) => ({ name: s.odiStatus!, value: s._count, fill: STATUS_CHART_COLORS[s.odiStatus!] || '#64748b' }))

  const companyChartData = (pipeline?.companyStats || [])
    .filter((s) => s.companyStatus)
    .map((s) => ({ name: s.companyStatus!, value: s._count, fill: STATUS_CHART_COLORS[s.companyStatus!] || '#64748b' }))

  const totalRevenue = revenue?.totalRevenue ?? 0
  const paid = revenue?.paid ?? 0
  const pending = revenue?.pending ?? 0

  return (
    <div>
      {/* Header */}
      <div className="page-header flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold"><span className="glow-text">Analytics</span></h1>
          <p className="text-sm mt-0.5" style={{ color: '#94a3b8' }}>
            Pipeline performance & revenue insights
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Clients', value: pipeline?.total ?? 0, sub: 'All records', color: '#22d3ee', bg: 'rgba(34,211,238,0.08)' },
          { label: 'Active', value: pipeline?.active ?? 0, sub: 'Not cancelled or on hold', color: '#10b981', bg: 'rgba(16,185,129,0.08)' },
          { label: 'To Start', value: pipeline?.toStart ?? 0, sub: 'Yet to begin', color: '#fbbf24', bg: 'rgba(251,191,36,0.08)' },
          {
            label: 'Total Revenue',
            value: `₹${(totalRevenue / 100000).toFixed(1)}L`,
            sub: `₹${(paid / 100000).toFixed(1)}L collected`,
            color: '#10b981',
            bg: 'rgba(16,185,129,0.08)',
          },
        ].map((kpi) => (
          <div
            key={kpi.label}
            className="stat-card"
            style={{ borderColor: `${kpi.color}20` }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium uppercase tracking-wider" style={{ color: '#64748b' }}>
                {kpi.label}
              </span>
              <div
                className="rounded-lg"
                style={{ width: '8px', height: '8px', background: kpi.color, borderRadius: '50%', boxShadow: `0 0 8px ${kpi.color}` }}
              />
            </div>
            <p className="text-3xl font-bold mb-1" style={{ color: kpi.color }}>{kpi.value}</p>
            <p className="text-xs" style={{ color: '#475569' }}>{kpi.sub}</p>
          </div>
        ))}
      </div>

      {/* Revenue Split */}
      {totalRevenue > 0 && (
        <div className="glass-card p-5 mb-6">
          <h2 className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: '#64748b' }}>
            Revenue Collection
          </h2>
          <div className="flex items-center gap-4 mb-3">
            <div className="flex-1 h-4 rounded-full overflow-hidden" style={{ background: 'rgba(34,211,238,0.06)' }}>
              <div
                className="h-full rounded-full transition-all duration-1000"
                style={{
                  width: `${totalRevenue > 0 ? (paid / totalRevenue) * 100 : 0}%`,
                  background: 'linear-gradient(90deg, #10b981, #22d3ee)',
                }}
              />
            </div>
            <span className="text-sm font-bold" style={{ color: '#10b981' }}>
              {totalRevenue > 0 ? Math.round((paid / totalRevenue) * 100) : 0}% collected
            </span>
          </div>
          <div className="flex gap-8">
            <div>
              <p className="text-xs" style={{ color: '#64748b' }}>Collected</p>
              <p className="text-lg font-bold" style={{ color: '#10b981' }}>₹{paid.toLocaleString('en-IN')}</p>
            </div>
            <div>
              <p className="text-xs" style={{ color: '#64748b' }}>Pending</p>
              <p className="text-lg font-bold" style={{ color: '#fbbf24' }}>₹{pending.toLocaleString('en-IN')}</p>
            </div>
            <div>
              <p className="text-xs" style={{ color: '#64748b' }}>Total Billed</p>
              <p className="text-lg font-bold" style={{ color: '#22d3ee' }}>₹{totalRevenue.toLocaleString('en-IN')}</p>
            </div>
          </div>
        </div>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* LLP Status Bar Chart */}
        <div className="glass-card p-5">
          <h2 className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: '#64748b' }}>
            LLP Status Distribution
          </h2>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={llpChartData} margin={{ left: -20 }}>
              <XAxis
                dataKey="name"
                tick={{ fill: '#64748b', fontSize: 9 }}
                tickFormatter={(v) => {
                  const label = STATUS_LABELS[v] || v
                  return label.length > 10 ? label.slice(0, 10) + '…' : label
                }}
              />
              <YAxis tick={{ fill: '#64748b', fontSize: 10 }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {llpChartData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Payment Status Pie */}
        <div className="glass-card p-5">
          <h2 className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: '#64748b' }}>
            Payment Status Breakdown
          </h2>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={paymentChartData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={90}
                paddingAngle={2}
                dataKey="value"
                nameKey="name"
              >
                {paymentChartData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip content={<CustomPieTooltip />} />
              <Legend
                formatter={(v) => (
                  <span style={{ color: '#94a3b8', fontSize: '11px' }}>
                    {STATUS_LABELS[v] || v}
                  </span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* ODI Status */}
        <div className="glass-card p-5">
          <h2 className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: '#64748b' }}>
            ODI Status
          </h2>
          <div className="flex flex-col gap-3">
            {odiChartData.map((item) => {
              const pct = Math.round((item.value / (pipeline?.total || 1)) * 100)
              return (
                <div key={item.name} className="flex items-center gap-3">
                  <div className="w-28 flex-shrink-0 text-xs" style={{ color: '#94a3b8' }}>
                    {STATUS_LABELS[item.name] || item.name}
                  </div>
                  <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)' }}>
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${pct}%`, background: item.fill, transition: 'width 0.7s ease' }}
                    />
                  </div>
                  <span className="text-sm font-semibold w-8 text-right" style={{ color: '#e2e8f0' }}>{item.value}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Company Status */}
        <div className="glass-card p-5">
          <h2 className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: '#64748b' }}>
            Subsidiary Formation Status
          </h2>
          <div className="flex flex-col gap-3">
            {companyChartData.map((item) => {
              const pct = Math.round((item.value / (pipeline?.total || 1)) * 100)
              return (
                <div key={item.name} className="flex items-center gap-3">
                  <div className="w-28 flex-shrink-0 text-xs" style={{ color: '#94a3b8' }}>
                    {STATUS_LABELS[item.name] || item.name}
                  </div>
                  <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)' }}>
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${pct}%`, background: item.fill, transition: 'width 0.7s ease' }}
                    />
                  </div>
                  <span className="text-sm font-semibold w-8 text-right" style={{ color: '#e2e8f0' }}>{item.value}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Recent Invoices */}
      {(revenue?.recentInvoices?.length ?? 0) > 0 && (
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#64748b' }}>
              Recent Invoices
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full" style={{ borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(34,211,238,0.08)' }}>
                  {['#', 'Client', 'Invoice No', 'Amount', 'Status', 'Date'].map((h) => (
                    <th key={h} className="text-left px-3 py-2 text-xs font-semibold uppercase tracking-wider" style={{ color: '#64748b' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {revenue?.recentInvoices?.map((inv) => (
                  <tr key={inv.id} className="table-row">
                    <td className="px-3 py-2 text-xs font-mono" style={{ color: '#64748b' }}>{inv.client.serialNo}</td>
                    <td className="px-3 py-2 text-sm text-white">{inv.client.name}</td>
                    <td className="px-3 py-2 text-sm" style={{ color: '#94a3b8' }}>{inv.invoiceNo || '—'}</td>
                    <td className="px-3 py-2 text-sm font-semibold" style={{ color: '#22d3ee' }}>
                      {inv.amount ? `₹${inv.amount.toLocaleString('en-IN')}` : '—'}
                    </td>
                    <td className="px-3 py-2">
                      <span
                        className="text-xs px-2 py-0.5 rounded-full"
                        style={{
                          background: inv.status === 'SENT' ? 'rgba(16,185,129,0.15)' : 'rgba(100,116,139,0.15)',
                          color: inv.status === 'SENT' ? '#10b981' : '#94a3b8',
                        }}
                      >
                        {STATUS_LABELS[inv.status] || inv.status}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-xs" style={{ color: '#64748b' }}>
                      {new Date(inv.createdAt).toLocaleDateString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
