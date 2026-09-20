import type { Invoice, InvoiceStatus } from '@/features/invoices/types';
import { Table, Badge } from '@mantine/core';
import { formatMoney } from '@/lib/money';
import { formatDate } from '@/lib/date';

type InvoicesTableProps = {
  rows: Invoice[];
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

export function InvoicesTable({ rows }: InvoicesTableProps) {
  return (
    <Table>
      <Table.Thead>
        <Table.Tr>
          <Table.Th>Customer</Table.Th>
          <Table.Th>Invoice</Table.Th>
          <Table.Th>Due</Table.Th>
          <Table.Th ta="right">Amount</Table.Th>
          <Table.Th>Status</Table.Th>
          <Table.Th>Reminders</Table.Th>
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
  );
}
