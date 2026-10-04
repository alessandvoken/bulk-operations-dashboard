import { useReducer } from 'react';
import { chunk } from '@/lib/chunk';

export type BulkItemResult =
  | { id: string; ok: true }
  | { id: string; ok: false; error: string; retryable: boolean };

type BulkOperationState = {
  status: 'idle' | 'running' | 'done';
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
  | { type: 'finished' };

function bulkOperationReducer(
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
};

export function useBulkOperations({
  operation,
  batchSize,
}: UseBulkOperationsOptions) {
  const [state, dispatch] = useReducer(bulkOperationReducer, initialState);

  async function run(ids: string[]) {
    if (state.status === 'running') return;

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
  }

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
    run,
    succeeded,
    failed,
  };
}
