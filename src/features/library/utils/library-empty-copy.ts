import type { CatalogMediaFilter } from '../types';
import type { LibraryCategory } from '../types/library';

interface LibraryEmptyCopy {
  icon: 'library' | 'heart' | 'bookmark';
  title: string;
  message: string;
}

export function resolveLibraryEmptyCopy(
  category: LibraryCategory,
  mediaType: CatalogMediaFilter,
): LibraryEmptyCopy {
  const mediaLabel =
    mediaType === 'movie' ? 'movies' : mediaType === 'tv' ? 'TV shows' : 'titles';

  switch (category) {
    case 'watching':
      return {
        icon: 'library',
        title: 'Nothing in progress',
        message: 'Start a TV show and your in-progress series will appear here.',
      };
    case 'watched':
      return {
        icon: 'library',
        title: `No watched ${mediaLabel} yet`,
        message: 'Titles you finish watching will show up here.',
      };
    case 'liked':
      return {
        icon: 'heart',
        title: `No favorite ${mediaLabel} yet`,
        message: 'Save movies and shows you love to build your favorites collection.',
      };
    case 'watchlist':
      return {
        icon: 'bookmark',
        title: 'No watchlists yet',
        message: 'Create a list to save movies and TV shows you want to watch.',
      };
    default:
      return {
        icon: 'library',
        title: 'Your library is empty',
        message: 'Browse Discover to find something to watch.',
      };
  }
}
