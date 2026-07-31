import JSZip from 'jszip'
import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'

// ─────────────────────────────────────────────
// ODI DRAFT GENERATION
//
// Each AD bank wants the ODI paperwork in its own format, so we keep one
// folder of blank drafts per bank under app/templates/<bank>/ and stamp the
// client's details into a copy at download time.
//
// The drafts are legal submissions to the bank, so the fill is deliberately
// conservative: we only touch fields we can source from the client record
// with confidence. Everything else (remittance amounts, beneficiary bank
// details, PAN, DPIN, UDIN) stays blank for a human to complete.
// ─────────────────────────────────────────────

export const BANKS = {
  hdfc: { label: 'HDFC', legalName: 'HDFC Bank Limited' },
  icici: { label: 'ICICI', legalName: 'ICICI Bank Limited' },
  kotak: { label: 'Kotak', legalName: 'Kotak Mahindra Bank Limited' },
} as const

export type BankKey = keyof typeof BANKS

export function isBankKey(value: string): value is BankKey {
  return Object.hasOwn(BANKS, value)
}

const TEMPLATE_ROOT = path.join(process.cwd(), 'templates')

export interface ClientDetails {
  name: string
  partner: string | null
  email: string | null
}

// The bank names as they appear hard-coded in the draft bodies. Several drafts
// were cloned between banks without the addressee being updated, so we rewrite
// any of these to whichever bank was actually picked.
const ADDRESSEE_PATTERNS = [
  /ICICI\s+BANK\s+LTD\b\.?/gi,
  /ICICI\s+Bank\s+Limited/gi,
  /HDFC\s+Bank\s+Limited/gi,
  /Kotak\s+Mahindra\s+Bank\s+Limited/gi,
  /ICICI\s+Bank(?!\s+(?:Ltd|Limited))/gi,
  /HDFC\s+Bank(?!\s+(?:Ltd|Limited))/gi,
  /Kotak\s+Mahindra\s+Bank(?!\s+(?:Ltd|Limited))/gi,
]

// A run of the dotted leaders the drafts use as fill-in blanks ("For ………….").
const DOTS = '[…\\.]{4,}'

function todayInIndia(): string {
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    timeZone: 'Asia/Kolkata',
  }).format(new Date())
}

/**
 * Apply every substitution to one paragraph's worth of plain text.
 * Returns the text unchanged when nothing matched, which lets the caller skip
 * rewriting the paragraph and preserve its original run formatting.
 */
export function fillText(
  text: string,
  client: ClientDetails,
  bank: BankKey,
  /** Whether a "For ……" blank in this paragraph is the Indian entity's. */
  signatureIsIndianEntity = false,
): string {
  let out = text

  // Explicit merge tokens, so drafts can be marked up later without code changes.
  const tokens: Record<string, string> = {
    client_name: client.name,
    entity_name: client.name,
    contact_person: client.partner ?? '',
    email: client.email ?? '',
    bank_name: BANKS[bank].legalName,
    date: todayInIndia(),
  }
  out = out.replace(/\{\{\s*([a-z_]+)\s*\}\}/gi, (whole, key: string) => {
    const value = tokens[key.toLowerCase()]
    return value === undefined ? whole : value
  })

  // Point the draft at the bank the user actually chose.
  for (const pattern of ADDRESSEE_PATTERNS) {
    out = out.replace(pattern, BANKS[bank].legalName)
  }

  // Signature block: "For ……………" → "For <entity>". Anchored to the start of
  // the paragraph so we don't catch "For the purpose of ..." mid-sentence.
  //
  // Identical-looking blanks belong to three different parties:
  //   "For ……… & Co, Chartered Accountants"  → the CA firm
  //   "For ………INC" / "For ………" + Co-founder → the foreign entity
  //   "For ………" + DPIN/Authorised signatory → the Indian entity  ← ours
  // Only the last is filled; a wrong name on a bank submission is worse than
  // a blank one. `signatureIsIndianEntity` carries the surrounding-paragraph
  // evidence that fillText cannot see on its own.
  if (signatureIsIndianEntity) {
    out = out.replace(
      // The trailing dot lookahead forces the run of dots to be consumed
      // whole, so the exclusions below see the real end of the blank.
      new RegExp(`^(\\s*For\\s+)${DOTS}(?![….])(?!\\s*(?:&|and)\\s*Co\\b)(?![A-Za-z])`, 'i'),
      `$1${client.name}`,
    )
  }

  // Date fields that were left blank ("Date :", "Dated:  ", "DATE : ……").
  out = out.replace(
    new RegExp(`^(\\s*Dated?\\s*[:\\-])\\s*(?:${DOTS})?\\s*$`, 'i'),
    `$1 ${todayInIndia()}`,
  )

  return out
}

// ─────────────────────────────────────────────
// FORM FC table
//
// Form FC lays its fields out as [numeral | label | value] table rows, so the
// value has no textual blank for fillText to latch onto. We match on the label
// and write into the row's empty value cell instead.
// ─────────────────────────────────────────────

const FORM_FC_FIELDS: { label: RegExp; value: (c: ClientDetails, b: BankKey) => string | null }[] = [
  { label: /^Name,\s*Code of designated AD bank and branch$/i, value: (_c, b) => BANKS[b].legalName },
  { label: /^Name of IE\s*\/\s*RI\s*\/\s*Trust\s*\/\s*Society$/i, value: (c) => c.name },
  { label: /^Contact Person$/i, value: (c) => c.partner },
  { label: /^E-?mail ID$/i, value: (c) => c.email },
]

function cellText(cell: string): string {
  const runs = [...cell.matchAll(/<w:t(?:\s[^>]*)?>([\s\S]*?)<\/w:t>/g)]
  return runs.map((m) => decodeXml(m[1])).join('').replace(/\s+/g, ' ').trim()
}

/** Append a text run to the last paragraph of a table cell. */
function writeIntoCell(cell: string, text: string): string {
  const run = `<w:r><w:t xml:space="preserve">${encodeXml(text)}</w:t></w:r>`
  const close = cell.lastIndexOf('</w:p>')
  if (close === -1) return cell
  return cell.slice(0, close) + run + cell.slice(close)
}

function fillFormFcTables(xml: string, client: ClientDetails, bank: BankKey): string {
  return xml.replace(/<w:tr(?:\s[^>]*)?>[\s\S]*?<\/w:tr>/g, (row) => {
    const cells = [...row.matchAll(/<w:tc(?:\s[^>]*)?>[\s\S]*?<\/w:tc>/g)].map((m) => m[0])
    if (cells.length !== 3) return row

    const label = cellText(cells[1])
    const field = FORM_FC_FIELDS.find((f) => f.label.test(label))
    if (!field) return row

    const value = field.value(client, bank)
    // Never overwrite a cell that already has something in it.
    if (!value || cellText(cells[2]) !== '') return row

    return row.replace(cells[2], writeIntoCell(cells[2], value))
  })
}

/**
 * Rewrite the text of a WordprocessingML part.
 *
 * Word splits a single visible sentence across many <w:t> runs, so a match can
 * straddle run boundaries. We therefore work per paragraph: concatenate its
 * runs, substitute, and — only if something changed — push the whole result
 * into the paragraph's first <w:t> and blank the rest. That collapses mixed
 * formatting within a changed paragraph, which is an acceptable trade for
 * paragraphs that are plain body text; untouched paragraphs keep their runs.
 */
const PARAGRAPH = /<w:p(?:\s[^>]*)?>[\s\S]*?<\/w:p>|<w:p\s[^>]*\/>/g

/** Text of a paragraph's runs, concatenated and entity-decoded. */
function paragraphText(paragraph: string): string {
  return [...paragraph.matchAll(/<w:t(?:\s[^>]*)?>([\s\S]*?)<\/w:t>/g)]
    .map((m) => decodeXml(m[1]))
    .join('')
}

// Who signs. The Indian entity signs as a designated partner with a DPIN; the
// foreign entity signs as a co-founder/director.
const INDIAN_SIGNATORY = /\bDPIN\b|Authori[sz]ed\s+signatory|Designated\s+Partner/i
const FOREIGN_SIGNATORY = /Co-?founder/i

/**
 * How many non-empty lines past a "For ……" to look for evidence of who is
 * signing. Signature blocks are padded with empty paragraphs for spacing, so
 * the budget counts content lines only (name, designation, DPIN).
 */
const SIGNATURE_LOOKAHEAD = 6

function fillPartXml(xml: string, client: ClientDetails, bank: BankKey): string {
  // Pre-scan so each paragraph can consult the ones after it.
  const texts = [...xml.matchAll(PARAGRAPH)].map((m) => paragraphText(m[0]))

  /** Does the signature block starting at `i` belong to the Indian entity? */
  const isIndianSignature = (i: number): boolean => {
    let budget = SIGNATURE_LOOKAHEAD
    for (let j = i + 1; j < texts.length && budget > 0; j++) {
      const t = texts[j]
      if (!t.trim()) continue
      budget -= 1
      // Whichever marker appears first wins.
      if (FOREIGN_SIGNATORY.test(t)) return false
      if (INDIAN_SIGNATORY.test(t)) return true
    }
    return false
  }

  let index = -1
  return xml.replace(PARAGRAPH, (paragraph) => {
    index += 1
    const runs = [...paragraph.matchAll(/<w:t(?:\s[^>]*)?>([\s\S]*?)<\/w:t>/g)]
    if (runs.length === 0) return paragraph

    const original = runs.map((m) => decodeXml(m[1])).join('')
    if (!original.trim()) return paragraph

    const filled = fillText(original, client, bank, isIndianSignature(index))
    if (filled === original) return paragraph

    let seen = 0
    return paragraph.replace(/(<w:t)((?:\s[^>]*)?)(>)([\s\S]*?)(<\/w:t>)/g, (_m, open, attrs, close, _body, end) => {
      const body = seen === 0 ? encodeXml(filled) : ''
      seen += 1
      // xml:space="preserve" keeps leading/trailing spaces from being dropped.
      const withSpace = /xml:space=/.test(attrs) ? attrs : `${attrs} xml:space="preserve"`
      return `${open}${withSpace}${close}${body}${end}`
    })
  })
}

function decodeXml(s: string): string {
  return s
    .replace(/<[^>]+>/g, '')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&')
}

function encodeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

// Body, headers and footers all carry fillable text in these drafts.
const FILLABLE_PART = /^word\/(document|header\d*|footer\d*)\.xml$/

async function fillDocx(buffer: Buffer, client: ClientDetails, bank: BankKey): Promise<Buffer> {
  const doc = await JSZip.loadAsync(buffer)

  for (const name of Object.keys(doc.files)) {
    if (!FILLABLE_PART.test(name)) continue
    const xml = await doc.file(name)!.async('string')
    // Tables first: fillPartXml rewrites paragraphs, and the label cells it
    // would touch are the ones the table pass matches on.
    doc.file(name, fillPartXml(fillFormFcTables(xml, client, bank), client, bank))
  }

  return doc.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' })
}

/** Strip characters Windows/macOS reject in filenames. */
function safeFilename(s: string): string {
  return s.replace(/[<>:"/\|?*]/g, '').replace(/\s+/g, ' ').trim() || 'client'
}

export interface GeneratedBundle {
  filename: string
  buffer: Buffer
  /** Drafts we could not fill (legacy .doc, .pdf) — passed through untouched. */
  passedThrough: string[]
}

/**
 * Build the ZIP of a bank's ODI drafts with the client's details stamped in.
 */
export async function generateBundle(
  bank: BankKey,
  client: ClientDetails,
): Promise<GeneratedBundle> {
  const dir = path.join(TEMPLATE_ROOT, bank)
  const entries = await readdir(dir, { withFileTypes: true })

  const bundle = new JSZip()
  const passedThrough: string[] = []

  for (const entry of entries) {
    if (!entry.isFile()) continue
    const source = await readFile(path.join(dir, entry.name))

    // Only Office Open XML (.docx) can be filled. Legacy .doc is a binary
    // compound file and .pdf is not editable here — ship them as-is.
    if (entry.name.toLowerCase().endsWith('.docx')) {
      bundle.file(entry.name, await fillDocx(source, client, bank))
    } else {
      bundle.file(entry.name, source)
      passedThrough.push(entry.name)
    }
  }

  const buffer = await bundle.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' })

  return {
    filename: `${safeFilename(client.name)} - ${BANKS[bank].label} ODI Drafts.zip`,
    buffer,
    passedThrough,
  }
}
