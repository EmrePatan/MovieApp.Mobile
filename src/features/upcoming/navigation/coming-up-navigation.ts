import type { ImperativeRouter } from 'expo-router';
import { openLibraryStackScreen } from '@/features/library/navigation/library-stack-navigation';

export type ComingUpTab = 'for-you' | 'upcoming';

export function parseComingUpTab(value?: string | string[]): ComingUpTab {
  const normalized = Array.isArray(value) ? value[0] : value;
  return normalized === 'upcoming' ? 'upcoming' : 'for-you';
}

export function buildComingUpHref(tab?: ComingUpTab): string {
  return tab ? `/upcoming?tab=${tab}` : '/upcoming';
}

export function openComingUpScreen(
  router: ImperativeRouter,
  tab?: ComingUpTab,
  returnHref?: string,
): void {
  openLibraryStackScreen(router, buildComingUpHref(tab), returnHref);
}
