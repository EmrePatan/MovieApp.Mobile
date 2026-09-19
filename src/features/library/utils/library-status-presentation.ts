import { i18n } from '@/i18n';
import { translateLibraryStatus } from '@/i18n/catalog-labels';
import type { LibraryCategory, LibraryItem } from '../types/library';
import type { LibraryStatusPresentation } from '../types/library-status';

function formatNextEpisodeDetail(item: LibraryItem): string | null {
  if (!item.nextEpisode) {
    return null;
  }

  const titleSuffix = item.nextEpisode.title
    ? i18n.t('common.seasonEpisodeTitleSuffix', { title: item.nextEpisode.title })
    : '';

  return i18n.t('common.seasonEpisodeWithTitle', {
    season: item.nextEpisode.seasonNumber,
    episode: item.nextEpisode.episodeNumber,
    titleSuffix,
  });
}

export function resolveLibraryStatusPresentation(item: LibraryItem): LibraryStatusPresentation {
  switch (item.collectionStatus) {
    case 'watching':
      return {
        status: 'watching',
        label: translateLibraryStatus('watching'),
        detail: formatNextEpisodeDetail(item),
        progressPercentage: item.progressPercentage,
      };
    case 'watched':
      return {
        status: 'watched',
        label: translateLibraryStatus('watched'),
      };
    case 'liked':
      return {
        status: 'liked',
        label: translateLibraryStatus('favorite'),
      };
    case 'watchlist':
      return {
        status: 'saved',
        label: translateLibraryStatus('watchlist'),
      };
    default:
      return {
        status: 'saved',
        label: translateLibraryStatus('saved'),
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
      parts.push(
        i18n.t('common.percentWatched', {
          percent: Math.round(presentation.progressPercentage),
        }),
      );
    } else {
      parts.push(translateLibraryStatus('watching'));
    }

    return parts.join(', ');
  }

  if (category === 'watched') {
    parts.push(translateLibraryStatus('watched'));
  } else if (category === 'liked') {
    parts.push(translateLibraryStatus('favorite'));
  } else if (category === 'watchlist') {
    parts.push(translateLibraryStatus('watchlist'));
  } else {
    parts.push(presentation.label);
  }

  return parts.join(', ');
}
