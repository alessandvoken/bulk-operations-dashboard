import type { Invoice, InvoiceListSearch } from './types';

export type InvoiceListResponse = {
  rows: Invoice[];
  total: number;
};

export async function fetchInvoices(
  search: InvoiceListSearch,
): Promise<InvoiceListResponse> {
  const params = new URLSearchParams();

  params.set('page', String(search.page));
  params.set('pageSize', String(search.pageSize));
  params.set('sort', search.sort);
  params.set('dir', search.dir);
  params.set('q', search.q);

  const res = await fetch(`/api/invoices?${params}`);

  if (!res.ok) {
    throw new Error(`fetchInvoices ${res.status}`);
  }
  return res.json();
}
