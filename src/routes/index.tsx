import {
  useNavigate,
  createFileRoute,
  stripSearchParams,
} from '@tanstack/react-router';
import { InvoicesPage } from '@/features/invoices/InvoicesPage';
import type {
  InvoiceSortField,
  InvoiceStatus,
} from '@/features/invoices/types';
import {
  DEFAULT_INVOICE_SEARCH,
  nextSortSearch,
  parseInvoiceListSearch,
} from '@/features/invoices/search';

export const Route = createFileRoute('/')({
  component: RouteComponent,
  validateSearch: parseInvoiceListSearch,
  search: {
    middlewares: [stripSearchParams(DEFAULT_INVOICE_SEARCH)],
  },
});

function RouteComponent() {
  const navigate = useNavigate({ from: Route.fullPath });
  const search = Route.useSearch();

  function handleSortChange(field: InvoiceSortField) {
    navigate({
      resetScroll: false,
      search: (prev) => nextSortSearch(prev, field),
    });
  }

  function handlePageChange(page: number) {
    navigate({
      resetScroll: false,
      search: (prev) => ({ ...prev, page }),
    });
  }
  function handlePageSizeChange(pageSize: number) {
    navigate({
      resetScroll: false,
      search: (prev) => ({ ...prev, pageSize, page: 1 }),
    });
  }

  function handleQueryChange(q: string) {
    navigate({
      replace: true,
      resetScroll: false,
      search: (prev) => ({ ...prev, q, page: 1 }),
    });
  }

  function handleStatusChange(status: InvoiceStatus[]) {
    navigate({
      resetScroll: false,
      search: (prev) => ({ ...prev, status, page: 1 }),
    });
  }

  return (
    <InvoicesPage
      onSortChange={handleSortChange}
      onPageChange={handlePageChange}
      onPageSizeChange={handlePageSizeChange}
      onQueryChange={handleQueryChange}
      onStatusChange={handleStatusChange}
      search={search}
    />
  );
}
