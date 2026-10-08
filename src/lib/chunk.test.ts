import { describe, it, expect } from 'vitest';
import { chunk } from './chunk';

describe('chunk', () => {
  it('keeps the shorter last batch', () => {
    expect(chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
  });

  it('does not add an empty batch when the size divides evenly', () => {
    expect(chunk([1, 2, 3, 4], 2)).toEqual([
      [1, 2],
      [3, 4],
    ]);
  });

  it('returns one batch when the size exceeds the input', () => {
    expect(chunk([1, 2], 5)).toEqual([[1, 2]]);
  });

  it('returns no batches for an empty input', () => {
    expect(chunk([], 3)).toEqual([]);
  });

  it('throws a RangeError when the size is not a positive integer', () => {
    expect(() => chunk([1], 0)).toThrow(RangeError);
    expect(() => chunk([1], -1)).toThrow(RangeError);
    expect(() => chunk([1], 1.5)).toThrow(RangeError);
  });
});
