import type { ImperativeRouter } from 'expo-router';
import { emitPrimaryTabReselect } from '@/features/navigation/primary-tab-reselect';
import {
  isPrimaryTabRootPath,
  PRIMARY_TAB_HREFS,
  type PrimaryTabId,
} from '@/features/navigation/primary-tab-routes';

export type PrimaryTabPressAction = 'navigate' | 'dismiss' | 'reselect';

export type PrimaryTabPressRouter = Pick<ImperativeRouter, 'navigate' | 'dismissTo'>;

export function handlePrimaryTabPress(params: {
  tabId: PrimaryTabId;
  pathname: string;
  activeTab: PrimaryTabId;
  router: PrimaryTabPressRouter;
  emitReselect?: (tabId: PrimaryTabId) => void;
}): PrimaryTabPressAction {
  const { tabId, pathname, activeTab, router } = params;
  const emitReselect = params.emitReselect ?? emitPrimaryTabReselect;
  const targetHref = PRIMARY_TAB_HREFS[tabId];

  if (activeTab !== tabId) {
    router.navigate(targetHref);
    return 'navigate';
  }

  if (!isPrimaryTabRootPath(tabId, pathname)) {
    router.dismissTo(targetHref);
    return 'dismiss';
  }

  emitReselect(tabId);
  return 'reselect';
}
