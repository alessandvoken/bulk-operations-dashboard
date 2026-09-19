import type { Invoice } from './types';

export type InvoiceListResponse = {
  rows: Invoice[];
  total: number;
};

export async function fetchInvoices(): Promise<InvoiceListResponse> {
  const res = await fetch('/api/invoices');

  if (!res.ok) {
    throw new Error(`fetchInvoices ${res.status}`);
  }
  return res.json();
}
