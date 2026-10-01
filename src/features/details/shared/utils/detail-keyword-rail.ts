import type { CatalogKeywordSummary } from '../types/catalog-keyword';

/** Max chips shown in the detail rail (compact; backend may return more). */
export const DETAIL_KEYWORD_RAIL_MAX = 16;

/** Up to this count, keep one scroll row (avoids cramped splits on phones). */
export const DETAIL_KEYWORD_SINGLE_ROW_MAX = 7;

/** From this count upward, use two zigzag rows inside horizontal scroll. */
export const DETAIL_KEYWORD_TWO_ROW_MIN_COUNT = 8;

export type DetailKeywordRailLayoutMode = 'single' | 'double';

export interface DetailKeywordRailRows {
  mode: DetailKeywordRailLayoutMode;
  rowOne: CatalogKeywordSummary[];
  rowTwo: CatalogKeywordSummary[];
}

export function limitKeywordsForDetailRail(
  keywords: CatalogKeywordSummary[],
): CatalogKeywordSummary[] {
  if (keywords.length <= DETAIL_KEYWORD_RAIL_MAX) {
    return keywords;
  }

  return keywords.slice(0, DETAIL_KEYWORD_RAIL_MAX);
}

/** Alternates rows: 1st → top, 2nd → bottom, 3rd → top, … */
export function splitKeywordsIntoZigzagRows(
  keywords: CatalogKeywordSummary[],
): [CatalogKeywordSummary[], CatalogKeywordSummary[]] {
  const rowOne: CatalogKeywordSummary[] = [];
  const rowTwo: CatalogKeywordSummary[] = [];

  keywords.forEach((keyword, index) => {
    if (index % 2 === 0) {
      rowOne.push(keyword);
    } else {
      rowTwo.push(keyword);
    }
  });

  return [rowOne, rowTwo];
}

/**
 * ≤7 chips: one row. 8+: two zigzag rows (never one long single row).
 */
export function layoutDetailKeywordRailRows(
  keywords: CatalogKeywordSummary[],
): DetailKeywordRailRows {
  if (keywords.length === 0) {
    return { mode: 'single', rowOne: [], rowTwo: [] };
  }

  if (keywords.length <= DETAIL_KEYWORD_SINGLE_ROW_MAX) {
    return { mode: 'single', rowOne: keywords, rowTwo: [] };
  }

  const [rowOne, rowTwo] = splitKeywordsIntoZigzagRows(keywords);
  return { mode: 'double', rowOne, rowTwo };
}
