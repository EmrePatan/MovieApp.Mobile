import type { ImperativeRouter } from 'expo-router';
import { clearAppShellTabOrigin } from '@/features/navigation/app-shell-tab-origin';
import { emitPrimaryTabReselect } from '@/features/navigation/primary-tab-reselect';
import {
  isPrimaryTabRootPath,
  PRIMARY_TAB_HREFS,
  type HighlightedPrimaryTab,
  type PrimaryTabId,
} from '@/features/navigation/primary-tab-routes';

export type PrimaryTabPressAction = 'dismiss' | 'reselect' | 'replace';

export type PrimaryTabPressRouter = Pick<ImperativeRouter, 'dismissTo' | 'replace'>;

export type PrimaryTabPressPlan =
  | { kind: 'reselect' }
  | { kind: 'establish-root'; href: `/${string}` };

/** Settings hub lives as a sibling tab of (app-shell); POP_TO cannot leave it. */
export function isSettingsHubPath(pathname: string): boolean {
  return pathname === '/profile';
}

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
    return { kind: 'establish-root', href: targetHref };
  }

  if (highlightedTab === null) {
    return { kind: 'establish-root', href: targetHref };
  }

  return { kind: 'establish-root', href: targetHref };
}

export function handlePrimaryTabPress(params: {
  tabId: PrimaryTabId;
  pathname: string;
  highlightedTab: HighlightedPrimaryTab;
  router: PrimaryTabPressRouter;
  emitReselect?: (tabId: PrimaryTabId) => void;
}): PrimaryTabPressAction {
  const { tabId, router, pathname } = params;
  const emitReselect = params.emitReselect ?? emitPrimaryTabReselect;
  const plan = resolvePrimaryTabPressPlan(params);

  if (plan.kind === 'reselect') {
    emitReselect(tabId);
    return 'reselect';
  }

  // Leaving for a tab root: stale origin must not tint the next shared route.
  clearAppShellTabOrigin();

  // Sibling tab navigator ignores POP_TO — leave settings with replace.
  if (isSettingsHubPath(pathname)) {
    router.replace(plan.href);
    return 'replace';
  }

  router.dismissTo(plan.href);
  return 'dismiss';
}
