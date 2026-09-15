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
        title: mediaType === 'movie' ? 'No movies in progress' : 'Nothing in progress',
        message:
          mediaType === 'movie'
            ? 'Movie progress is tracked when you mark a title as watched.'
            : 'Start a TV show and your in-progress series will appear here.',
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
        title: `No liked ${mediaLabel} yet`,
        message: 'Save movies and shows you love to build your liked collection.',
      };
    case 'watchlist':
      return {
        icon: 'bookmark',
        title: `No saved ${mediaLabel} yet`,
        message: 'Add titles to any watchlist and they will appear here.',
      };
    default:
      return {
        icon: 'library',
        title: 'Your library is empty',
        message: 'Browse Discover to find something to watch.',
      };
  }
}
