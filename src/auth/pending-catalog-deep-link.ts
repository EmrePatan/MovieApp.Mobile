import * as Linking from 'expo-linking';
import { parseCatalogDeepLink } from '@/auth/catalog-deep-link';
import { buildCatalogDeepLinkRouterPath } from '@/auth/catalog-deep-link-route';

let pendingCatalogPath: string | null = null;

export function captureCatalogDeepLink(url: string | null | undefined): void {
  const target = parseCatalogDeepLink(url ?? '');
  if (!target) {
    return;
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
}

export function ensureCatalogDeepLinkListener(): void {
  void Linking.getInitialURL().then((url) => {
    captureCatalogDeepLink(url);
  });

  Linking.addEventListener('url', ({ url }) => {
    captureCatalogDeepLink(url);
  });
}
