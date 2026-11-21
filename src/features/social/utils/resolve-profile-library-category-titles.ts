import type { LibraryCategory } from '@/features/library/types/library';
import type { SocialProfileShelfItem, SocialProfileStatistics } from '../types';
import { resolveProfileLibraryTitles } from './resolve-profile-library-titles';

export function resolveProfileLibraryCategoryTitles(
  statistics: SocialProfileStatistics | null | undefined,
  category: LibraryCategory,
): SocialProfileShelfItem[] {
  if (!statistics) return [];

  switch (category) {
    case 'watching':
      return statistics.watchingTitles ?? [];
    case 'watched':
      return statistics.watchedTitles ?? [];
    case 'liked': {
      const liked = statistics.likedTitles;
      if (Array.isArray(liked) && liked.length > 0) return liked;
      return [...(statistics.favoriteMovies ?? []), ...(statistics.favoriteShows ?? [])];
    }
    case 'watchlist':
      return statistics.watchlistTitles ?? [];
    default:
      return resolveProfileLibraryTitles(statistics);
  }
}
