import { describe, it, expect } from 'vitest';
import { parseSearch, stringifySearch } from './searchParams';

describe('stringifySearch', () => {
  it('writes arrays as repeated keys', () => {
    expect(stringifySearch({ status: ['sent', 'paid'] })).toBe(
      '?status=sent&status=paid',
    );
  });

  it('writes numbers as text', () => {
    expect(stringifySearch({ page: 2 })).toBe('?page=2');
  });

  it('skips undefined values', () => {
    expect(stringifySearch({ q: undefined })).toBe('');
  });

  it('returns an empty string for an empty search', () => {
    expect(stringifySearch({})).toBe('');
  });
});

describe('parseSearch', () => {
  it('keeps numeric-looking values as strings', () => {
    expect(parseSearch('?q=12')).toEqual({ q: '12' });
  });

  it('reads repeated keys as an array', () => {
    expect(parseSearch('?status=sent&status=paid')).toEqual({
      status: ['sent', 'paid'],
    });
  });

  it('reads a single value as a string', () => {
    expect(parseSearch('?status=sent')).toEqual({ status: 'sent' });
  });

  it('returns an empty object for an empty search', () => {
    expect(parseSearch('')).toEqual({});
  });
});
