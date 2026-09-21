import type { InvoiceListSearch, InvoiceSortField } from './types';
import { INVOICE_SORT_FIELDS } from './types';

const DEFAULT_INVOICE_SEARCH: InvoiceListSearch = {
  page: 1,
  pageSize: 25,
  sort: 'dueAt',
  dir: 'asc',
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

export function parseInvoiceListSearch(
  raw: Record<string, unknown>,
): InvoiceListSearch {
  const page = toPositiveInteger(raw.page, DEFAULT_INVOICE_SEARCH.page);
  const pageSize = toPositiveInteger(
    raw.pageSize,
    DEFAULT_INVOICE_SEARCH.pageSize,
  );
  const sort = isInvoiceSortField(raw.sort)
    ? raw.sort
    : DEFAULT_INVOICE_SEARCH.sort;
  const dir =
    raw.dir === 'asc' || raw.dir === 'desc'
      ? raw.dir
      : DEFAULT_INVOICE_SEARCH.dir;

  return {
    page,
    pageSize,
    sort,
    dir,
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
