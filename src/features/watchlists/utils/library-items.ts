import type {
  WatchlistCatalogItemResponse,
  WatchlistContentType,
  WatchlistItemsResponse,
  WatchlistMovieItemResponse,
  WatchlistTvShowItemResponse,
} from '../types';

export interface LibraryItem {
  id: string;
  type: WatchlistContentType;
  title: string;
  posterPath: string | null;
  airDate: string | null;
  voteAverage: number;
  createdAt: string;
}

function mapMovieItem(item: WatchlistMovieItemResponse): LibraryItem {
  return {
    id: item.id,
    type: 'movie',
    title: item.title,
    posterPath: item.posterPath,
    airDate: item.releaseDate,
    voteAverage: item.voteAverage,
    createdAt: item.createdAt,
  };
}

function mapTvItem(item: WatchlistTvShowItemResponse): LibraryItem {
  return {
    id: item.id,
    type: 'tv',
    title: item.title,
    posterPath: item.posterPath,
    airDate: item.firstAirDate,
    voteAverage: item.voteAverage,
    createdAt: item.createdAt,
  };
}

function mapCatalogItem(item: WatchlistCatalogItemResponse): LibraryItem {
  return {
    id: item.id,
    type: item.contentType,
    title: item.title,
    posterPath: item.posterPath,
    airDate: item.contentType === 'movie' ? item.releaseDate : item.firstAirDate,
    voteAverage: item.voteAverage,
    createdAt: item.createdAt,
  };
}

export function mapWatchlistPageToLibraryItems(page: WatchlistItemsResponse): LibraryItem[] {
  if (page.items?.length) {
    return page.items.map(mapCatalogItem);
  }

  return [
    ...page.movies.map(mapMovieItem),
    ...page.tvShows.map(mapTvItem),
  ];
}

export function flattenWatchlistPages(pages: WatchlistItemsResponse[]): LibraryItem[] {
  const seen = new Set<string>();
  const items: LibraryItem[] = [];

  for (const page of pages) {
    for (const item of mapWatchlistPageToLibraryItems(page)) {
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
