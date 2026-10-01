import { Button, Group, Text } from '@mantine/core';
import type { ReactNode } from 'react';

type SelectionBarProps = {
  count: number;
  onClear: () => void;
  children: ReactNode;
};

export function SelectionBar({ count, onClear, children }: SelectionBarProps) {
  return (
    <Group justify="space-between" mih={36}>
      <Group gap="xs">
        <Text aria-live="polite" size="sm">
          {count > 0 && `${count} selected`}
        </Text>

        {count > 0 && (
          <Button variant="subtle" size="xs" onClick={onClear}>
            Clear selection
          </Button>
        )}
      </Group>

      {count > 0 && <Group gap="xs">{children}</Group>}
    </Group>
  );
}
