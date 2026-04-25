import { STATUS_COLORS, STATUS_LABELS } from '@/lib/constants'

interface StatusPillProps {
  status: string | null | undefined
  size?: 'sm' | 'md'
}

export default function StatusPill({ status, size = 'md' }: StatusPillProps) {
  if (!status) {
    return (
      <span className="badge" style={{ background: 'rgba(71,85,105,0.2)', color: '#64748b', borderColor: 'rgba(71,85,105,0.3)', fontSize: size === 'sm' ? '0.65rem' : '0.75rem' }}>
        —
      </span>
    )
  }

  const colorClass = STATUS_COLORS[status] || 'bg-slate-500/20 text-slate-400 border-slate-500/30'
  const label = STATUS_LABELS[status] || status

  return (
    <span
      className={`badge ${colorClass}`}
      style={{ fontSize: size === 'sm' ? '0.65rem' : '0.75rem' }}
    >
      {label}
    </span>
  )
}
