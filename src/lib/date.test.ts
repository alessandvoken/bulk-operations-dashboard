import { describe, it, expect, vi, afterEach } from 'vitest';

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe('formatDate', () => {
  it('formats an ISO date as day, short month and year', async () => {
    const { formatDate } = await import('./date');

    expect(formatDate('2026-10-05')).toBe('05 Oct 2026');
  });

  it('shows the same calendar day west of UTC', async () => {
    vi.stubEnv('TZ', 'America/New_York');
    const { formatDate } = await import('./date');

    expect(formatDate('2026-10-05')).toBe('05 Oct 2026');
  });
});
