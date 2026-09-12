import type { SearchRequest } from '../types';
import { DEFAULT_SEARCH_PAGE_SIZE } from '../types';

function encodePathSegment(value: string): string {
  return encodeURIComponent(value);
}

export function buildSearchPath(criteria: SearchRequest): string {
  const params = new URLSearchParams();
  params.set('q', criteria.q);
  params.set('type', criteria.type ?? 'all');
  params.set('page', String(criteria.page ?? 1));
  params.set('pageSize', String(criteria.pageSize ?? DEFAULT_SEARCH_PAGE_SIZE));

  if (criteria.sort) {
    params.set('sort', criteria.sort);
  }

  return `/api/search?${params.toString()}`;
}

export function buildAutocompletePath(query: string): string {
  const params = new URLSearchParams({ q: query });
  return `/api/search/autocomplete?${params.toString()}`;
}

export function buildSearchHistoryPath(page = 1, pageSize = DEFAULT_SEARCH_PAGE_SIZE): string {
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  });

  return `/api/search/history?${params.toString()}`;
}

export function buildDeleteSearchHistoryItemPath(id: string): string {
  return `/api/search/history/${encodePathSegment(id)}`;
}

export function buildClearSearchHistoryPath(): string {
  return '/api/search/history';
}
