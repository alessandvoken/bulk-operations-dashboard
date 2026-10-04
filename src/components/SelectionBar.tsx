import { Button, Group, Text } from '@mantine/core';
import type { ReactNode } from 'react';

type SelectionBarProps = {
  count: number;
  onClear: () => void;
  children: ReactNode;
  message?: ReactNode;
};

export function SelectionBar({
  count,
  onClear,
  children,
  message,
}: SelectionBarProps) {
  return (
    <Group justify="space-between" mih={36}>
      <Group gap="xs">
        <Text role="status" size="sm">
          {count > 0 && `${count} selected`}
        </Text>

        {count > 0 && (
          <Button variant="subtle" size="xs" onClick={onClear}>
            Clear selection
          </Button>
        )}
      </Group>

      <Group gap="xs">
        <Text size="sm" role="status">
          {message}
        </Text>
        {count > 0 && children}
      </Group>
    </Group>
  );
}
