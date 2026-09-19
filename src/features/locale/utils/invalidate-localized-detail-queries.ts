import type { QueryClient } from '@tanstack/react-query';

export const MOVIE_DETAIL_QUERY_KEY_ROOT = ['movie'] as const;
export const TV_SHOW_DETAIL_QUERY_KEY_ROOT = ['tvshow'] as const;
export const PERSON_DETAIL_QUERY_KEY_ROOT = ['person'] as const;
export const COLLECTION_DETAIL_QUERY_KEY_ROOT = ['collection'] as const;

export function invalidateLocalizedDetailQueries(queryClient: QueryClient): void {
  void queryClient.invalidateQueries({ queryKey: MOVIE_DETAIL_QUERY_KEY_ROOT });
  void queryClient.invalidateQueries({ queryKey: TV_SHOW_DETAIL_QUERY_KEY_ROOT });
  void queryClient.invalidateQueries({ queryKey: PERSON_DETAIL_QUERY_KEY_ROOT });
  void queryClient.invalidateQueries({ queryKey: COLLECTION_DETAIL_QUERY_KEY_ROOT });
}
