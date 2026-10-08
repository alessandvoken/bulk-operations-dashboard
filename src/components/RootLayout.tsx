import { Box, Container, Group, Stack } from '@mantine/core';
import { Outlet } from '@tanstack/react-router';
import { AppFooter } from './AppFooter';
import { ColorSchemeToggle } from './ColorSchemeToggle';
import type { ReactNode } from 'react';
import classes from './RootLayout.module.css';

type RootLayoutProps = {
  controls?: ReactNode;
};

export function RootLayout({ controls }: RootLayoutProps) {
  return (
    <Stack gap={0} mih="100dvh">
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
      <Box component="main" flex={1}>
        <Outlet />
      </Box>
      <AppFooter />
    </Stack>
  );
}
