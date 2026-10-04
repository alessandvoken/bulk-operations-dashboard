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
  Button,
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
import { useBulkOperations } from '@/hooks/useBulkOperations';
import { sendReminders, REMINDERS_BATCH_SIZE } from './api';
import { useRef } from 'react';

import { flushSync } from 'react-dom';
import { useQueryClient } from '@tanstack/react-query';

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
  const selectionScope = JSON.stringify([search.q, search.status]);
  const { selected, toggle, setMany, selectedIds, clear } =
    useRowSelection(selectionScope);

  const { run, status, total, processed } = useBulkOperations({
    operation: sendReminders,
    batchSize: REMINDERS_BATCH_SIZE,
  });

  const queryClient = useQueryClient();

  const selectAllRef = useRef<HTMLInputElement>(null);

  function handleClear() {
    flushSync(() => {
      clear();
    });
    selectAllRef.current?.focus();
  }

  function getRunMessage(): string | null {
    if (status === 'running') {
      return `Sending reminders: ${processed} of ${total}`;
    }
    if (status === 'done') {
      return `Reminders processed: ${processed} of ${total}`;
    }
    return null;
  }

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
            selectAllRef={selectAllRef}
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
    <Container size="lg" py="lg">
      <Stack gap="md" pb="lg">
        <Title order={1}>Invoices</Title>
        <InvoiceSearchInput query={search.q} onQueryChange={onQueryChange} />
        <InvoiceStatusFilter value={search.status} onChange={onStatusChange} />
      </Stack>
      <Stack gap="xs">
        <SelectionBar
          count={selectedIds.length}
          onClear={handleClear}
          message={getRunMessage()}
        >
          <Button
            size="xs"
            onClick={async () => {
              await run(selectedIds);
              queryClient.invalidateQueries({ queryKey: ['invoices'] });
            }}
            data-disabled={status === 'running'}
            aria-disabled={status === 'running'}
          >
            Send reminders
          </Button>
        </SelectionBar>
        {renderContent()}
      </Stack>
    </Container>
  );
}
