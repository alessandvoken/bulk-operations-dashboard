import { createRootRoute } from '@tanstack/react-router';
import { RootLayout } from '@/components/RootLayout';
import { DebugPanel } from '@/features/debug/DebugPanel';

export const Route = createRootRoute({
  component: RouteComponent,
});

function RouteComponent() {
  return <RootLayout controls={<DebugPanel />} />;
}
