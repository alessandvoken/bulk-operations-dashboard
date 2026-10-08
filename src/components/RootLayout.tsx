import { Container, Group } from '@mantine/core';
import { Outlet } from '@tanstack/react-router';
import { ColorSchemeToggle } from './ColorSchemeToggle';
import type { ReactNode } from 'react';

type RootLayoutProps = {
  controls?: ReactNode;
};

export function RootLayout({ controls }: RootLayoutProps) {
  return (
    <>
      <Container size="lg" py="xl">
        <Group justify="flex-end">
          {controls}
          <ColorSchemeToggle />
        </Group>
      </Container>
      <Outlet />
    </>
  );
}
