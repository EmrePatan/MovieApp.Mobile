import type { LibraryItem } from '../types/library';
import type { LibraryStatusPresentation } from '../types/library-status';

function formatNextEpisodeDetail(item: LibraryItem): string | null {
  if (!item.nextEpisode) {
    return null;
  }

  const episodeLabel = item.nextEpisode.title ? ` · ${item.nextEpisode.title}` : '';
  return `S${item.nextEpisode.seasonNumber} · E${item.nextEpisode.episodeNumber}${episodeLabel}`;
}

export function resolveLibraryStatusPresentation(item: LibraryItem): LibraryStatusPresentation {
  switch (item.collectionStatus) {
    case 'watching':
      return {
        status: 'watching',
        label: 'Watching',
        detail: formatNextEpisodeDetail(item),
        progressPercentage: item.progressPercentage,
      };
    case 'watched':
      return {
        status: 'watched',
        label: 'Watched',
      };
    case 'liked':
      return {
        status: 'liked',
        label: 'Liked',
      };
    case 'watchlist':
      return {
        status: 'saved',
        label: 'Saved',
      };
    default:
      return {
        status: 'saved',
        label: 'Saved',
      };
  }
}
