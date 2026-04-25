'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import StatusPill from '@/components/StatusPill'
import {
  STAGES,
  LLP_STATUS_OPTIONS,
  PAYMENT_STATUS_OPTIONS,
  FURTHER_WORK_OPTIONS,
  STATUS_LABELS,
} from '@/lib/constants'

interface Client {
  id: string
  serialNo: number
  name: string
  partner: string
  llpStatus: string | null
  odiStatus: string | null
  indianBankStatus: string | null
  indianBankName: string | null
  companyStatus: string | null
  paymentStatus: string | null
  invoiceNo: string | null
  furtherWork: string | null
  updatedAt: string
}

const PAYMENT_COLOR: Record<string, string> = {
  PAID: '#10b981',
  PARTIALLY_PAID: '#fbbf24',
  TO_BE_PAID: '#ef4444',
  TO_BE_DISCUSSED: '#94a3b8',
  INCORPORATION_PAID: '#22d3ee',
}

export default function ClientsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [clients, setClients] = useState<Client[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [filters, setFilters] = useState({
    llpStatus: searchParams.get('llpStatus') || '',
    paymentStatus: searchParams.get('paymentStatus') || '',
    furtherWork: searchParams.get('furtherWork') || '',
  })

  const fetchClients = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (filters.llpStatus) params.set('llpStatus', filters.llpStatus)
    if (filters.paymentStatus) params.set('paymentStatus', filters.paymentStatus)
    if (filters.furtherWork) params.set('furtherWork', filters.furtherWork)
    params.set('limit', '100')

    const res = await fetch(`/api/clients?${params}`)
    const data = await res.json()
    setClients(data.clients || [])
    setTotal(data.total || 0)
    setLoading(false)
  }, [search, filters])

  useEffect(() => {
    const t = setTimeout(fetchClients, 300)
    return () => clearTimeout(t)
  }, [fetchClients])

  const exportCSV = () => {
    const headers = ['#', 'Client Name', 'Partner', 'LLP Status', 'ODI Status', 'Indian Bank', 'Company', 'Payment', 'Invoice No']
    const rows = clients.map((c) => [
      c.serialNo,
      c.name,
      c.partner || '',
      c.llpStatus ? STATUS_LABELS[c.llpStatus] || c.llpStatus : '',
      c.odiStatus ? STATUS_LABELS[c.odiStatus] || c.odiStatus : '',
      c.indianBankStatus ? `${STATUS_LABELS[c.indianBankStatus] || c.indianBankStatus}${c.indianBankName ? ` (${c.indianBankName})` : ''}` : '',
      c.companyStatus ? STATUS_LABELS[c.companyStatus] || c.companyStatus : '',
      c.paymentStatus ? STATUS_LABELS[c.paymentStatus] || c.paymentStatus : '',
      c.invoiceNo || '',
    ])
    const csv = [headers, ...rows].map((r) => r.map((v) => `"${v}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `odi-clients-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
  }

  return (
    <div>
      {/* Header */}
      <div className="page-header flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            <span className="glow-text">Clients</span>
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            {total} clients total
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={exportCSV} className="btn-secondary">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
            Export CSV
          </button>
          <Link href="/clients/new" className="btn-primary">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14" /></svg>
            Add Client
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-card p-4 mb-4 flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2"
            width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <input
            id="client-search"
            type="text"
            className="input-field pl-9"
            placeholder="Search clients or partners..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          id="filter-llp"
          className="select-field w-40"
          value={filters.llpStatus}
          onChange={(e) => setFilters((f) => ({ ...f, llpStatus: e.target.value }))}
        >
          <option value="">All LLP Status</option>
          {LLP_STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{STATUS_LABELS[s] || s}</option>
          ))}
        </select>

        <select
          id="filter-payment"
          className="select-field w-40"
          value={filters.paymentStatus}
          onChange={(e) => setFilters((f) => ({ ...f, paymentStatus: e.target.value }))}
        >
          <option value="">All Payments</option>
          {PAYMENT_STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{STATUS_LABELS[s] || s}</option>
          ))}
        </select>

        <select
          id="filter-further"
          className="select-field w-40"
          value={filters.furtherWork}
          onChange={(e) => setFilters((f) => ({ ...f, furtherWork: e.target.value }))}
        >
          <option value="">Further Work</option>
          {FURTHER_WORK_OPTIONS.map((s) => (
            <option key={s} value={s}>{STATUS_LABELS[s] || s}</option>
          ))}
        </select>

        {(search || filters.llpStatus || filters.paymentStatus || filters.furtherWork) && (
          <button
            onClick={() => { setSearch(''); setFilters({ llpStatus: '', paymentStatus: '', furtherWork: '' }) }}
            className="btn-ghost text-xs"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full" style={{ borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(34, 211, 238, 0.08)' }}>
                {['#', 'Client Name', 'Partner', 'LLP Status', 'ODI', 'Indian Bank', 'Foreign Bank', 'Company', 'FCGPR', 'Payment', ''].map((h) => (
                  <th
                    key={h}
                    className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider whitespace-nowrap"
                    style={{ color: '#64748b' }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={10} className="text-center py-12">
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-cyan-400 border-t-transparent mx-auto" />
                  </td>
                </tr>
              ) : clients.length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-center py-12">
                    <p style={{ color: '#64748b' }}>No clients found</p>
                  </td>
                </tr>
              ) : (
                clients.map((client) => (
                  <tr
                    key={client.id}
                    className="table-row cursor-pointer"
                    onClick={() => router.push(`/clients/${client.id}`)}
                  >
                    <td className="px-4 py-3">
                      <span className="text-xs font-mono" style={{ color: '#64748b' }}>
                        {client.serialNo}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-white whitespace-nowrap">{client.name}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-xs whitespace-nowrap" style={{ color: '#94a3b8' }}>{client.partner || '—'}</p>
                    </td>
                    <td className="px-4 py-3">
                      <StatusPill status={client.llpStatus} size="sm" />
                    </td>
                    <td className="px-4 py-3">
                      <StatusPill status={client.odiStatus} size="sm" />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                        <StatusPill status={client.indianBankStatus} size="sm" />
                        {client.indianBankName && (
                          <span className="text-xs" style={{ color: '#64748b' }}>{client.indianBankName}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <StatusPill status={(client as any).foreignBankStatus} size="sm" />
                    </td>
                    <td className="px-4 py-3">
                      <StatusPill status={client.companyStatus} size="sm" />
                    </td>
                    <td className="px-4 py-3">
                      <StatusPill status={(client as any).fcgprStatus} size="sm" />
                    </td>
                    <td className="px-4 py-3">
                      <StatusPill status={client.paymentStatus} size="sm" />
                    </td>
                    <td className="px-4 py-3">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: '#64748b' }}>
                        <path d="M9 18l6-6-6-6" />
                      </svg>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
