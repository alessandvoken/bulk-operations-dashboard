import {
  Alert,
  Container,
  Paper,
  Skeleton,
  Stack,
  Title,
  Text,
  Pagination,
  Select,
  Group,
} from '@mantine/core';
import { SelectionBar } from '@/components/SelectionBar';
import { InvoiceSearchInput } from './InvoiceSearchInput';
import { useInvoices } from './useInvoices';
import { InvoiceStatusFilter } from './InvoiceStatusFilter';
import { InvoicesTable } from './InvoicesTable';
import {
  INVOICE_PAGE_SIZES,
  type InvoiceListSearch,
  type InvoiceSortField,
  type InvoiceStatus,
} from './types';
import { useRowSelection } from '@/hooks/useRowSelection';

type InvoicesPageProps = {
  search: InvoiceListSearch;
  onSortChange: (field: InvoiceSortField) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onQueryChange: (q: string) => void;
  onStatusChange: (status: InvoiceStatus[]) => void;
};

export function InvoicesPage({
  search,
  onSortChange,
  onPageChange,
  onPageSizeChange,
  onQueryChange,
  onStatusChange,
}: InvoicesPageProps) {
  const { data, isPending, isError, isSuccess } = useInvoices(search);
  const { selected, toggle, setMany, selectedIds, clear } = useRowSelection();

  function renderContent() {
    if (isPending) {
      return (
        <Stack gap="sm">
          <Skeleton height={32} />
          {Array.from({ length: search.pageSize }, (_, index) => (
            <Skeleton key={index} height={24} />
          ))}
        </Stack>
      );
    }

    if (isError) {
      return (
        <Alert color="red" title="Could not load invoices">
          Try refreshing the page.
        </Alert>
      );
    }

    if (isSuccess) {
      const totalPages = Math.ceil(data.total / search.pageSize);
      if (data.rows.length === 0) {
        return (
          <Paper withBorder p="md" radius="md">
            <Text>No invoices found.</Text>
          </Paper>
        );
      }

      return (
        <Stack>
          <InvoicesTable
            rows={data.rows}
            sort={search.sort}
            dir={search.dir}
            onSortChange={onSortChange}
            selected={selected}
            onRowToggle={toggle}
            onRowsSelect={setMany}
          />
          <Group justify="space-between" align="flex-end">
            <Pagination
              total={totalPages}
              value={search.page}
              onChange={onPageChange}
            />
            <Select
              label="Rows per page"
              checkIconPosition="right"
              data={INVOICE_PAGE_SIZES.map(String)}
              value={String(search.pageSize)}
              onChange={(value) => {
                if (value !== null) {
                  onPageSizeChange(Number(value));
                }
              }}
            />
          </Group>
        </Stack>
      );
    }

    return null;
  }

  return (
    <Container size="lg" py="xl">
      <Stack gap="xs" pb="lg">
        <Title order={1}>Invoices</Title>
        <InvoiceSearchInput query={search.q} onQueryChange={onQueryChange} />
        <InvoiceStatusFilter value={search.status} onChange={onStatusChange} />
      </Stack>
      <SelectionBar count={selectedIds.length} onClear={clear} />
      {renderContent()}
    </Container>
  );
}
