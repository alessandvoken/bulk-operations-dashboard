import type { InvoiceStatus } from './types';

export const INVOICE_STATUS_COLORS: Record<InvoiceStatus, string> = {
  draft: 'gray',
  sent: 'blue',
  paid: 'green',
  overdue: 'red',
  void: 'grape',
};

export const INVOICE_STATUS_LABELS: Record<InvoiceStatus, string> = {
  draft: 'Draft',
  sent: 'Sent',
  paid: 'Paid',
  overdue: 'Overdue',
  void: 'Void',
};
