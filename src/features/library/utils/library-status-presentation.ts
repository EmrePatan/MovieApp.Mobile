import type { LibraryCategory, LibraryItem } from '../types/library';
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
        label: 'Favorite',
      };
    case 'watchlist':
      return {
        status: 'saved',
        label: 'Watchlist',
      };
    default:
      return {
        status: 'saved',
        label: 'Watchlist',
      };
  }
}

export function buildLibraryGridAccessibilityLabel(
  item: LibraryItem,
  presentation: LibraryStatusPresentation,
  category: LibraryCategory,
): string {
  const parts = [item.title];

  if (category === 'watching') {
    if (presentation.detail) {
      parts.push(presentation.detail);
    }

    if (
      presentation.progressPercentage != null &&
      presentation.progressPercentage > 0 &&
      presentation.progressPercentage < 100
    ) {
      parts.push(`${Math.round(presentation.progressPercentage)}% watched`);
    } else {
      parts.push('Watching');
    }

    return parts.join(', ');
  }

  if (category === 'watched') {
    parts.push('Watched');
  } else if (category === 'liked') {
    parts.push('Favorite');
  } else if (category === 'watchlist') {
    parts.push('Watchlist');
  } else {
    parts.push(presentation.label);
  }

  return parts.join(', ');
}
