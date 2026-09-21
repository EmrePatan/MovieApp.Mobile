import type { PrimaryTabId } from '@/features/navigation/primary-tab-routes';

export type PrimaryTabReselectHandler = {
  scrollToTop: () => void;
  refresh: () => void;
};

const handlers: Partial<Record<PrimaryTabId, PrimaryTabReselectHandler>> = {};

export function registerPrimaryTabReselectHandler(
  tabId: PrimaryTabId,
  handler: PrimaryTabReselectHandler,
): () => void {
  handlers[tabId] = handler;

  return () => {
    if (handlers[tabId] === handler) {
      delete handlers[tabId];
    }
  };
}

export function emitPrimaryTabReselect(tabId: PrimaryTabId): void {
  const handler = handlers[tabId];
  if (!handler) {
    return;
  }

  handler.scrollToTop();
  handler.refresh();
}

export function resetPrimaryTabReselectHandlersForTests(): void {
  for (const tabId of Object.keys(handlers) as PrimaryTabId[]) {
    delete handlers[tabId];
  }
}
