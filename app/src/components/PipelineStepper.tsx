'use client'

import { useState } from 'react'
import { STAGES, STAGE_OPTIONS, STATUS_LABELS } from '@/lib/constants'
import StatusPill from './StatusPill'

interface StageData {
  key: string
  label: string
  shortLabel: string
  status: string | null
  description?: string
}

interface PipelineStepperProps {
  stages: StageData[]
  editable?: boolean
  onStatusChange?: (field: string, value: string) => void | Promise<void>
}

export default function PipelineStepper({ stages, editable, onStatusChange }: PipelineStepperProps) {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const [updating, setUpdating] = useState<string | null>(null)

  const handleChange = async (key: string, value: string) => {
    if (!onStatusChange) return
    setUpdating(key)
    setActiveDropdown(null)
    await onStatusChange(key, value)
    setUpdating(null)
  }

  return (
    <div className="overflow-x-auto">
      <div className="flex items-start gap-0 min-w-max py-2">
        {stages.map((stage, index) => {
          const status = stage.status
          const isComplete = status && !['IN_PROCESS', 'TO_START', 'NOT_REQUIRED', 'NA', 'PENDING', 'TO_BE_FILED', 'BANK_SELECTED', 'NAME_APPLIED', 'EMAILED', 'TO_BE_CHECKED'].includes(status)
          const isActive = status && ['IN_PROCESS', 'PENDING', 'TO_BE_FILED', 'BANK_SELECTED', 'NAME_APPLIED', 'INCORPORATION_FILED', 'EMAILED', 'TO_BE_CHECKED'].includes(status)
          const isSkipped = status === 'NOT_REQUIRED' || status === 'NA'
          const isEmpty = !status

          const options = STAGE_OPTIONS[stage.key] as readonly string[] | undefined

          return (
            <div key={stage.key} className="flex items-center">
              {/* Step */}
              <div className="flex flex-col items-center gap-2" style={{ minWidth: '90px' }}>
                {/* Circle indicator */}
                <div
                  className="flex items-center justify-center rounded-full transition-all cursor-pointer relative"
                  style={{
                    width: '32px',
                    height: '32px',
                    background: isComplete
                      ? 'rgba(16, 185, 129, 0.2)'
                      : isActive
                      ? 'rgba(251, 191, 36, 0.2)'
                      : isSkipped
                      ? 'rgba(71, 85, 105, 0.2)'
                      : 'rgba(15, 34, 56, 0.8)',
                    border: isComplete
                      ? '2px solid rgba(16, 185, 129, 0.6)'
                      : isActive
                      ? '2px solid rgba(251, 191, 36, 0.6)'
                      : isSkipped
                      ? '2px solid rgba(71, 85, 105, 0.4)'
                      : '2px solid rgba(34, 211, 238, 0.15)',
                    boxShadow: isComplete
                      ? '0 0 10px rgba(16, 185, 129, 0.2)'
                      : isActive
                      ? '0 0 10px rgba(251, 191, 36, 0.2)'
                      : 'none',
                    opacity: updating === stage.key ? 0.6 : 1,
                  }}
                  onClick={() => {
                    if (editable && options) {
                      setActiveDropdown(activeDropdown === stage.key ? null : stage.key)
                    }
                  }}
                >
                  {updating === stage.key ? (
                    <div className="animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" style={{ width: '12px', height: '12px' }} />
                  ) : isComplete ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : isSkipped ? (
                    <span style={{ color: '#64748b', fontSize: '0.7rem', fontWeight: 700 }}>–</span>
                  ) : isEmpty ? (
                    <span style={{ color: '#334155', fontSize: '0.7rem', fontWeight: 700 }}>{index + 1}</span>
                  ) : (
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="#fbbf24">
                      <circle cx="12" cy="12" r="10" />
                    </svg>
                  )}
                </div>

                {/* Stage label */}
                <div className="text-center">
                  <p
                    className="text-xs font-medium leading-tight"
                    style={{
                      color: isComplete ? '#10b981' : isActive ? '#fbbf24' : isSkipped ? '#64748b' : '#94a3b8',
                      maxWidth: '80px',
                    }}
                  >
                    {stage.shortLabel}
                  </p>
                </div>

                {/* Status pill or dropdown */}
                {activeDropdown === stage.key && editable && options ? (
                  <div
                    className="absolute z-20 flex flex-col gap-0.5 rounded-lg overflow-hidden"
                    style={{
                      background: 'rgba(6, 14, 26, 0.98)',
                      border: '1px solid rgba(34,211,238,0.2)',
                      minWidth: '160px',
                      top: '100%',
                      boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                    }}
                  >
                    {options.map((opt) => (
                      <button
                        key={opt}
                        className="text-left px-3 py-2 text-xs transition-colors"
                        style={{
                          color: status === opt ? '#22d3ee' : '#94a3b8',
                          background: status === opt ? 'rgba(34,211,238,0.1)' : 'transparent',
                        }}
                        onMouseEnter={(e) => { (e.target as HTMLElement).style.background = 'rgba(34,211,238,0.06)' }}
                        onMouseLeave={(e) => { (e.target as HTMLElement).style.background = status === opt ? 'rgba(34,211,238,0.1)' : 'transparent' }}
                        onClick={() => handleChange(stage.key, opt)}
                      >
                        {STATUS_LABELS[opt] || opt}
                      </button>
                    ))}
                  </div>
                ) : (
                  <StatusPill status={status} size="sm" />
                )}
              </div>

              {/* Connector line */}
              {index < stages.length - 1 && (
                <div
                  style={{
                    width: '28px',
                    height: '2px',
                    marginTop: '-2.5rem',
                    background: isComplete
                      ? 'rgba(16, 185, 129, 0.4)'
                      : 'rgba(34, 211, 238, 0.08)',
                    flexShrink: 0,
                  }}
                />
              )}
            </div>
          )
        })}
      </div>

      {/* Close dropdown on outside click */}
      {activeDropdown && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setActiveDropdown(null)}
        />
      )}

      {editable && (
        <p className="text-xs mt-2" style={{ color: '#374151' }}>
          Click a stage circle to quickly update its status
        </p>
      )}
    </div>
  )
}
