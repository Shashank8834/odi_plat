// ─────────────────────────────────────────────
// ODI Platform Constants
// ─────────────────────────────────────────────

export const STAGES = [
  { key: 'llpStatus', label: 'LLP Incorporation', shortLabel: 'LLP Incorp.', description: '15K+GST' },
  { key: 'indianBankStatus', label: 'LLP Bank Account', shortLabel: 'LLP Bank' },
  { key: 'odiStatus', label: 'ODI Status', shortLabel: 'ODI', description: '40K+GST' },
  { key: 'companyStatus', label: 'Subsidiary Formation', shortLabel: 'Subsidiary' },
  { key: 'foreignBankStatus', label: 'Foreign Bank A/C', shortLabel: 'FR Bank' },
  { key: 'fcgprStatus', label: 'FCGPR Filing', shortLabel: 'FCGPR' },
  { key: 'shareCertStatus', label: 'Share Certificate', shortLabel: 'Share Cert' },
  { key: 'form3Status', label: 'Form 3 Filing', shortLabel: 'Form 3' },
] as const

export type StageKey = (typeof STAGES)[number]['key']

// ─────────────────────────────────────────────
// STATUS ENUMS
// ─────────────────────────────────────────────

export const LLP_STATUS_OPTIONS = [
  'COMPLETED',
  'IN_PROCESS',
  'CANCELLED',
] as const

export const ODI_STATUS_OPTIONS = [
  'UIN_ALLOTTED',
  'IN_PROCESS',
  'NOT_REQUIRED',
] as const

export const BANK_STATUS_OPTIONS = [
  'OPENED',
  'IN_PROCESS',
  'BANK_SELECTED',
  'TO_START',
  'NOT_REQUIRED',
] as const

export const FOREIGN_BANK_STATUS_OPTIONS = [
  'OPENED',
  'DONE',
  'IN_PROCESS',
  'NOT_REQUIRED',
] as const

export const COMPANY_STATUS_OPTIONS = [
  'INCORPORATED',
  'COMPLETE',
  'NOT_REQUIRED',
  'NO_REPLY',
  'IN_PROCESS',
] as const

export const FCGPR_STATUS_OPTIONS = [
  'FILED',
  'TO_BE_FILED',
  'PENDING',
  'NA',
] as const

export const SHARE_CERT_STATUS_OPTIONS = [
  'SUBMITTED',
  'EMAILED',
  'PENDING',
  'TO_BE_CHECKED',
] as const

export const FORM3_STATUS_OPTIONS = [
  'FILED',
  'PENDING',
  'NA',
] as const

export const INVOICE_STATUS_OPTIONS = ['SENT', 'NOT_SENT', 'DRAFT'] as const
export const PAYMENT_STATUS_OPTIONS = ['PAID', 'PARTIALLY_PAID', 'TO_BE_PAID', 'TO_BE_DISCUSSED', 'INCORPORATION_PAID'] as const
export const FURTHER_WORK_OPTIONS = ['CONVERTED', 'MAY_COME', 'NO_REPLY', 'NONE'] as const

// Top-level project status set on every client (chosen at creation, edited later).
// Drives the dashboard buckets and the "Mark Complete" button on the tracker.
export const OVERALL_STATUS_OPTIONS = ['IN_PROCESS', 'TO_START', 'COMPLETED', 'CANCELLED'] as const
export type OverallStatus = (typeof OVERALL_STATUS_OPTIONS)[number]

export const BANK_OPTIONS = ['HDFC', 'Kotak', 'ICICI', 'Axis', 'DBS', 'HSBC', 'RBL', 'SC', 'Au Small Finance', 'Yes Bank', 'Deutsche']

// ─────────────────────────────────────────────
// STATUS DISPLAY LABELS
// ─────────────────────────────────────────────

export const STATUS_LABELS: Record<string, string> = {
  COMPLETED: 'Completed',
  UNKNOWN: 'Unknown',
  REGISTERED: 'Registered',
  IN_PROCESS: 'In Process',
  NAME_APPLIED: 'Name Applied',
  NAME_YET_TO_BE_APPLIED: 'Name Yet To Be Applied',
  INCORPORATION_FILED: 'Incorporation Filed',
  SHARE_ALLOTMENT: 'Share Allotment',
  CLIENT_HAS_ENTITY: 'Client Has Entity',
  ON_HOLD: 'On Hold',
  CANCELLED: 'Cancelled',
  TO_START: 'To Start',
  UIN_ALLOTTED: 'UIN Allotted',
  NOT_REQUIRED: 'Not Required',
  OPENED: 'Opened',
  BANK_SELECTED: 'Bank Selected',
  DONE: 'Done',
  INCORPORATED: 'Incorporated',
  COMPLETE: 'Complete',
  NO_REPLY: 'No Reply',
  FILED: 'Filed',
  TO_BE_FILED: 'To Be Filed',
  PENDING: 'Pending',
  NA: 'NA',
  SUBMITTED: 'Submitted',
  EMAILED: 'Emailed',
  TO_BE_CHECKED: 'To Be Checked',
  SENT: 'Sent',
  NOT_SENT: 'Not Sent',
  DRAFT: 'Draft',
  PAID: 'Paid',
  PARTIALLY_PAID: 'Partially Paid',
  TO_BE_PAID: 'To Be Paid',
  TO_BE_DISCUSSED: 'To Be Discussed',
  INCORPORATION_PAID: 'Incorporation Paid',
  CONVERTED: 'Converted',
  MAY_COME: 'May Come',
  NONE: 'None',
}

// ─────────────────────────────────────────────
// STATUS COLOR CLASSES (Tailwind)
// ─────────────────────────────────────────────

export const STATUS_COLORS: Record<string, string> = {
  // Purple — Unknown / needs review
  UNKNOWN: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  // Green — Complete/Done
  COMPLETED: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  REGISTERED: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  UIN_ALLOTTED: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  OPENED: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  DONE: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  COMPLETE: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  INCORPORATED: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  FILED: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  SUBMITTED: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  PAID: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  SENT: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  CONVERTED: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  // Amber — In Progress
  IN_PROCESS: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  PENDING: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  PARTIALLY_PAID: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  BANK_SELECTED: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  TO_BE_FILED: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  INCORPORATION_FILED: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  SHARE_ALLOTMENT: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  NAME_APPLIED: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  CLIENT_HAS_ENTITY: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  DRAFT: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  MAY_COME: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  ON_HOLD: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  // Red — Cancelled/Bad
  CANCELLED: 'bg-red-500/20 text-red-400 border-red-500/30',
  // Grey — Not Required/NA
  NOT_REQUIRED: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  NA: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  TO_START: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  NONE: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  // Blue — Informational
  EMAILED: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  TO_BE_CHECKED: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  TO_BE_DISCUSSED: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  TO_BE_PAID: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  NOT_SENT: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  NO_REPLY: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  NAME_YET_TO_BE_APPLIED: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
}

// ─────────────────────────────────────────────
// BUCKETING — collapses free-form historical
// values (e.g. "Project Cancel", "paid") onto
// the canonical enum values used by filters.
// ─────────────────────────────────────────────

export type LlpBucket = 'COMPLETED' | 'IN_PROCESS' | 'CANCELLED' | 'UNKNOWN'

export const LLP_FILTER_BUCKETS: LlpBucket[] = ['COMPLETED', 'IN_PROCESS', 'CANCELLED', 'UNKNOWN']

export function bucketLlpStatus(value: string | null | undefined): LlpBucket | null {
  if (!value) return null
  const s = value.toLowerCase().trim()
  if (s.includes('cancel') || s.includes('hold')) return 'CANCELLED'
  if (
    s.includes('registered') ||
    s.includes('completed') ||
    s.includes('complete') ||
    s.includes('done') ||
    s.includes('incorporated') ||
    s.includes('submitted') ||
    s.includes('filed')
  ) return 'COMPLETED'
  // Everything else (in process, to start, name applied, client has X,
  // individual-ODI, etc.) is treated as in-process work.
  return 'IN_PROCESS'
}

export type PaymentBucket = 'PAID' | 'PARTIALLY_PAID' | 'INCORPORATION_PAID' | 'TO_BE_DISCUSSED' | 'TO_BE_PAID'

export function bucketPaymentStatus(value: string | null | undefined): PaymentBucket | null {
  if (!value) return null
  const s = value.toLowerCase().trim()
  if (s.includes('partial')) return 'PARTIALLY_PAID'
  if (s.includes('incorp')) return 'INCORPORATION_PAID'
  if (s.includes('discuss')) return 'TO_BE_DISCUSSED'
  if (s.includes('to be paid') || s.includes('to pay') || s.includes('pending')) return 'TO_BE_PAID'
  if (s.includes('paid') || s.includes('received')) return 'PAID'
  return null
}

export type FurtherWorkBucket = 'CONVERTED' | 'MAY_COME' | 'NO_REPLY' | 'NONE'

export function bucketFurtherWork(value: string | null | undefined): FurtherWorkBucket | null {
  if (!value) return null
  const s = value.toLowerCase().trim()
  if (s.includes('convert')) return 'CONVERTED'
  if (s.includes('may come') || s.includes('maycome')) return 'MAY_COME'
  if (s.includes('no reply') || s.includes('noreply')) return 'NO_REPLY'
  if (s.includes('none')) return 'NONE'
  return null
}

// Resolves the top-level project status. If overallStatus is set explicitly
// (new clients), use it. Otherwise derive from llpStatus so historic rows
// imported before this field existed still land in a sensible bucket.
export function resolveOverallStatus(
  overallStatus: string | null | undefined,
  llpStatus: string | null | undefined,
): OverallStatus {
  if (overallStatus && (OVERALL_STATUS_OPTIONS as readonly string[]).includes(overallStatus)) {
    return overallStatus as OverallStatus
  }
  const llp = bucketLlpStatus(llpStatus)
  if (llp === 'COMPLETED') return 'COMPLETED'
  if (llp === 'CANCELLED') return 'CANCELLED'
  return 'IN_PROCESS'
}

export type OdiBucket = 'UIN_ALLOTTED' | 'IN_PROCESS' | 'NOT_REQUIRED' | 'TO_START'
export const ODI_FILTER_BUCKETS: OdiBucket[] = ['UIN_ALLOTTED', 'IN_PROCESS', 'TO_START', 'NOT_REQUIRED']
export function bucketOdiStatus(value: string | null | undefined): OdiBucket | null {
  if (!value) return null
  const s = value.toLowerCase().trim()
  if (s.includes('uin') || s.includes('allotted')) return 'UIN_ALLOTTED'
  if (s.includes('not required') || s === 'na') return 'NOT_REQUIRED'
  if (s === 'to start') return 'TO_START'
  return 'IN_PROCESS'
}

export type BankBucket = 'OPENED' | 'IN_PROCESS' | 'TO_START' | 'NOT_REQUIRED'
export const BANK_FILTER_BUCKETS: BankBucket[] = ['OPENED', 'IN_PROCESS', 'TO_START', 'NOT_REQUIRED']
export function bucketBankStatus(value: string | null | undefined): BankBucket | null {
  if (!value) return null
  const s = value.toLowerCase().trim()
  if (s.includes('not required') || s === 'na') return 'NOT_REQUIRED'
  if (s === 'to start') return 'TO_START'
  if (s.includes('opened') || s.includes('done') || s.includes('selected')) return 'OPENED'
  return 'IN_PROCESS'
}

export type CompanyBucket = 'COMPLETE' | 'IN_PROCESS' | 'NO_REPLY' | 'NOT_REQUIRED'
export const COMPANY_FILTER_BUCKETS: CompanyBucket[] = ['COMPLETE', 'IN_PROCESS', 'NO_REPLY', 'NOT_REQUIRED']
export function bucketCompanyStatus(value: string | null | undefined): CompanyBucket | null {
  if (!value) return null
  const s = value.toLowerCase().trim()
  if (s.includes('not required') || s === 'na' || s.includes('already exists')) return 'NOT_REQUIRED'
  if (s.includes('no reply')) return 'NO_REPLY'
  if (s.includes('complete') || s.includes('incorporated')) return 'COMPLETE'
  return 'IN_PROCESS'
}

export function prettifyStatus(value: string | null | undefined): string {
  if (!value) return '—'
  if (STATUS_LABELS[value]) return STATUS_LABELS[value]
  return value
    .toLowerCase()
    .split(/[\s\-_]+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

export const STAGE_OPTIONS: Record<string, readonly string[]> = {
  llpStatus: LLP_STATUS_OPTIONS,
  odiStatus: ODI_STATUS_OPTIONS,
  indianBankStatus: BANK_STATUS_OPTIONS,
  foreignBankStatus: FOREIGN_BANK_STATUS_OPTIONS,
  companyStatus: COMPANY_STATUS_OPTIONS,
  fcgprStatus: FCGPR_STATUS_OPTIONS,
  shareCertStatus: SHARE_CERT_STATUS_OPTIONS,
  form3Status: FORM3_STATUS_OPTIONS,
}
