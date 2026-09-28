import { getAppWebBaseUrl } from '@/config/app-web-url';

export type CatalogShareContentType = 'movie' | 'tv';

export interface BuildCatalogShareUrlInput {
  contentType: CatalogShareContentType;
  contentId: string;
}

function encodeCatalogId(contentId: string): string {
  return encodeURIComponent(contentId);
}

export function buildCatalogShareUrl({
  contentType,
  contentId,
}: BuildCatalogShareUrlInput): string {
  const baseUrl = getAppWebBaseUrl();
  const segment = contentType === 'movie' ? 'movie' : 'tv';
  return `${baseUrl}/${segment}/${encodeCatalogId(contentId)}`;
}
