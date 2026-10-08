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
import { useId, useRef } from 'react';

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

  function getRangeLabel(): string | null {
    if (!data || data.total === 0) {
      return null;
    }

    const firstRow = (search.page - 1) * search.pageSize + 1;
    const lastRow = Math.min(search.page * search.pageSize, data.total);

    return `${firstRow}–${lastRow} of ${data.total}`;
  }

  const rangeLabel = getRangeLabel();

  const pageSizeId = useId();

  function handlePageChange(page: number) {
    if (page === search.page) {
      return;
    }
    onPageChange(page);
  }

  function renderPageControls(totalPages: number) {
    const atStart = search.page <= 1;
    const atEnd = search.page >= totalPages;
    const controls = [
      { Control: Pagination.First, label: 'First page', inactive: atStart },
      {
        Control: Pagination.Previous,
        label: 'Previous page',
        inactive: atStart,
      },
      { Control: Pagination.Next, label: 'Next page', inactive: atEnd },
      { Control: Pagination.Last, label: 'Last page', inactive: atEnd },
    ];

    return (
      <Pagination.Root
        total={totalPages}
        value={search.page}
        onChange={handlePageChange}
      >
        <Box component="nav" aria-label="Pagination">
          <Group gap={4} wrap="nowrap">
            {controls.map(({ Control, label, inactive }) => (
              <Control
                key={label}
                aria-label={label}
                disabled={false}
                aria-disabled={inactive}
                mod={{ disabled: inactive }}
              />
            ))}
          </Group>
        </Box>
      </Pagination.Root>
    );
  }

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

          <Group justify="flex-end" gap="lg" pt="lg">
            <Group gap="xs" wrap="nowrap">
              <Text component="label" htmlFor={pageSizeId} size="sm">
                Rows per page
              </Text>
              <Select
                id={pageSizeId}
                w={80}
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
            {rangeLabel !== null && <Text size="sm">{rangeLabel}</Text>}
            {renderPageControls(totalPages)}
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
