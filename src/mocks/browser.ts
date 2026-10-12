import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

export const worker = setupWorker(...handlers);

const REACTIVATE_TIMEOUT_MS = 1_000;

export function reactivateMocking(): Promise<void> {
  const controller = navigator.serviceWorker.controller;

  if (controller === null) {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    function handleMessage(event: MessageEvent) {
      if (event.data?.type === 'MOCKING_ENABLED') {
        finish();
      }
    }

    function finish() {
      clearTimeout(timeoutId);
      navigator.serviceWorker.removeEventListener('message', handleMessage);
      resolve();
    }

    const timeoutId = setTimeout(finish, REACTIVATE_TIMEOUT_MS);
    navigator.serviceWorker.addEventListener('message', handleMessage);
    controller.postMessage('MOCK_ACTIVATE');
  });
}
