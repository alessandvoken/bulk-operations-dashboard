import { useReducer, useEffect, useEffectEvent, useState } from 'react';
import { chunk } from '@/lib/chunk';

export type BulkItemResult =
  | { id: string; ok: true }
  | { id: string; ok: false; error: string; retryable: boolean };

export type BulkOperationState = {
  status: 'idle' | 'running' | 'done' | 'scheduled' | 'cancelled';
  runIds: string[];
  outcomes: Record<string, BulkItemResult>;
};

type BulkOperationAction =
  | {
      type: 'started';
      ids: string[];
    }
  | {
      type: 'batchSettled';
      results: BulkItemResult[];
    }
  | { type: 'finished' }
  | {
      type: 'scheduled';
      ids: string[];
    }
  | {
      type: 'cancelled';
    };

export function bulkOperationReducer(
  state: BulkOperationState,
  action: BulkOperationAction,
): BulkOperationState {
  switch (action.type) {
    case 'started': {
      const outcomes = { ...state.outcomes };
      for (const id of action.ids) {
        delete outcomes[id];
      }
      return { status: 'running', runIds: action.ids, outcomes };
    }
    case 'batchSettled': {
      const outcomes = { ...state.outcomes };
      for (const result of action.results) {
        outcomes[result.id] = result;
      }
      return { ...state, outcomes };
    }
    case 'finished':
      return { ...state, status: 'done' };
    case 'scheduled':
      return { ...state, status: 'scheduled', runIds: action.ids };
    case 'cancelled':
      if (state.status !== 'scheduled') {
        return state;
      }
      return { ...state, status: 'cancelled' };
  }
}

const initialState: BulkOperationState = {
  status: 'idle',
  runIds: [],
  outcomes: {},
};

type UseBulkOperationsOptions = {
  operation: (ids: string[]) => Promise<BulkItemResult[]>;
  batchSize: number;
  onFinished?: () => void;
};

const UNDO_WINDOW_MS = 5_000;

export function useBulkOperations({
  operation,
  batchSize,
  onFinished,
}: UseBulkOperationsOptions) {
  const [state, dispatch] = useReducer(bulkOperationReducer, initialState);
  const [isPaused, setIsPaused] = useState(false);

  async function run(ids: string[]) {
    dispatch({ type: 'started', ids });

    for (const batch of chunk(ids, batchSize)) {
      try {
        const results = await operation(batch);
        dispatch({ type: 'batchSettled', results });
      } catch {
        dispatch({
          type: 'batchSettled',
          results: batch.map((id) => ({
            id,
            ok: false,
            error: 'Request failed',
            retryable: true,
          })),
        });
      }
    }
    dispatch({ type: 'finished' });
    onFinished?.();
  }

  function schedule(ids: string[]) {
    if (state.status === 'running' || state.status === 'scheduled') return;

    dispatch({ type: 'scheduled', ids });
  }

  function cancel() {
    dispatch({ type: 'cancelled' });
  }

  function pause() {
    setIsPaused(true);
  }

  function resume() {
    setIsPaused(false);
  }

  const startScheduledRun = useEffectEvent(() => {
    void run(state.runIds);
  });

  useEffect(() => {
    if (state.status !== 'scheduled' || isPaused) return;
    const timeoutId = setTimeout(() => startScheduledRun(), UNDO_WINDOW_MS);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [state.status, isPaused]);

  const total = state.runIds.length;
  const processed = state.runIds.filter((id) => id in state.outcomes).length;
  const succeeded = state.runIds.filter(
    (id) => id in state.outcomes && state.outcomes[id].ok,
  ).length;

  const failed = processed - succeeded;

  const retryableIds = state.runIds.filter(
    (id) =>
      id in state.outcomes &&
      state.outcomes[id].ok === false &&
      state.outcomes[id].retryable,
  );

  return {
    status: state.status,
    outcomes: state.outcomes,
    total,
    processed,
    retryableIds,
    succeeded,
    failed,
    schedule,
    cancel,
    pause,
    resume,
  };
}
