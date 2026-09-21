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
  TextInput,
} from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { useInvoices } from './useInvoices';
import { InvoicesTable } from './InvoicesTable';
import type { InvoiceListSearch, InvoiceSortField } from './types';
import { useState, useEffect } from 'react';

type InvoicesPageProps = {
  search: InvoiceListSearch;
  onSortChange: (field: InvoiceSortField) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onQueryChange: (q: string) => void;
};

export function InvoicesPage({
  search,
  onSortChange,
  onPageChange,
  onPageSizeChange,
  onQueryChange,
}: InvoicesPageProps) {
  const [queryDraft, setQueryDraft] = useState(search.q);
  const [debouncedQuery] = useDebouncedValue(queryDraft, 300);

  useEffect(() => {
    if (debouncedQuery !== search.q) {
      onQueryChange(debouncedQuery);
    }
  }, [debouncedQuery, search.q, onQueryChange]);

  const { data, isPending, isError, isSuccess } = useInvoices(search);

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
              data={['10', '25', '50']}
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
      <Stack gap="xs" pb="xl">
        <Title order={1}>Invoices</Title>
        <TextInput
          maw={280}
          w="100%"
          label="Search invoices"
          value={queryDraft}
          placeholder="Customer or invoice number"
          onChange={(e) => setQueryDraft(e.currentTarget.value)}
        />
      </Stack>
      {renderContent()}
    </Container>
  );
}
