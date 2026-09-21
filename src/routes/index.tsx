import { useNavigate, createFileRoute } from '@tanstack/react-router';
import { InvoicesPage } from '@/features/invoices/InvoicesPage';
import type { InvoiceSortField } from '@/features/invoices/types';
import {
  nextSortSearch,
  parseInvoiceListSearch,
} from '@/features/invoices/search';

export const Route = createFileRoute('/')({
  component: RouteComponent,
  validateSearch: parseInvoiceListSearch,
});

function RouteComponent() {
  const navigate = useNavigate({ from: Route.fullPath });
  const search = Route.useSearch();

  function handleSortChange(field: InvoiceSortField) {
    navigate({
      search: (prev) => nextSortSearch(prev, field),
    });
  }

  function handlePageChange(page: number) {
    navigate({
      search: (prev) => ({ ...prev, page }),
    });
  }
  function handlePageSizeChange(pageSize: number) {
    navigate({
      search: (prev) => ({ ...prev, pageSize, page: 1 }),
    });
  }

  function handleQueryChange(q: string) {
    navigate({
      replace: true,
      search: (prev) => ({ ...prev, q, page: 1 }),
    });
  }

  return (
    <InvoicesPage
      onSortChange={handleSortChange}
      onPageChange={handlePageChange}
      onPageSizeChange={handlePageSizeChange}
      onQueryChange={handleQueryChange}
      search={search}
    />
  );
}
