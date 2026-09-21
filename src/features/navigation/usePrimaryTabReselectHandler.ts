import { useEffect } from 'react';
import { registerPrimaryTabReselectHandler } from '@/features/navigation/primary-tab-reselect';
import type { PrimaryTabId } from '@/features/navigation/primary-tab-routes';

export type PrimaryTabReselectActions = {
  scrollToTop: () => void;
  refresh: () => void;
};

export function usePrimaryTabReselectHandler(
  tabId: PrimaryTabId,
  actions: PrimaryTabReselectActions,
): void {
  const { scrollToTop, refresh } = actions;

  useEffect(() => {
    return registerPrimaryTabReselectHandler(tabId, {
      scrollToTop,
      refresh,
    });
  }, [refresh, scrollToTop, tabId]);
}
