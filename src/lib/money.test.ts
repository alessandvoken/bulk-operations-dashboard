import { describe, it, expect } from 'vitest';
import { formatMoney } from './money';

describe('formatMoney', () => {
  it('converts integer cents to the currency amount', () => {
    expect(formatMoney(123456, 'EUR')).toBe('€1,234.56');
  });

  it('keeps two decimals for amounts under one unit', () => {
    expect(formatMoney(5, 'EUR')).toBe('€0.05');
  });

  it('formats zero', () => {
    expect(formatMoney(0, 'EUR')).toBe('€0.00');
  });

  it('groups thousands', () => {
    expect(formatMoney(100_000_000, 'EUR')).toBe('€1,000,000.00');
  });
});
