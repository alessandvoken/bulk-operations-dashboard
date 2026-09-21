import { useNavigate, createFileRoute } from '@tanstack/react-router';
import { InvoicesPage } from '@/features/invoices/InvoicesPage';
import { INVOICE_SORT_FIELDS } from '@/features/invoices/types';

import type {
  InvoiceListSearch,
  InvoiceSortField,
} from '@/features/invoices/types';

const DEFAULT_INVOICE_SEARCH: InvoiceListSearch = {
  page: 1,
  pageSize: 25,
  sort: 'dueAt',
  dir: 'asc',
};

export const Route = createFileRoute('/')({
  validateSearch: (search): InvoiceListSearch => {
    const page = toPositiveInteger(search.page, DEFAULT_INVOICE_SEARCH.page);
    const pageSize = toPositiveInteger(
      search.pageSize,
      DEFAULT_INVOICE_SEARCH.pageSize,
    );
    const sort = isInvoiceSortField(search.sort)
      ? search.sort
      : DEFAULT_INVOICE_SEARCH.sort;
    const dir =
      search.dir === 'asc' || search.dir === 'desc'
        ? search.dir
        : DEFAULT_INVOICE_SEARCH.dir;

    return {
      page,
      pageSize,
      sort,
      dir,
    };
  },
  component: RouteComponent,
});

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

function RouteComponent() {
  const navigate = useNavigate({ from: Route.fullPath });
  const search = Route.useSearch();

  function handleSortChange(field: InvoiceSortField) {
    navigate({
      search: (prev) => ({
        ...prev,
        sort: field,
        dir: prev.sort === field && prev.dir === 'asc' ? 'desc' : 'asc',
        page: 1,
      }),
    });
  }

  return <InvoicesPage onSortChange={handleSortChange} search={search} />;
}
