import {
  Alert,
  Container,
  Paper,
  Skeleton,
  Stack,
  Title,
  Text,
} from '@mantine/core';
import { useInvoices } from './useInvoices';
import { InvoicesTable } from './InvoicesTable';

export function InvoicesPage() {
  const { data, isPending, isError, isSuccess } = useInvoices();

  function renderContent() {
    if (isPending) {
      return (
        <Stack gap="sm">
          <Skeleton height={32} />
          <Skeleton height={24} />
          <Skeleton height={24} />
          <Skeleton height={24} />
          <Skeleton height={24} />
          <Skeleton height={24} />
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
      if (data.rows.length === 0) {
        return (
          <Paper withBorder p="md" radius="md">
            <Text>No invoices found.</Text>
          </Paper>
        );
      }

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
