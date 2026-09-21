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

  return <InvoicesPage onSortChange={handleSortChange} search={search} />;
}
