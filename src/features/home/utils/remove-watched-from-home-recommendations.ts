import type { QueryClient } from '@tanstack/react-query';
import type { HomePersonalizedResponse } from '../types';
import { HOME_QUERY_KEY_ROOT } from '../hooks/home-query-keys';
import {
  getHomeRecommendationDismissKey,
  omitDismissedRecommendations,
} from './omit-dismissed-recommendations';

/**
 * A title that was just marked watched leaves "Recommended for you" right away. Waiting for the
 * personalized request to come back made it linger for as long as that request took.
 */
export function removeWatchedMovieFromHomeRecommendations(
  queryClient: QueryClient,
  movieId: string,
): void {
  const watchedKeys = new Set([getHomeRecommendationDismissKey({ contentType: 'movie', id: movieId })]);

  queryClient.setQueriesData<HomePersonalizedResponse>(
    { queryKey: [...HOME_QUERY_KEY_ROOT, 'personalized'] },
    (current) => {
      if (!current?.sections) {
        return current;
      }

      const sections = omitDismissedRecommendations(current.sections, watchedKeys);
      return sections === current.sections ? current : { ...current, sections };
    },
  );
}
