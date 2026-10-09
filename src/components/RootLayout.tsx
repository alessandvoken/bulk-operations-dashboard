import { Box, Container, Group, Stack } from '@mantine/core';
import { useElementSize } from '@mantine/hooks';
import { Outlet } from '@tanstack/react-router';
import { AppFooter } from './AppFooter';
import { ColorSchemeToggle } from './ColorSchemeToggle';
import { useEffect, type ReactNode } from 'react';
import classes from './RootLayout.module.css';

type RootLayoutProps = {
  controls?: ReactNode;
};

export function RootLayout({ controls }: RootLayoutProps) {
  const { ref: headerRef, height: headerHeight } = useElementSize();

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--app-header-height', `${headerHeight}px`);

    return () => {
      root.style.removeProperty('--app-header-height');
    };
  }, [headerHeight]);

  return (
    <Stack gap={0} mih="100dvh">
      <Box component="header" ref={headerRef} className={classes.header}>
        <Container size="lg" py="xs">
          <Group>
            {controls}
            <Box ml="auto">
              <ColorSchemeToggle />
            </Box>
          </Group>
        </Container>
      </Box>
      <Box component="main" flex={1} className={classes.main}>
        <Outlet />
      </Box>
      <AppFooter />
    </Stack>
  );
}
