import { SegmentedControl, Group, Text } from '@mantine/core';
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

export function DebugPanel() {
  const [preset, setPreset] = useState<DebugPreset>('normal');
  const labelId = useId();

  async function handlePresetChange(next: DebugPreset) {
    await updateMockConfig(PRESET_CONFIGS[next]);
    setPreset(next);
  }

  return (
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
  );
}
