export const INVOICE_STATUSES = [
  'draft',
  'sent',
  'paid',
  'overdue',
  'void',
] as const;

export type InvoiceStatus = (typeof INVOICE_STATUSES)[number];

export interface Invoice {
  id: string;
  number: string;
  customerName: string;
  customerEmail: string;
  amountCents: number;
  currency: 'EUR';
  issuedAt: string;
  dueAt: string;
  status: InvoiceStatus;
  remindersSent: number;
}

export const INVOICE_SORT_FIELDS = [
  'number',
  'customerName',
  'amountCents',
  'dueAt',
] as const satisfies readonly (keyof Invoice)[];

export type InvoiceSortField = (typeof INVOICE_SORT_FIELDS)[number];

export type InvoiceListSearch = {
  page: number;
  pageSize: number;
  sort: InvoiceSortField;
  dir: 'asc' | 'desc';
  q: string;
};
