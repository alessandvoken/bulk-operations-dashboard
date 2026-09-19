import { Container, Stack, Text, Title } from '@mantine/core';
import { useInvoices } from './useInvoices';
import { InvoicesTable } from './InvoicesTable';

export function InvoicesPage() {
  const { data } = useInvoices();

  return (
    <Container size="lg" py="xl">
      <Stack gap="xs">
        <Title order={1}>Invoices</Title>
        <Text c="dimmed">Bulk operations dashboard</Text>
      </Stack>
      <InvoicesTable rows={data?.rows ?? []} />
    </Container>
  );
}
