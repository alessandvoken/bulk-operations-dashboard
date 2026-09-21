import {
  Alert,
  Container,
  Paper,
  Skeleton,
  Stack,
  Title,
  Text,
  Pagination,
} from '@mantine/core';
import { useInvoices } from './useInvoices';
import { InvoicesTable } from './InvoicesTable';
import type { InvoiceListSearch, InvoiceSortField } from './types';

type InvoicesPageProps = {
  search: InvoiceListSearch;
  onSortChange: (field: InvoiceSortField) => void;
  onPageChange: (page: number) => void;
};

export function InvoicesPage({
  search,
  onSortChange,
  onPageChange,
}: InvoicesPageProps) {
  const { data, isPending, isError, isSuccess } = useInvoices(search);

  function renderContent() {
    if (isPending) {
      return (
        <Stack gap="sm">
          <Skeleton height={32} />
          <Skeleton height={24} />
          <Skeleton height={24} />
          <Skeleton height={24} />
          <Skeleton height={24} />
          <Skeleton height={24} />
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
          />
          <Pagination
            total={totalPages}
            value={search.page}
            onChange={onPageChange}
          />
        </Stack>
      );
    }

    return null;
  }

  return (
    <Container size="lg" py="xl">
      <Stack gap="xs" pb="xl">
        <Title order={1}>Invoices</Title>
      </Stack>
      {renderContent()}
    </Container>
  );
}
