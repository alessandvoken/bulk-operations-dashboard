import { Chip, Group, Input, Stack } from '@mantine/core';
import { useId } from 'react';
import { INVOICE_STATUS_COLORS, INVOICE_STATUS_LABELS } from './status';
import { INVOICE_STATUSES, type InvoiceStatus } from './types';

type InvoiceStatusFilterProps = {
  value: InvoiceStatus[];
  onChange: (status: InvoiceStatus[]) => void;
};

export function InvoiceStatusFilter({
  value,
  onChange,
}: InvoiceStatusFilterProps) {
  const labelId = useId();

  return (
    <Stack gap={4} role="group" aria-labelledby={labelId}>
      <Input.Label id={labelId} labelElement="div">
        Status
      </Input.Label>
      <Chip.Group multiple value={value} onChange={onChange}>
        <Group gap="xs">
          {INVOICE_STATUSES.map((status) => (
            <Chip
              key={status}
              value={status}
              color={INVOICE_STATUS_COLORS[status]}
            >
              {INVOICE_STATUS_LABELS[status]}
            </Chip>
          ))}
        </Group>
      </Chip.Group>
    </Stack>
  );
}
