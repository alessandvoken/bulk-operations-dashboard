import {
  ActionIcon,
  Menu,
  Tooltip,
  useComputedColorScheme,
  useMantineColorScheme,
  type MantineColorScheme,
} from '@mantine/core';
import {
  IconCheck,
  IconDeviceDesktop,
  IconMoon,
  IconSun,
} from '@tabler/icons-react';

const ICONS: Record<MantineColorScheme, typeof IconSun> = {
  light: IconSun,
  dark: IconMoon,
  auto: IconDeviceDesktop,
};

const OPTIONS: { value: MantineColorScheme; label: string }[] = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'auto', label: 'System' },
];

export function ColorSchemeToggle() {
  const { colorScheme, setColorScheme } = useMantineColorScheme();
  const computed = useComputedColorScheme('light');

  const TriggerIcon = ICONS[colorScheme];
  const triggerLabel =
    colorScheme === 'auto'
      ? `Theme: system (${computed})`
      : `Theme: ${colorScheme}`;

  return (
    <Menu position="bottom-end" trigger="click" withinPortal>
      <Menu.Target>
        <Tooltip label={triggerLabel}>
          <ActionIcon variant="subtle" color="gray" aria-label={triggerLabel}>
            <TriggerIcon size={20} stroke={1.5} />
          </ActionIcon>
        </Tooltip>
      </Menu.Target>

      <Menu.Dropdown>
        {OPTIONS.map((option) => {
          const OptionIcon = ICONS[option.value];
          const isActive = colorScheme === option.value;

          return (
            <Menu.Item
              key={option.value}
              leftSection={<OptionIcon size={20} stroke={1.5} />}
              rightSection={isActive ? <IconCheck size={14} /> : null}
              onClick={() => setColorScheme(option.value)}
            >
              {option.label}
            </Menu.Item>
          );
        })}
      </Menu.Dropdown>
    </Menu>
  );
}
