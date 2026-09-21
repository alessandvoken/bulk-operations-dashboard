import type {
  Invoice,
  InvoiceSortField,
  InvoiceStatus,
} from '@/features/invoices/types';
import { Badge, Group, Table, UnstyledButton } from '@mantine/core';
import {
  IconChevronDown,
  IconChevronUp,
  IconSelector,
} from '@tabler/icons-react';
import { formatMoney } from '@/lib/money';
import { formatDate } from '@/lib/date';

type InvoicesTableProps = {
  rows: Invoice[];
  sort: InvoiceSortField;
  dir: 'asc' | 'desc';
  onSortChange: (field: InvoiceSortField) => void;
};

const INVOICE_STATUS_COLORS: Record<InvoiceStatus, string> = {
  draft: 'gray',
  sent: 'blue',
  paid: 'green',
  overdue: 'red',
  void: 'grape',
};

const INVOICE_STATUS_LABELS: Record<InvoiceStatus, string> = {
  draft: 'Draft',
  sent: 'Sent',
  paid: 'Paid',
  overdue: 'Overdue',
  void: 'Void',
};

export function InvoicesTable({
  rows,
  sort,
  dir,
  onSortChange,
}: InvoicesTableProps) {
  function getAriaSort(
    field: InvoiceSortField,
  ): 'ascending' | 'descending' | 'none' {
    if (sort !== field) {
      return 'none';
    }
    return dir === 'asc' ? 'ascending' : 'descending';
  }

  function renderSortableHeader(
    field: InvoiceSortField,
    label: string,
    justify: 'flex-start' | 'flex-end' = 'flex-start',
  ) {
    const isActive = sort === field;

    return (
      <UnstyledButton
        onClick={() => onSortChange(field)}
        fw={600}
        fz="sm"
        aria-label={`Sort by ${label}, currently ${getAriaSort(field)}`}
      >
        <Group gap={4} justify={justify} wrap="nowrap">
          <span>{label}</span>
          {isActive ? (
            dir === 'asc' ? (
              <IconChevronUp aria-hidden="true" size={14} stroke={2} />
            ) : (
              <IconChevronDown aria-hidden="true" size={14} stroke={2} />
            )
          ) : (
            <IconSelector aria-hidden="true" size={14} stroke={2} />
          )}
        </Group>
      </UnstyledButton>
    );
  }

  return (
    <Table.ScrollContainer minWidth={720}>
      <Table highlightOnHover tabularNums layout="fixed">
        <Table.Thead>
          <Table.Tr>
            <Table.Th aria-sort={getAriaSort('customerName')} w="26%">
              {renderSortableHeader('customerName', 'Customer')}
            </Table.Th>
            <Table.Th aria-sort={getAriaSort('number')} w="18%">
              {renderSortableHeader('number', 'Invoice')}
            </Table.Th>
            <Table.Th aria-sort={getAriaSort('dueAt')} w="14%">
              {renderSortableHeader('dueAt', 'Due')}
            </Table.Th>
            <Table.Th aria-sort={getAriaSort('amountCents')} w="16%" ta="right">
              {renderSortableHeader('amountCents', 'Amount', 'flex-end')}
            </Table.Th>
            <Table.Th w="14%">Status</Table.Th>
            <Table.Th w="12%">Reminders</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {rows.map((invoice) => (
            <Table.Tr key={invoice.id}>
              <Table.Td>{invoice.customerName}</Table.Td>
              <Table.Td>{invoice.number}</Table.Td>
              <Table.Td>{formatDate(invoice.dueAt)}</Table.Td>
              <Table.Td ta="right">
                {formatMoney(invoice.amountCents, invoice.currency)}
              </Table.Td>
              <Table.Td>
                <Badge tt="none" color={INVOICE_STATUS_COLORS[invoice.status]}>
                  {INVOICE_STATUS_LABELS[invoice.status]}
                </Badge>
              </Table.Td>
              <Table.Td>{invoice.remindersSent}</Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </Table.ScrollContainer>
  );
}
