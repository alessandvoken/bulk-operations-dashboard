export type MockApiConfig = {
  latencyMs: number;
  failureRate: number;
};

export async function updateMockConfig(config: MockApiConfig): Promise<void> {
  const res = await fetch('/api/server-conditions', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config),
  });

  if (!res.ok) {
    throw new Error(`updateMockConfig ${res.status}`);
  }
}
