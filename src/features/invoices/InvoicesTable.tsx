import type { Invoice } from '@/features/invoices/types';
import { Table } from '@mantine/core';
import { formatMoney } from '@/lib/money';

type InvoicesTableProps = {
  rows: Invoice[];
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
            <Table.Td>{invoice.dueAt}</Table.Td>
            <Table.Td ta="right">
              {formatMoney(invoice.amountCents, invoice.currency)}
            </Table.Td>
            <Table.Td>{invoice.status}</Table.Td>
            <Table.Td>{invoice.remindersSent}</Table.Td>
          </Table.Tr>
        ))}
      </Table.Tbody>
    </Table>
  );
}
