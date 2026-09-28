import { buildCatalogDetailRoute } from '@/features/details/shared/routes';
import type { CatalogDeepLinkTarget } from '@/auth/catalog-deep-link';
import { parseCatalogDeepLink } from '@/auth/catalog-deep-link';

export function buildCatalogDeepLinkRouterPath(target: CatalogDeepLinkTarget): string {
  return buildCatalogDetailRoute(target.catalogId, target.kind);
}

export function resolveCatalogDeepLinkRouterPath(pathOrUrl: string): string | null {
  const target = parseCatalogDeepLink(pathOrUrl);
  if (!target) {
    return null;
  }

  return buildCatalogDeepLinkRouterPath(target);
}
