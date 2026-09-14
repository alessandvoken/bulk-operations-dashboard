import { HttpResponse, delay, http } from 'msw'
import {
  INVOICE_STATUSES,
  type InvoiceStatus,
} from '@/features/invoices/types'
import { type SortField, listInvoices, mockConfig, sendReminders } from './db'

const MAX_BATCH_SIZE = 50

const SORT_FIELDS: SortField[] = [
  'number',
  'customerName',
  'amountCents',
  'dueAt',
]

function parseStatuses(url: URL): InvoiceStatus[] {
  const allowed: readonly string[] = INVOICE_STATUSES
  return url.searchParams
    .getAll('status')
    .filter((value): value is InvoiceStatus => allowed.includes(value))
}

function parseSort(url: URL): SortField {
  const value = url.searchParams.get('sort')
  return SORT_FIELDS.find((field) => field === value) ?? 'dueAt'
}

function parsePositiveInt(value: string | null, fallback: number) {
  const parsed = Number(value)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback
}

export const handlers = [
  http.get('/api/invoices', async ({ request }) => {
    const url = new URL(request.url)

    await delay(mockConfig.latencyMs)

    return HttpResponse.json(
      listInvoices({
        status: parseStatuses(url),
        q: url.searchParams.get('q') ?? '',
        sort: parseSort(url),
        dir: url.searchParams.get('dir') === 'asc' ? 'asc' : 'desc',
        page: parsePositiveInt(url.searchParams.get('page'), 1),
        pageSize: parsePositiveInt(url.searchParams.get('pageSize'), 25),
      }),
    )
  }),

  http.post('/api/invoices/reminders', async ({ request }) => {
    const body = (await request.json()) as { ids?: unknown }
    const ids = Array.isArray(body.ids)
      ? body.ids.filter((id): id is string => typeof id === 'string')
      : []

    if (ids.length === 0) {
      return HttpResponse.json(
        { message: 'ids must be a non-empty array of strings' },
        { status: 400 },
      )
    }

    if (ids.length > MAX_BATCH_SIZE) {
      return HttpResponse.json(
        { message: `Batch size cannot exceed ${MAX_BATCH_SIZE}` },
        { status: 413 },
      )
    }

    await delay(mockConfig.latencyMs)

    return HttpResponse.json({ results: sendReminders(ids) })
  }),
]
