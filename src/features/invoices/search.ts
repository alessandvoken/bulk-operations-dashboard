import type {
  InvoiceListSearch,
  InvoiceSortField,
  InvoiceStatus,
} from './types';
import {
  INVOICE_SORT_FIELDS,
  INVOICE_PAGE_SIZES,
  INVOICE_STATUSES,
} from './types';

const DEFAULT_INVOICE_SEARCH: InvoiceListSearch = {
  page: 1,
  pageSize: 25,
  sort: 'dueAt',
  dir: 'asc',
  q: '',
  status: [],
};

function toPositiveInteger(value: unknown, fallback: number) {
  const parsed = Number(value);

  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function isInvoiceSortField(value: unknown): value is InvoiceSortField {
  return (
    typeof value === 'string' &&
    INVOICE_SORT_FIELDS.includes(value as InvoiceSortField)
  );
}

function parseInvoiceStatuses(value: unknown): InvoiceStatus[] {
  const candidates: unknown[] = Array.isArray(value)
    ? value
    : typeof value === 'string'
      ? [value]
      : [];

  return INVOICE_STATUSES.filter((status) => candidates.includes(status));
}

export function parseInvoiceListSearch(
  raw: Record<string, unknown>,
): InvoiceListSearch {
  const page = toPositiveInteger(raw.page, DEFAULT_INVOICE_SEARCH.page);

  const parsedPageSize = Number(raw.pageSize);

  const pageSize = INVOICE_PAGE_SIZES.some((size) => size === parsedPageSize)
    ? parsedPageSize
    : DEFAULT_INVOICE_SEARCH.pageSize;

  const sort = isInvoiceSortField(raw.sort)
    ? raw.sort
    : DEFAULT_INVOICE_SEARCH.sort;
  const dir =
    raw.dir === 'asc' || raw.dir === 'desc'
      ? raw.dir
      : DEFAULT_INVOICE_SEARCH.dir;

  const q = typeof raw.q === 'string' ? raw.q : DEFAULT_INVOICE_SEARCH.q;

  const status = parseInvoiceStatuses(raw.status);

  return {
    page,
    pageSize,
    sort,
    dir,
    q,
    status,
  };
}

export function nextSortSearch(
  prev: InvoiceListSearch,
  field: InvoiceSortField,
): InvoiceListSearch {
  return {
    ...prev,
    sort: field,
    dir: prev.sort === field && prev.dir === 'asc' ? 'desc' : 'asc',
    page: 1,
  };
}
