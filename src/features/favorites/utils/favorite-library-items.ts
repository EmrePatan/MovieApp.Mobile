import type { LibraryItem } from '@/features/watchlists/utils/library-items';
import type {
  FavoriteMovieItemResponse,
  FavoriteTvShowItemResponse,
  FavoritesResponse,
} from '../types';

function mapMovieItem(item: FavoriteMovieItemResponse): LibraryItem {
  return {
    id: item.id,
    type: 'movie',
    title: item.title,
    posterPath: item.posterPath,
    airDate: item.releaseDate,
    voteAverage: item.voteAverage,
    createdAt: '',
  };
}

function mapTvItem(item: FavoriteTvShowItemResponse): LibraryItem {
  return {
    id: item.id,
    type: 'tv',
    title: item.title,
    posterPath: item.posterPath,
    airDate: item.firstAirDate,
    voteAverage: item.voteAverage,
    createdAt: '',
  };
}

export function mapFavoritesPageToLibraryItems(page: FavoritesResponse): LibraryItem[] {
  return [...page.movies.map(mapMovieItem), ...page.tvShows.map(mapTvItem)];
}

export function flattenFavoritesPages(pages: FavoritesResponse[]): LibraryItem[] {
  const seen = new Set<string>();
  const items: LibraryItem[] = [];

  for (const page of pages) {
    for (const item of mapFavoritesPageToLibraryItems(page)) {
      const key = `${item.type}-${item.id}`;
      if (seen.has(key)) {
        continue;
      }

      seen.add(key);
      items.push(item);
    }
  }

  return items;
}
