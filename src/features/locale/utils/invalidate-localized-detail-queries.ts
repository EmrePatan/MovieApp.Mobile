import type { QueryClient } from '@tanstack/react-query';

export const MOVIE_DETAIL_QUERY_KEY_ROOT = ['movie'] as const;
export const TV_SHOW_DETAIL_QUERY_KEY_ROOT = ['tvshow'] as const;
export const PERSON_DETAIL_QUERY_KEY_ROOT = ['person'] as const;
export const COLLECTION_DETAIL_QUERY_KEY_ROOT = ['collection'] as const;
export const HOME_QUERY_KEY_ROOT = ['home'] as const;
export const SEARCH_QUERY_KEY_ROOT = ['search'] as const;
export const AUTOCOMPLETE_QUERY_KEY_ROOT = ['autocomplete'] as const;
export const DISCOVERY_QUERY_KEY_ROOT = ['discovery'] as const;
export const RECOMMENDATIONS_QUERY_KEY_ROOT = ['recommendations'] as const;

export function invalidateLocalizedDetailQueries(queryClient: QueryClient): void {
  void queryClient.invalidateQueries({ queryKey: MOVIE_DETAIL_QUERY_KEY_ROOT });
  void queryClient.invalidateQueries({ queryKey: TV_SHOW_DETAIL_QUERY_KEY_ROOT });
  void queryClient.invalidateQueries({ queryKey: PERSON_DETAIL_QUERY_KEY_ROOT });
  void queryClient.invalidateQueries({ queryKey: COLLECTION_DETAIL_QUERY_KEY_ROOT });
  void queryClient.invalidateQueries({ queryKey: HOME_QUERY_KEY_ROOT });
  void queryClient.invalidateQueries({ queryKey: SEARCH_QUERY_KEY_ROOT });
  void queryClient.invalidateQueries({ queryKey: AUTOCOMPLETE_QUERY_KEY_ROOT });
  void queryClient.invalidateQueries({ queryKey: DISCOVERY_QUERY_KEY_ROOT });
  void queryClient.invalidateQueries({ queryKey: RECOMMENDATIONS_QUERY_KEY_ROOT });
}
