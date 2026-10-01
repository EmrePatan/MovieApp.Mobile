import type { CatalogKeywordSummary } from '../types/catalog-keyword';

/** Max chips shown in the detail rail (compact; backend may return more). */
export const DETAIL_KEYWORD_RAIL_MAX = 16;

export function limitKeywordsForDetailRail(
  keywords: CatalogKeywordSummary[],
): CatalogKeywordSummary[] {
  if (keywords.length <= DETAIL_KEYWORD_RAIL_MAX) {
    return keywords;
  }

  return keywords.slice(0, DETAIL_KEYWORD_RAIL_MAX);
}
