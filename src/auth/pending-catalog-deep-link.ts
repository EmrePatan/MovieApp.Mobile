import * as Linking from 'expo-linking';
import { parseCatalogDeepLink } from '@/auth/catalog-deep-link';
import { buildCatalogDeepLinkRouterPath } from '@/auth/catalog-deep-link-route';

let pendingCatalogPath: string | null = null;
let initialCatalogUrlCaptured = false;

export function captureCatalogDeepLink(
  url: string | null | undefined,
  options?: { initial?: boolean },
): void {
  if (options?.initial && initialCatalogUrlCaptured) {
    return;
  }

  const target = parseCatalogDeepLink(url ?? '');
  if (!target) {
    return;
  }

  if (options?.initial) {
    initialCatalogUrlCaptured = true;
  }

  pendingCatalogPath = buildCatalogDeepLinkRouterPath(target);
}

export function peekPendingCatalogDeepLinkPath(): string | null {
  return pendingCatalogPath;
}

export function consumePendingCatalogDeepLinkPath(): string | null {
  const path = pendingCatalogPath;
  pendingCatalogPath = null;
  return path;
}

export function resetPendingCatalogDeepLinkForTests(): void {
  pendingCatalogPath = null;
  initialCatalogUrlCaptured = false;
}

export function ensureCatalogDeepLinkListener(): void {
  void Linking.getInitialURL().then((url) => {
    captureCatalogDeepLink(url, { initial: true });
  });

  Linking.addEventListener('url', ({ url }) => {
    captureCatalogDeepLink(url);
  });
}
