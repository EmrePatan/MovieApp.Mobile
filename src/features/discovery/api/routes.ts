import type { DiscoveryBrowseRequest } from '../types';
import { DEFAULT_DISCOVERY_PAGE_SIZE } from '../types';
import { DEFAULT_HOME_SECTION_SIZE } from '@/features/home/types';

export function buildGenresPath(): string {
  return '/api/genres';
}

export function buildExplorePreviewPath(sectionSize = DEFAULT_HOME_SECTION_SIZE): string {
  const params = new URLSearchParams({
    sectionSize: String(sectionSize),
  });

  return `/api/discovery/explore-preview?${params.toString()}`;
}

export function buildBrowsePath(criteria: DiscoveryBrowseRequest): string {
  const params = new URLSearchParams({
    mode: criteria.mode,
    type: criteria.type ?? 'all',
    page: String(criteria.page ?? 1),
    pageSize: String(criteria.pageSize ?? DEFAULT_DISCOVERY_PAGE_SIZE),
  });

  for (const genreId of criteria.genreIds) {
    params.append('genreId', genreId);
  }

  if (criteria.year != null) {
    params.set('year', String(criteria.year));
  }

  if (criteria.minRating != null) {
    params.set('minRating', String(criteria.minRating));
  }

  if (criteria.language) {
    params.set('language', criteria.language);
  }

  if (criteria.sort) {
    params.set('sort', criteria.sort);
  }

  return `/api/discovery/browse?${params.toString()}`;
}
