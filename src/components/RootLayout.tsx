import { Container, Group } from '@mantine/core';
import { Outlet } from '@tanstack/react-router';
import { ColorSchemeToggle } from './ColorSchemeToggle';

export function RootLayout() {
  return (
    <>
      <Container size="lg" py="xl">
        <Group justify="flex-end">
          <ColorSchemeToggle />
        </Group>
      </Container>
      <Outlet />
    </>
  );
}
