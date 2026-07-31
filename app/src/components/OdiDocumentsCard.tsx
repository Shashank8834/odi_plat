'use client'

import { useState } from 'react'

// Kept in sync with BANKS in src/lib/odi-docs.ts. Not imported from there —
// that module pulls in node:fs and must stay server-only.
const BANKS = [
  { key: 'hdfc', label: 'HDFC' },
  { key: 'kotak', label: 'Kotak' },
  { key: 'icici', label: 'ICICI' },
] as const

type BankKey = (typeof BANKS)[number]['key']

/** Pull the UTF-8 filename out of a Content-Disposition header. */
function filenameFrom(header: string | null, fallback: string): string {
  const encoded = header?.match(/filename\*=UTF-8''([^;]+)/i)
  if (encoded) {
    try {
      return decodeURIComponent(encoded[1])
    } catch {
      /* fall through to the plain filename */
    }
  }
  return header?.match(/filename="([^"]+)"/i)?.[1] ?? fallback
}

export default function OdiDocumentsCard({
  clientId,
  indianBankName,
}: {
  clientId: string
  /** The client's LLP bank, used to hint which format they'll usually need. */
  indianBankName: string | null
}) {
  const [busy, setBusy] = useState<BankKey | null>(null)
  const [error, setError] = useState('')

  const download = async (bank: BankKey) => {
    setBusy(bank)
    setError('')
    try {
      const res = await fetch(`/api/clients/${clientId}/documents/${bank}`)
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.error || 'Could not generate the drafts')
        setBusy(null)
        return
      }

      const blob = await res.blob()
      const name = filenameFrom(res.headers.get('Content-Disposition'), `odi-drafts-${bank}.zip`)

      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = name
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } catch {
      setError('Network error — drafts not downloaded')
    }
    setBusy(null)
  }

  return (
    <div className="glass-card p-5">
      <h3 className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: '#64748b' }}>
        ODI Draft Documents
      </h3>
      <p className="text-xs mb-4" style={{ color: '#64748b' }}>
        Downloads that bank&apos;s draft set as a ZIP, with the client name, contact person,
        email, date and AD bank filled in. Remittance and beneficiary details are left blank.
      </p>

      <div className="flex items-center gap-2 flex-wrap">
        {BANKS.map(({ key, label }) => {
          const suggested = indianBankName?.toLowerCase() === label.toLowerCase()
          return (
            <button
              key={key}
              onClick={() => download(key)}
              disabled={busy !== null}
              className={suggested ? 'btn-primary' : 'btn-secondary'}
              title={`Generate the ${label} ODI draft set`}
            >
              {busy === key ? (
                <span
                  className="animate-spin rounded-full"
                  style={{
                    width: '13px',
                    height: '13px',
                    border: '2px solid currentColor',
                    borderTopColor: 'transparent',
                  }}
                />
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
              )}
              {label}
            </button>
          )
        })}
      </div>

      {indianBankName && !BANKS.some((b) => b.label.toLowerCase() === indianBankName.toLowerCase()) && (
        <p className="text-xs mt-3" style={{ color: '#fbbf24' }}>
          This client banks with {indianBankName}, which has no draft set yet — pick the closest format.
        </p>
      )}

      {error && (
        <p className="text-xs mt-3" style={{ color: '#ef4444' }}>{error}</p>
      )}
    </div>
  )
}
