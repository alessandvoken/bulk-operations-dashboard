import { Alert, Container, Skeleton, Stack, Title } from '@mantine/core';
import { useInvoices } from './useInvoices';
import { InvoicesTable } from './InvoicesTable';

export function InvoicesPage() {
  const { data, isPending, isError, isSuccess } = useInvoices();

  function renderContent() {
    if (isPending) {
      return <Skeleton />;
    }

    if (isError) {
      return (
        <Alert color="red" title="Could not load invoices">
          Try refreshing the page.
        </Alert>
      );
    }

    if (isSuccess) {
      return <InvoicesTable rows={data.rows} />;
    }

    return null;
  }
  return (
    <Container size="lg" py="xl">
      <Stack gap="xs" pb="xl">
        <Title order={1}>Invoices</Title>
      </Stack>
      {renderContent()}
    </Container>
  );
}
