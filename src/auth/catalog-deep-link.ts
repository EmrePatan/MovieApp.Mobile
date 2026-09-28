import { isValidGuid } from '@/features/details/shared/routes';

export type CatalogDeepLinkTarget =
  | { kind: 'movie'; catalogId: string }
  | { kind: 'tv'; catalogId: string };

const GUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function decodePathSegment(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function parseCatalogPath(pathname: string): CatalogDeepLinkTarget | null {
  const normalized = pathname.startsWith('/') ? pathname : `/${pathname}`;
  const match = normalized.match(/^\/(movie|tv)\/([^/?#]+)/i);
  if (!match?.[1] || !match[2]) {
    return null;
  }

  const catalogId = decodePathSegment(match[2]);
  if (!isValidGuid(catalogId) && !GUID_PATTERN.test(catalogId)) {
    return null;
  }

  if (!isValidGuid(catalogId)) {
    return null;
  }

  return match[1].toLowerCase() === 'movie'
    ? { kind: 'movie', catalogId }
    : { kind: 'tv', catalogId };
}

export function parseCatalogDeepLink(pathOrUrl: string): CatalogDeepLinkTarget | null {
  const trimmed = pathOrUrl.trim();
  if (!trimmed) {
    return null;
  }

  const customSchemeMatch = trimmed.match(/^[a-z][a-z0-9+.-]*:\/\/(movie|tv)\/([^/?#]+)/i);
  if (customSchemeMatch?.[1] && customSchemeMatch[2]) {
    const catalogId = decodePathSegment(customSchemeMatch[2]);
    if (!isValidGuid(catalogId)) {
      return null;
    }

    return customSchemeMatch[1].toLowerCase() === 'movie'
      ? { kind: 'movie', catalogId }
      : { kind: 'tv', catalogId };
  }

  try {
    if (trimmed.includes('://')) {
      const url = new URL(trimmed);
      if (url.protocol === 'http:' || url.protocol === 'https:') {
        return parseCatalogPath(url.pathname);
      }
    }
  } catch {
    return null;
  }

  const withoutScheme = trimmed.replace(/^[a-z][a-z0-9+.-]*:\/\//i, '').split('?')[0] ?? '';
  if (!withoutScheme) {
    return null;
  }

  const pathOnly = withoutScheme.startsWith('/') ? withoutScheme : `/${withoutScheme}`;
  return parseCatalogPath(pathOnly);
}
