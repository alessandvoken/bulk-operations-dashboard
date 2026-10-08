import { SegmentedControl, Group, Stack, Text } from '@mantine/core';
import { useState, useId } from 'react';
import { updateMockConfig } from './api';
import type { MockApiConfig } from './api';

type DebugPreset = 'normal' | 'slow' | 'flaky';

const PRESET_OPTIONS: { value: DebugPreset; label: string }[] = [
  { value: 'normal', label: 'Normal' },
  { value: 'slow', label: 'Slow network' },
  { value: 'flaky', label: 'Flaky provider' },
];

const PRESET_CONFIGS: Record<DebugPreset, MockApiConfig> = {
  normal: { latencyMs: 250, failureRate: 0.08 },
  slow: { latencyMs: 2000, failureRate: 0.08 },
  flaky: { latencyMs: 250, failureRate: 0.5 },
};

const PRESET_DESCRIPTIONS: Record<DebugPreset, string> = {
  normal:
    '250 ms per request. 8% of sendable reminders fail with a temporary error.',
  slow: '2 s per request. Changing page and sending take visibly longer.',
  flaky:
    '250 ms per request. Half of the sendable reminders fail with a temporary error.',
};

export function DebugPanel() {
  const [preset, setPreset] = useState<DebugPreset>('normal');
  const labelId = useId();

  async function handlePresetChange(next: DebugPreset) {
    await updateMockConfig(PRESET_CONFIGS[next]);
    setPreset(next);
  }

  return (
    <Stack gap={4} align="flex-end">
      <Group gap="xs">
        <Text size="md" id={labelId}>
          Simulate server conditions
        </Text>
        <SegmentedControl
          data={PRESET_OPTIONS}
          value={preset}
          onChange={handlePresetChange}
          size="md"
          aria-labelledby={labelId}
        />
      </Group>
      <Text size="sm" role="status">
        {PRESET_DESCRIPTIONS[preset]}
      </Text>
    </Stack>
  );
}
