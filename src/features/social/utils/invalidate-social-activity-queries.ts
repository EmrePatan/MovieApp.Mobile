import type { QueryClient } from '@tanstack/react-query';

/**
 * Source actions (watching, rating, favoriting, reviewing) can create or update
 * social activities on the server. Refresh the two social surfaces that project
 * those source records without invalidating unrelated social settings/relationships.
 */
export function invalidateSocialActivityQueries(queryClient: QueryClient): void {
  void queryClient.invalidateQueries({ queryKey: ['social', 'feed'] });
  void queryClient.invalidateQueries({ queryKey: ['social', 'profile-activities'] });
}
