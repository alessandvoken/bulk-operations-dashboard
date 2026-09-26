import { Button, Group, Text } from '@mantine/core';

type SelectionBarProps = {
  count: number;
  onClear: () => void;
};

export function SelectionBar({ count, onClear }: SelectionBarProps) {
  return (
    <Group mih={36}>
      <Text aria-live="polite" size="sm">
        {count > 0 && `${count} selected`}
      </Text>

      {count > 0 && (
        <Button variant="subtle" size="xs" onClick={onClear}>
          Clear selection
        </Button>
      )}
    </Group>
  );
}
