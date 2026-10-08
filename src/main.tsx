import { MantineProvider, createTheme } from '@mantine/core';
import '@mantine/core/styles.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider, createRouter } from '@tanstack/react-router';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { routeTree } from './routeTree.gen';
import { parseSearch, stringifySearch } from './lib/searchParams';

const theme = createTheme({
  cursorType: 'pointer',
});

const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
  scrollRestoration: true,
  parseSearch,
  stringifySearch,
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
    },
  },
});

const MOCK_START_TIMEOUT_MS = 5_000;

function rejectAfter(ms: number): Promise<never> {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error(`timed out after ${ms} ms`)), ms);
  });
}

const MOCK_RECOVERY_KEY = 'mock-worker-recovery';

async function unregisterServiceWorkers() {
  const registrations = await navigator.serviceWorker.getRegistrations();
  await Promise.all(
    registrations.map((registration) => registration.unregister()),
  );
}

async function main() {
  try {
    const { worker } = await import('./mocks/browser');
    await Promise.race([
      worker.start({ onUnhandledRequest: 'bypass' }),
      rejectAfter(MOCK_START_TIMEOUT_MS),
    ]);
    sessionStorage.removeItem(MOCK_RECOVERY_KEY);
  } catch (error) {
    console.error('Mock API failed to start', error);

    if (sessionStorage.getItem(MOCK_RECOVERY_KEY) === null) {
      sessionStorage.setItem(MOCK_RECOVERY_KEY, 'attempted');
      await Promise.race([
        unregisterServiceWorkers(),
        rejectAfter(MOCK_START_TIMEOUT_MS),
      ]).catch((unregisterError: unknown) => {
        console.error('Mock worker reset failed', unregisterError);
      });
      location.reload();
      return;
    }
  }

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <MantineProvider theme={theme} defaultColorScheme="auto">
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} />
        </QueryClientProvider>
      </MantineProvider>
    </StrictMode>,
  );
}

void main();
