import * as Linking from 'expo-linking';
import { parseCatalogDeepLink } from '@/auth/catalog-deep-link';
import { buildCatalogDeepLinkRouterPath } from '@/auth/catalog-deep-link-route';

let pendingCatalogPath: string | null = null;
let listenerInitialized = false;

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
  listenerInitialized = false;
}

export function ensureCatalogDeepLinkListener(): void {
  if (listenerInitialized) {
    return;
  }
  listenerInitialized = true;

  void Linking.getInitialURL()
    .then((url) => {
      captureCatalogDeepLink(url);
    })
    .catch((error) => {
      console.warn('[DeepLink] Unable to restore the initial catalog URL.', error);
    });

  try {
    Linking.addEventListener('url', ({ url }) => {
      captureCatalogDeepLink(url);
    });
  } catch (error) {
    console.warn('[DeepLink] Unable to register the catalog URL listener.', error);
  }
}
