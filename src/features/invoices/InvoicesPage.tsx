import { Container, Stack, Title } from '@mantine/core';
import { useInvoices } from './useInvoices';
import { InvoicesTable } from './InvoicesTable';

export function InvoicesPage() {
  const { data } = useInvoices();

  return (
    <Container size="lg" py="xl">
      <Stack gap="xs" pb="xl">
        <Title order={1}>Invoices</Title>
      </Stack>
      <InvoicesTable rows={data?.rows ?? []} />
    </Container>
  );
}
