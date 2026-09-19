import { i18n } from '@/i18n';
import type { CatalogMediaFilter } from '../types';
import type { LibraryCategory } from '../types/library';

interface LibraryEmptyCopy {
  icon: 'library' | 'heart' | 'bookmark';
  title: string;
  message: string;
}

function resolveMediaLabel(mediaType: CatalogMediaFilter): string {
  if (mediaType === 'movie') {
    return i18n.t('library.empty.mediaLabels.movies');
  }

  if (mediaType === 'tv') {
    return i18n.t('library.empty.mediaLabels.tv');
  }

  return i18n.t('library.empty.mediaLabels.titles');
}

export function resolveLibraryEmptyCopy(
  category: LibraryCategory,
  mediaType: CatalogMediaFilter,
): LibraryEmptyCopy {
  const mediaLabel = resolveMediaLabel(mediaType);

  switch (category) {
    case 'watching':
      return {
        icon: 'library',
        title: i18n.t('library.empty.watchingTitle'),
        message: i18n.t('library.empty.watchingMessage'),
      };
    case 'watched':
      return {
        icon: 'library',
        title: i18n.t('library.empty.watchedTitle', { mediaLabel }),
        message: i18n.t('library.empty.watchedMessage'),
      };
    case 'liked':
      return {
        icon: 'heart',
        title: i18n.t('library.empty.likedTitle', { mediaLabel }),
        message: i18n.t('library.empty.likedMessage'),
      };
    case 'watchlist':
      return {
        icon: 'bookmark',
        title: i18n.t('library.empty.watchlistTitle'),
        message: i18n.t('library.empty.watchlistMessage'),
      };
    default:
      return {
        icon: 'library',
        title: i18n.t('library.empty.defaultTitle'),
        message: i18n.t('library.empty.defaultMessage'),
      };
  }
}
