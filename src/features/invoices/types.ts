export const INVOICE_STATUSES = [
  'draft',
  'sent',
  'paid',
  'overdue',
  'void',
] as const

export type InvoiceStatus = (typeof INVOICE_STATUSES)[number]

export interface Invoice {
  id: string
  number: string
  customerName: string
  customerEmail: string
  amountCents: number
  currency: 'EUR'
  issuedAt: string
  dueAt: string
  status: InvoiceStatus
  remindersSent: number
}
