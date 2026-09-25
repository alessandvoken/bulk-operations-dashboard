export function stringifySearch(search: Record<string, unknown>): string {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(search)) {
    const values = Array.isArray(value) ? value : [value];

    for (const item of values) {
      if (item !== undefined) {
        params.append(key, String(item));
      }
    }
  }

  const query = params.toString();

  return query ? `?${query}` : '';
}

export function parseSearch(
  searchStr: string,
): Record<string, string | string[]> {
  const params = new URLSearchParams(searchStr);
  const search: Record<string, string | string[]> = {};

  for (const key of params.keys()) {
    const values = params.getAll(key);
    search[key] = values.length === 1 ? values[0] : values;
  }

  return search;
}
