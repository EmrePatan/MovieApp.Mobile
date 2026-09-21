import type { ImperativeRouter } from 'expo-router';
import { emitPrimaryTabReselect } from '@/features/navigation/primary-tab-reselect';
import {
  isPrimaryTabRootPath,
  PRIMARY_TAB_HREFS,
  type HighlightedPrimaryTab,
  type PrimaryTabId,
} from '@/features/navigation/primary-tab-routes';

export type PrimaryTabPressAction = 'navigate' | 'dismiss' | 'reselect';

export type PrimaryTabPressRouter = Pick<ImperativeRouter, 'navigate' | 'dismissTo'>;

export function handlePrimaryTabPress(params: {
  tabId: PrimaryTabId;
  pathname: string;
  highlightedTab: HighlightedPrimaryTab;
  router: PrimaryTabPressRouter;
  emitReselect?: (tabId: PrimaryTabId) => void;
}): PrimaryTabPressAction {
  const { tabId, pathname, highlightedTab, router } = params;
  const emitReselect = params.emitReselect ?? emitPrimaryTabReselect;
  const targetHref = PRIMARY_TAB_HREFS[tabId];

  if (highlightedTab === tabId && isPrimaryTabRootPath(tabId, pathname)) {
    emitReselect(tabId);
    return 'reselect';
  }

  if (highlightedTab === tabId && !isPrimaryTabRootPath(tabId, pathname)) {
    router.dismissTo(targetHref);
    return 'dismiss';
  }

  if (highlightedTab === null) {
    router.dismissTo(targetHref);
    return 'dismiss';
  }

  router.navigate(targetHref);
  return 'navigate';
}
