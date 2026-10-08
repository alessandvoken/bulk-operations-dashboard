import { Box, Container, Group } from '@mantine/core';
import { Outlet } from '@tanstack/react-router';
import { ColorSchemeToggle } from './ColorSchemeToggle';
import type { ReactNode } from 'react';
import classes from './RootLayout.module.css';

type RootLayoutProps = {
  controls?: ReactNode;
};

export function RootLayout({ controls }: RootLayoutProps) {
  return (
    <>
      <Box component="header" className={classes.header}>
        <Container size="lg" py="xs">
          <Group>
            {controls}
            <Box ml="auto">
              <ColorSchemeToggle />
            </Box>
          </Group>
        </Container>
      </Box>
      <Box component="main">
        <Outlet />
      </Box>
    </>
  );
}
