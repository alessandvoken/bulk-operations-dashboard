import { Anchor, Box, Container, Group } from '@mantine/core';
import { IconBrandGithub } from '@tabler/icons-react';
import classes from './AppFooter.module.css';

const REPOSITORY_URL =
  'https://github.com/alessandvoken/bulk-operations-dashboard';

export function AppFooter() {
  return (
    <Box component="footer" className={classes.footer}>
      <Container size="lg" py="md">
        <Group justify="flex-end">
          <Anchor
            href={REPOSITORY_URL}
            size="sm"
            c="inherit"
            underline="always"
          >
            <Group gap={4} wrap="nowrap">
              <IconBrandGithub size={20} stroke={1.5} aria-hidden="true" />
              Source on GitHub
            </Group>
          </Anchor>
        </Group>
      </Container>
    </Box>
  );
}
