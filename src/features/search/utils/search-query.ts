import {
  MAX_SEARCH_QUERY_LENGTH,
  MIN_SEARCH_QUERY_LENGTH,
} from '../types';

export function normalizeSearchQuery(query: string): string {
  return query.trim().replace(/\s+/g, ' ');
}

export function isValidSearchQuery(query: string): boolean {
  const normalized = normalizeSearchQuery(query);
  return (
    normalized.length >= MIN_SEARCH_QUERY_LENGTH &&
    normalized.length <= MAX_SEARCH_QUERY_LENGTH
  );
}
