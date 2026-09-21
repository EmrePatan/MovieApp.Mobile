import type { ImperativeRouter } from 'expo-router';
import { emitPrimaryTabReselect } from '@/features/navigation/primary-tab-reselect';
import {
  isPrimaryTabRootPath,
  PRIMARY_TAB_HREFS,
  type HighlightedPrimaryTab,
  type PrimaryTabId,
} from '@/features/navigation/primary-tab-routes';

export type PrimaryTabPressAction = 'dismiss' | 'reselect';

export type PrimaryTabPressRouter = Pick<ImperativeRouter, 'dismissAll' | 'dismissTo'>;

export type PrimaryTabPressPlan =
  | { kind: 'reselect' }
  | { kind: 'establish-root'; href: `/${string}`; resetStackFirst: boolean };

export function resolvePrimaryTabPressPlan(params: {
  tabId: PrimaryTabId;
  pathname: string;
  highlightedTab: HighlightedPrimaryTab;
}): PrimaryTabPressPlan {
  const { tabId, pathname, highlightedTab } = params;
  const targetHref = PRIMARY_TAB_HREFS[tabId];

  if (highlightedTab === tabId && isPrimaryTabRootPath(tabId, pathname)) {
    return { kind: 'reselect' };
  }

  if (highlightedTab === tabId && !isPrimaryTabRootPath(tabId, pathname)) {
    return { kind: 'establish-root', href: targetHref, resetStackFirst: false };
  }

  if (highlightedTab === null) {
    return { kind: 'establish-root', href: targetHref, resetStackFirst: true };
  }

  return { kind: 'establish-root', href: targetHref, resetStackFirst: false };
}

export function handlePrimaryTabPress(params: {
  tabId: PrimaryTabId;
  pathname: string;
  highlightedTab: HighlightedPrimaryTab;
  router: PrimaryTabPressRouter;
  emitReselect?: (tabId: PrimaryTabId) => void;
}): PrimaryTabPressAction {
  const { tabId, router } = params;
  const emitReselect = params.emitReselect ?? emitPrimaryTabReselect;
  const plan = resolvePrimaryTabPressPlan(params);

  if (plan.kind === 'reselect') {
    emitReselect(tabId);
    return 'reselect';
  }

  if (plan.resetStackFirst) {
    router.dismissAll();
  }

  router.dismissTo(plan.href);
  return 'dismiss';
}
