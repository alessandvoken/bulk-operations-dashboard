import type { Invoice } from '@/features/invoices/types';
import { Table } from '@mantine/core';

type InvoicesTableProps = {
  rows: Invoice[];
};

export function InvoicesTable({ rows }: InvoicesTableProps) {
  return (
    <Table>
      <Table.Thead>
        <Table.Tr>
          <Table.Th>Invoice</Table.Th>
          <Table.Th>Customer</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {rows.map((invoice) => (
          <Table.Tr key={invoice.id}>
            <Table.Td>{invoice.number}</Table.Td>
            <Table.Td>{invoice.customerName}</Table.Td>
          </Table.Tr>
        ))}
      </Table.Tbody>
    </Table>
  );
}
