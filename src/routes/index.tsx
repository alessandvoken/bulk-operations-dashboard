import { createFileRoute } from '@tanstack/react-router'
import { InvoicesPage } from '@/features/invoices/InvoicesPage'

export const Route = createFileRoute('/')({
  component: InvoicesPage,
})
