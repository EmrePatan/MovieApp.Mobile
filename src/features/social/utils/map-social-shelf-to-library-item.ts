import type { LibraryCategory, LibraryItem } from '@/features/library/types/library';
import type { SocialProfileShelfItem } from '../types';

export function mapSocialShelfToLibraryItem(
  item: SocialProfileShelfItem,
  category: LibraryCategory,
): LibraryItem {
  return {
    id: item.id,
    type: item.contentType === 'TvShow' ? 'tv' : 'movie',
    title: item.title,
    originalTitle: null,
    posterUrl: item.posterPath,
    backdropUrl: null,
    year: null,
    voteAverage: null,
    addedAt: null,
    watchedAt: null,
    lastActivityAt: null,
    progressPercentage: item.progressPercentage ?? null,
    nextEpisode: null,
    collectionStatus: category,
  };
}
