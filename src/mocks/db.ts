import type { Invoice, InvoiceStatus } from '@/features/invoices/types';
import { generateInvoices } from './data';

export interface MockConfig {
  latencyMs: number;
  failureRate: number;
}

export const mockConfig: MockConfig = {
  latencyMs: 250,
  failureRate: 0.08,
};

let invoices = generateInvoices();

export function resetDb(seed?: number) {
  invoices = generateInvoices(seed);
}

export type SortField = 'number' | 'customerName' | 'amountCents' | 'dueAt';

export interface ListParams {
  status: InvoiceStatus[];
  q: string;
  sort: SortField;
  dir: 'asc' | 'desc';
  page: number;
  pageSize: number;
}

export interface ListResult {
  rows: Invoice[];
  total: number;
}

export function listInvoices(params: ListParams): ListResult {
  const query = params.q.trim().toLowerCase();

  let filtered = invoices;
  if (params.status.length > 0) {
    filtered = filtered.filter((invoice) =>
      params.status.includes(invoice.status),
    );
  }
  if (query.length > 0) {
    filtered = filtered.filter(
      (invoice) =>
        invoice.customerName.toLowerCase().includes(query) ||
        invoice.number.toLowerCase().includes(query),
    );
  }

  const sorted = [...filtered].sort((a, b) => {
    const left = a[params.sort];
    const right = b[params.sort];
    const comparison =
      typeof left === 'number' && typeof right === 'number'
        ? left - right
        : String(left).localeCompare(String(right));
    return params.dir === 'asc' ? comparison : -comparison;
  });

  const start = (params.page - 1) * params.pageSize;
  return {
    rows: sorted.slice(start, start + params.pageSize),
    total: filtered.length,
  };
}

export interface ReminderSuccess {
  id: string;
  ok: true;
  remindersSent: number;
}

export interface ReminderFailure {
  id: string;
  ok: false;
  error: string;
  retryable: boolean;
}

export type ReminderResult = ReminderSuccess | ReminderFailure;

const TRANSIENT_ERRORS = [
  'Mail provider timed out',
  'Rate limited by mail provider',
  'Temporary SMTP failure',
];

const REMINDABLE: InvoiceStatus[] = ['sent', 'overdue'];

export function sendReminders(
  ids: string[],
  random: () => number = Math.random,
): ReminderResult[] {
  return ids.map((id) => {
    const invoice = invoices.find((candidate) => candidate.id === id);

    if (!invoice) {
      return { id, ok: false, error: 'Invoice not found', retryable: false };
    }

    if (!REMINDABLE.includes(invoice.status)) {
      return {
        id,
        ok: false,
        error: `Cannot remind an invoice that is ${invoice.status}`,
        retryable: false,
      };
    }

    if (random() < mockConfig.failureRate) {
      const error =
        TRANSIENT_ERRORS[Math.floor(random() * TRANSIENT_ERRORS.length)];
      return { id, ok: false, error, retryable: true };
    }

    invoice.remindersSent += 1;
    return { id, ok: true, remindersSent: invoice.remindersSent };
  });
}
