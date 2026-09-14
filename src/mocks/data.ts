import type { Invoice, InvoiceStatus } from '@/features/invoices/types'

const INVOICE_COUNT = 500

const COMPANIES = [
  'Acme Logistics',
  'Blau Energie',
  'Cortex Analytics',
  'Delta Marittima',
  'Estúdio Norte',
  'Fjord Systems',
  'Gruppo Ferrante',
  'Helvetia Print',
  'Ionio Cantieri',
  'Jansen Bouw',
  'Kestrel Media',
  'Lumen Ottica',
  'Meridiana Viaggi',
  'Nordisk Tekstil',
  'Officine Rossi',
  'Pallas Consulting',
  'Quercia Legno',
  'Radler Sport',
  'Sirio Robotica',
  'Tramontana Vini',
]

const TLDS = ['com', 'de', 'it', 'nl', 'fr', 'es']

const COMBINING_MARKS = new RegExp('[\\u0300-\\u036f]', 'g')

function mulberry32(seed: number) {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function slugify(value: string) {
  return value
    .normalize('NFD')
    .replace(COMBINING_MARKS, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function addDays(date: Date, days: number) {
  const next = new Date(date)
  next.setUTCDate(next.getUTCDate() + days)
  return next
}

function isoDate(date: Date) {
  return date.toISOString().slice(0, 10)
}

function pick<T>(random: () => number, items: readonly T[]) {
  return items[Math.floor(random() * items.length)]
}

function statusFor(
  random: () => number,
  dueAt: Date,
  now: Date,
): InvoiceStatus {
  const roll = random()
  if (roll < 0.06) return 'draft'
  if (roll < 0.1) return 'void'
  if (roll < 0.55) return 'paid'
  return dueAt < now ? 'overdue' : 'sent'
}

export function generateInvoices(seed = 20260914, now = new Date()): Invoice[] {
  const random = mulberry32(seed)
  const invoices: Invoice[] = []

  for (let i = 0; i < INVOICE_COUNT; i += 1) {
    const customerName = pick(random, COMPANIES)
    const issuedAt = addDays(now, -Math.floor(random() * 180))
    const dueAt = addDays(issuedAt, pick(random, [14, 30, 45, 60]))
    const status = statusFor(random, dueAt, now)

    invoices.push({
      id: `inv_${String(i + 1).padStart(4, '0')}`,
      number: `INV-${issuedAt.getUTCFullYear()}-${String(i + 1).padStart(4, '0')}`,
      customerName,
      customerEmail: `billing@${slugify(customerName)}.${pick(random, TLDS)}`,
      amountCents: (Math.floor(random() * 24_000) + 1_000) * 10,
      currency: 'EUR',
      issuedAt: isoDate(issuedAt),
      dueAt: isoDate(dueAt),
      status,
      remindersSent: status === 'overdue' ? Math.floor(random() * 3) : 0,
    })
  }

  return invoices
}
