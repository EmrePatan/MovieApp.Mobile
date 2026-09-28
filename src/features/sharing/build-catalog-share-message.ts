import type { TFunction } from 'i18next';
import { formatCatalogYear } from '@/utils/format';
import { buildCatalogShareUrl, type CatalogShareContentType } from './build-catalog-share-url';

export interface BuildCatalogShareMessageInput {
  contentType: CatalogShareContentType;
  contentId: string;
  title: string;
  releaseDate?: string | null;
  firstAirDate?: string | null;
  t: TFunction;
}

export function buildCatalogShareMessage({
  contentType,
  contentId,
  title,
  releaseDate,
  firstAirDate,
  t,
}: BuildCatalogShareMessageInput): { message: string; url: string } {
  const url = buildCatalogShareUrl({ contentType, contentId });
  const year = formatCatalogYear(releaseDate ?? firstAirDate ?? null, null);
  const headline = year ? `${title} (${year})` : title;
  const cta = t('sharing.viewOnMovieCave');

  return {
    url,
    message: `${headline}\n${cta}:\n${url}`,
  };
}
