export function chunk<T>(items: T[], size: number): T[][] {
  if (!(Number.isInteger(size) && size > 0)) {
    throw new RangeError(`chunk: size must be a positive integer, got ${size}`);
  }

  const results: T[][] = [];

  for (let i = 0; i < items.length; i += size) {
    results.push(items.slice(i, i + size));
  }
  return results;
}
