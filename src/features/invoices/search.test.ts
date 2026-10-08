import { describe, it, expect } from 'vitest';
import {
  DEFAULT_INVOICE_SEARCH,
  nextSortSearch,
  parseInvoiceListSearch,
} from './search';
import type { InvoiceListSearch } from './types';

describe('parseInvoiceListSearch', () => {
  it('returns the defaults for an empty search', () => {
    expect(parseInvoiceListSearch({})).toEqual(DEFAULT_INVOICE_SEARCH);
  });

  it('reads the page as a number', () => {
    expect(parseInvoiceListSearch({ page: '3' }).page).toBe(3);
  });

  it('falls back to the first page when the page is not a positive integer', () => {
    for (const page of ['0', '-2', '1.5', 'abc']) {
      expect(parseInvoiceListSearch({ page }).page).toBe(1);
    }
  });

  it('accepts only the allowed page sizes', () => {
    expect(parseInvoiceListSearch({ pageSize: '25' }).pageSize).toBe(25);
    expect(parseInvoiceListSearch({ pageSize: '30' }).pageSize).toBe(
      DEFAULT_INVOICE_SEARCH.pageSize,
    );
  });

  it('falls back to the default sort for unknown values', () => {
    const search = parseInvoiceListSearch({ sort: 'hacked', dir: 'up' });

    expect(search.sort).toBe(DEFAULT_INVOICE_SEARCH.sort);
    expect(search.dir).toBe(DEFAULT_INVOICE_SEARCH.dir);
  });

  it('reads a single status as an array', () => {
    expect(parseInvoiceListSearch({ status: 'sent' }).status).toEqual(['sent']);
  });

  it('drops unknown statuses and keeps the canonical order', () => {
    expect(
      parseInvoiceListSearch({ status: ['paid', 'bogus', 'sent'] }).status,
    ).toEqual(['sent', 'paid']);
  });
});

describe('nextSortSearch', () => {
  const onPageThree = { ...DEFAULT_INVOICE_SEARCH, page: 3 };

  it('flips the direction when the active field is clicked again', () => {
    const next = nextSortSearch(onPageThree, 'dueAt');

    expect(next.dir).toBe('desc');
    expect(next.page).toBe(1);
  });

  it('flips back to ascending on the next click', () => {
    const next = nextSortSearch({ ...onPageThree, dir: 'desc' }, 'dueAt');

    expect(next.dir).toBe('asc');
  });

  it('starts ascending on a new field', () => {
    const next = nextSortSearch({ ...onPageThree, dir: 'desc' }, 'amountCents');

    expect(next.sort).toBe('amountCents');
    expect(next.dir).toBe('asc');
    expect(next.page).toBe(1);
  });

  it('keeps the filters', () => {
    const filtered: InvoiceListSearch = {
      ...onPageThree,
      q: 'acme',
      status: ['overdue'],
    };

    const next = nextSortSearch(filtered, 'amountCents');

    expect(next.q).toBe('acme');
    expect(next.status).toEqual(['overdue']);
  });
});
