'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  STAGE_OPTIONS,
  STATUS_LABELS,
  INVOICE_STATUS_OPTIONS,
  PAYMENT_STATUS_OPTIONS,
  FURTHER_WORK_OPTIONS,
  BANK_OPTIONS,
  STAGES,
} from '@/lib/constants'

export default function NewClientPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState<Record<string, string>>({
    name: '',
    partner: '',
    billingEntity: '',
    invoiceNo: '',
    indianBankName: '',
  })

  const set = (key: string, val: string) => setForm((f) => ({ ...f, [key]: val }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) { setError('Client name is required'); return }
    setSaving(true)
    setError('')

    // Clean up empty strings → undefined
    const payload: Record<string, string | null> = {}
    for (const [k, v] of Object.entries(form)) {
      payload[k] = v.trim() || null
    }

    const res = await fetch('/api/clients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (res.ok) {
      const data = await res.json()
      router.push(`/clients/${data.id}`)
    } else {
      const data = await res.json()
      setError(data.error || 'Failed to create client')
      setSaving(false)
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="page-header flex items-center gap-4">
        <Link href="/clients" className="btn-ghost p-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M5 12l7 7M5 12l7-7" />
          </svg>
        </Link>
        <div>
          <h1 className="text-2xl font-bold"><span className="glow-text">Add New Client</span></h1>
          <p className="text-sm mt-0.5" style={{ color: '#94a3b8' }}>Create a new ODI client record</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-6">
          {/* Basic Info */}
          <div className="glass-card p-5 col-span-2">
            <h2 className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: '#64748b' }}>
              Basic Information
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: '#94a3b8' }}>
                  Client Name <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  id="new-client-name"
                  className="input-field w-full"
                  placeholder="e.g. Goldee Enterprises LLP"
                  value={form.name}
                  onChange={(e) => set('name', e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: '#94a3b8' }}>Partner</label>
                <input
                  className="input-field w-full"
                  placeholder="Partner name..."
                  value={form.partner}
                  onChange={(e) => set('partner', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: '#94a3b8' }}>Billing Entity</label>
                <input
                  className="input-field w-full"
                  placeholder="Billing entity name..."
                  value={form.billingEntity}
                  onChange={(e) => set('billingEntity', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: '#94a3b8' }}>Indian Bank</label>
                <select className="select-field w-full" value={form.indianBankName} onChange={(e) => set('indianBankName', e.target.value)}>
                  <option value="">— Select bank —</option>
                  {BANK_OPTIONS.map((b) => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Pipeline Stages */}
          <div className="glass-card p-5">
            <h2 className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: '#64748b' }}>
              Pipeline Stages
            </h2>
            <div className="flex flex-col gap-3">
              {STAGES.map((stage) => {
                const options = STAGE_OPTIONS[stage.key] as readonly string[]
                return (
                  <div key={stage.key}>
                    <label className="block text-xs font-medium mb-1" style={{ color: '#94a3b8' }}>
                      {stage.label}
                    </label>
                    <select
                      className="select-field w-full"
                      value={form[stage.key] || ''}
                      onChange={(e) => set(stage.key, e.target.value)}
                    >
                      <option value="">— Not set —</option>
                      {options.map((opt) => (
                        <option key={opt} value={opt}>{STATUS_LABELS[opt] || opt}</option>
                      ))}
                    </select>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Billing */}
          <div className="flex flex-col gap-4">
            <div className="glass-card p-5">
              <h2 className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: '#64748b' }}>
                Billing & Payment
              </h2>
              <div className="flex flex-col gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: '#94a3b8' }}>Invoice No</label>
                  <input
                    className="input-field w-full"
                    placeholder="e.g. 2025-26/3112"
                    value={form.invoiceNo}
                    onChange={(e) => set('invoiceNo', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: '#94a3b8' }}>Invoice Status</label>
                  <select className="select-field w-full" value={form.invoiceStatus || ''} onChange={(e) => set('invoiceStatus', e.target.value)}>
                    <option value="">— Not set —</option>
                    {INVOICE_STATUS_OPTIONS.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: '#94a3b8' }}>Payment Status</label>
                  <select className="select-field w-full" value={form.paymentStatus || ''} onChange={(e) => set('paymentStatus', e.target.value)}>
                    <option value="">— Not set —</option>
                    {PAYMENT_STATUS_OPTIONS.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: '#94a3b8' }}>Further Work</label>
                  <select className="select-field w-full" value={form.furtherWork || ''} onChange={(e) => set('furtherWork', e.target.value)}>
                    <option value="">— Not set —</option>
                    {FURTHER_WORK_OPTIONS.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="glass-card p-5">
              <h2 className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: '#64748b' }}>
                Initial Notes
              </h2>
              <textarea
                className="input-field w-full resize-none"
                rows={4}
                placeholder="Any initial notes about this client..."
                value={form.notes || ''}
                onChange={(e) => set('notes', e.target.value)}
              />
            </div>
          </div>
        </div>

        {error && (
          <div
            className="mt-4 px-4 py-3 rounded-lg text-sm"
            style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171' }}
          >
            {error}
          </div>
        )}

        <div className="flex items-center justify-end gap-3 mt-6">
          <Link href="/clients" className="btn-ghost">Cancel</Link>
          <button id="create-client-submit" type="submit" disabled={saving} className="btn-primary px-8">
            {saving ? 'Creating...' : 'Create Client'}
          </button>
        </div>
      </form>
    </div>
  )
}
