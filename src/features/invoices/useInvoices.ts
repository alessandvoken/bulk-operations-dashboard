import { useQuery } from '@tanstack/react-query';
import { fetchInvoices } from './api';
import type { InvoiceListSearch } from './types';

export function useInvoices(search: InvoiceListSearch) {
  return useQuery({
    queryKey: ['invoices', search],
    queryFn: () => fetchInvoices(search),
  });
}
