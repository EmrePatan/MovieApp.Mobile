import type { PrimaryTabId } from '@/features/navigation/primary-tab-types';
import { isSharedPrimaryTabContextRoute } from '@/features/navigation/shared-primary-tab-routes';

let activeAppShellTabOrigin: PrimaryTabId | null = null;

export function resolvePrimaryTabFromReturnHref(returnHref: string): PrimaryTabId {
  const normalized = returnHref.toLowerCase();

  if (normalized.includes('/home')) {
    return 'home';
  }

  if (normalized.includes('/discover')) {
    return 'discover';
  }

  if (normalized.includes('/library')) {
    return 'library';
  }

  if (normalized.includes('/insights')) {
    return 'insights';
  }

  if (
    normalized.startsWith('/following')
    || normalized.startsWith('/favorites')
    || normalized.startsWith('/watch-history')
    || normalized.startsWith('/watchlist')
    || normalized.startsWith('/upcoming')
    || normalized.startsWith('/notifications')
  ) {
    return 'library';
  }

  return 'library';
}

export function rememberAppShellTabOrigin(returnHref: string): void {
  activeAppShellTabOrigin = resolvePrimaryTabFromReturnHref(returnHref);
}

export function resolveAppShellTabOrigin(pathname: string): PrimaryTabId | null {
  if (!activeAppShellTabOrigin) {
    return null;
  }

  if (!isSharedPrimaryTabContextRoute(pathname)) {
    return null;
  }

  return activeAppShellTabOrigin;
}

export function clearAppShellTabOrigin(): void {
  activeAppShellTabOrigin = null;
}

export function getAppShellTabOriginForTests(): PrimaryTabId | null {
  return activeAppShellTabOrigin;
}
