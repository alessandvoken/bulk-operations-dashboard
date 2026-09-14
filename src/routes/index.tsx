import { Container, Stack, Text, Title } from '@mantine/core'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: InvoicesPage,
})

function InvoicesPage() {
  return (
    <Container size="lg" py="xl">
      <Stack gap="xs">
        <Title order={1}>Invoices</Title>
        <Text c="dimmed">Bulk operations dashboard</Text>
      </Stack>
    </Container>
  )
}
