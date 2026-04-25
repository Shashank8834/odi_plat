// ─────────────────────────────────────────────
// ODI Platform Constants
// ─────────────────────────────────────────────

export const STAGES = [
  { key: 'llpStatus', label: 'LLP Registration', shortLabel: 'LLP', description: '15K+GST' },
  { key: 'odiStatus', label: 'ODI (UIN)', shortLabel: 'ODI', description: '40K+GST' },
  { key: 'indianBankStatus', label: 'Indian Bank A/C', shortLabel: 'IN Bank' },
  { key: 'foreignBankStatus', label: 'Foreign Bank A/C', shortLabel: 'FR Bank' },
  { key: 'companyStatus', label: 'Company Incorporation', shortLabel: 'Company' },
  { key: 'fcgprStatus', label: 'FCGPR Filing', shortLabel: 'FCGPR' },
  { key: 'shareCertStatus', label: 'Share Certificate', shortLabel: 'Share Cert' },
  { key: 'form3Status', label: 'Form 3 Filing', shortLabel: 'Form 3' },
] as const

export type StageKey = (typeof STAGES)[number]['key']

// ─────────────────────────────────────────────
// STATUS ENUMS
// ─────────────────────────────────────────────

export const LLP_STATUS_OPTIONS = [
  'REGISTERED',
  'IN_PROCESS',
  'NAME_APPLIED',
  'NAME_YET_TO_BE_APPLIED',
  'INCORPORATION_FILED',
  'SHARE_ALLOTMENT',
  'CLIENT_HAS_ENTITY',
  'ON_HOLD',
  'CANCELLED',
  'TO_START',
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

export const BANK_OPTIONS = ['HDFC', 'Kotak', 'ICICI', 'Axis', 'DBS', 'HSBC', 'RBL', 'SC', 'Au Small Finance', 'Yes Bank', 'Deutsche']

// ─────────────────────────────────────────────
// STATUS DISPLAY LABELS
// ─────────────────────────────────────────────

export const STATUS_LABELS: Record<string, string> = {
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
  // Green — Complete/Done
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
