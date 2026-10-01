import type { ImperativeRouter } from 'expo-router';
import { createKeywordDiscoverHref } from '@/features/discovery/utils/discover-params';
import type { CatalogKeywordSummary } from '../types/catalog-keyword';
import { isDiscoverableDetailKeyword } from '../utils/normalize-detail-keywords';

export function openKeywordDiscoverBrowse(
  router: ImperativeRouter,
  keyword: CatalogKeywordSummary,
): void {
  if (!isDiscoverableDetailKeyword(keyword)) {
    return;
  }

  router.push(
    createKeywordDiscoverHref({
      id: keyword.id!,
      name: keyword.name,
    }),
  );
}
