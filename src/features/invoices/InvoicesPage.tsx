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
  Tooltip,
  Loader,
  Box,
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
import classes from './InvoicesPage.module.css';
import motion from '@/components/motion.module.css';
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
  const { data, isPending, isError, isSuccess, isPlaceholderData } =
    useInvoices(search);
  const selectionScope = JSON.stringify([search.q, search.status]);
  const { selected, toggle, setMany, selectedIds, clear } =
    useRowSelection(selectionScope);

  const queryClient = useQueryClient();

  const {
    schedule,
    status,
    total,
    processed,
    outcomes,
    succeeded,
    failed,
    retryableIds,
    cancel,
    pause,
    resume,
  } = useBulkOperations({
    operation: sendReminders,
    batchSize: REMINDERS_BATCH_SIZE,
    onFinished: () => queryClient.invalidateQueries({ queryKey: ['invoices'] }),
  });

  const permanentFailures = failed - retryableIds.length;

  const isBusy = status === 'scheduled' || status === 'running';

  const selectAllRef = useRef<HTMLInputElement>(null);

  function handleClear() {
    flushSync(() => {
      clear();
    });
    selectAllRef.current?.focus();
  }

  function handleRetry() {
    selectAllRef.current?.focus();
    schedule(retryableIds);
  }

  function handleUndo() {
    selectAllRef.current?.focus();
    cancel();
  }

  function getRunMessage(): string | null {
    if (status === 'scheduled') {
      return `Reminders: ${total} queued`;
    }

    if (status === 'running') {
      return `Sending reminders: ${processed} of ${total}`;
    }

    if (status === 'done') {
      if (failed === 0) {
        return `Reminders: ${succeeded} sent`;
      }
      return `Reminders: ${succeeded} sent, ${failed} failed`;
    }

    if (status === 'cancelled') {
      return `Reminders: ${total} cancelled`;
    }

    return null;
  }

  function renderRunAction() {
    if (isBusy) {
      return (
        <Button
          size="xs"
          variant="outline"
          className={motion.appear}
          disabled={status === 'running'}
          onClick={handleUndo}
          onFocus={pause}
          onBlur={resume}
        >
          Undo
        </Button>
      );
    }

    if (
      (status === 'done' || status === 'cancelled') &&
      retryableIds.length > 0
    ) {
      return (
        <Tooltip
          label="Only temporary errors can be retried"
          events={{ hover: true, focus: true, touch: false }}
          disabled={permanentFailures === 0}
          withArrow
        >
          <Button
            size="xs"
            variant="default"
            className={motion.appear}
            onClick={handleRetry}
          >
            Retry {retryableIds.length} failed
          </Button>
        </Tooltip>
      );
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
      const firstRow = (search.page - 1) * search.pageSize + 1;
      const lastRow = Math.min(search.page * search.pageSize, data.total);
      if (data.rows.length === 0) {
        return (
          <Paper withBorder p="md" radius="md">
            <Text>No invoices found.</Text>
          </Paper>
        );
      }

      return (
        <Stack>
          <Box
            aria-busy={isPlaceholderData}
            className={isPlaceholderData ? classes.stale : undefined}
          >
            <InvoicesTable
              rows={data.rows}
              sort={search.sort}
              dir={search.dir}
              onSortChange={onSortChange}
              selected={selected}
              onRowToggle={toggle}
              onRowsSelect={setMany}
              selectAllRef={selectAllRef}
              outcomes={outcomes}
            />
          </Box>

          <Group justify="space-between" align="flex-end">
            <Group gap="md">
              <Pagination
                total={totalPages}
                value={search.page}
                onChange={onPageChange}
              />
              <Text size="sm">
                {firstRow}–{lastRow} of {data.total}
              </Text>
            </Group>
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
      <Stack gap="md" pb="xl">
        <Title order={1}>Invoices</Title>
        <InvoiceSearchInput query={search.q} onQueryChange={onQueryChange} />
        <InvoiceStatusFilter value={search.status} onChange={onStatusChange} />
      </Stack>
      <Stack gap="xs">
        <SelectionBar
          count={selectedIds.length}
          onClear={handleClear}
          message={getRunMessage()}
          messageActions={renderRunAction()}
        >
          <Button
            size="xs"
            onClick={() => schedule(selectedIds)}
            data-disabled={isBusy}
            aria-disabled={isBusy}
            leftSection={isBusy && <Loader size={14} color="currentColor" />}
          >
            {selectedIds.length === 1 ? 'Send reminder' : 'Send reminders'}
          </Button>
        </SelectionBar>
        {renderContent()}
      </Stack>
    </Container>
  );
}
