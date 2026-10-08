import { describe, it, expect } from 'vitest';
import {
  bulkOperationReducer,
  type BulkItemResult,
  type BulkOperationState,
} from './useBulkOperations';

const sent: BulkItemResult = { id: 'a', ok: true };
const failed: BulkItemResult = {
  id: 'x',
  ok: false,
  error: 'Mail provider timed out',
  retryable: true,
};

const idle: BulkOperationState = { status: 'idle', runIds: [], outcomes: {} };

describe('bulkOperationReducer', () => {
  it('opens the undo window on scheduled', () => {
    const next = bulkOperationReducer(idle, {
      type: 'scheduled',
      ids: ['a', 'b'],
    });

    expect(next.status).toBe('scheduled');
    expect(next.runIds).toEqual(['a', 'b']);
  });

  it('keeps previous outcomes when a run is scheduled', () => {
    const state: BulkOperationState = { ...idle, outcomes: { x: failed } };

    const next = bulkOperationReducer(state, { type: 'scheduled', ids: ['x'] });

    expect(next.outcomes).toEqual({ x: failed });
  });

  it('cancels a scheduled run', () => {
    const state: BulkOperationState = { ...idle, status: 'scheduled' };

    const next = bulkOperationReducer(state, { type: 'cancelled' });

    expect(next.status).toBe('cancelled');
  });

  it('ignores a cancel that arrives after the run has started', () => {
    const state: BulkOperationState = {
      status: 'running',
      runIds: ['a'],
      outcomes: {},
    };

    const next = bulkOperationReducer(state, { type: 'cancelled' });

    expect(next).toBe(state);
  });

  it('clears only the outcomes of the ids being run', () => {
    const state: BulkOperationState = {
      status: 'done',
      runIds: ['a', 'x'],
      outcomes: { a: sent, x: failed },
    };

    const next = bulkOperationReducer(state, { type: 'started', ids: ['a'] });

    expect(next.status).toBe('running');
    expect(next.runIds).toEqual(['a']);
    expect(next.outcomes).toEqual({ x: failed });
  });

  it('records the results of a settled batch without changing the status', () => {
    const state: BulkOperationState = {
      status: 'running',
      runIds: ['a'],
      outcomes: {},
    };

    const next = bulkOperationReducer(state, {
      type: 'batchSettled',
      results: [sent],
    });

    expect(next.outcomes).toEqual({ a: sent });
    expect(next.status).toBe('running');
  });

  it('keeps the outcomes when the run finishes', () => {
    const state: BulkOperationState = {
      status: 'running',
      runIds: ['a'],
      outcomes: { a: sent },
    };

    const next = bulkOperationReducer(state, { type: 'finished' });

    expect(next.status).toBe('done');
    expect(next.outcomes).toEqual({ a: sent });
  });

  it('does not mutate the previous state', () => {
    const state: BulkOperationState = {
      status: 'done',
      runIds: ['a'],
      outcomes: { a: sent },
    };

    bulkOperationReducer(state, { type: 'started', ids: ['a'] });

    expect(state.outcomes).toEqual({ a: sent });
  });
});
