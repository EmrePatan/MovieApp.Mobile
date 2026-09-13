import {
  getAvailableSortOptions,
  sortLibraryItems,
} from '@/features/library/utils/library-sort';
import type { LibraryItem } from '@/features/watchlists/utils/library-items';

const items: LibraryItem[] = [
  {
    id: 'movie-1',
    type: 'movie',
    title: 'Zodiac',
    posterPath: null,
    airDate: '2007-03-02',
    voteAverage: 7.8,
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'movie-2',
    type: 'movie',
    title: 'Arrival',
    posterPath: null,
    airDate: '2016-11-11',
    voteAverage: 7.9,
    createdAt: '2026-03-01T00:00:00Z',
  },
  {
    id: 'tv-1',
    type: 'tv',
    title: 'Breaking Bad',
    posterPath: null,
    airDate: '2008-01-20',
    voteAverage: 8.9,
    createdAt: '2026-02-01T00:00:00Z',
  },
];

describe('sortLibraryItems', () => {
  it('sorts by title ascending', () => {
    const sorted = sortLibraryItems(items, 'titleAsc');
    expect(sorted.map((item) => item.title)).toEqual(['Arrival', 'Breaking Bad', 'Zodiac']);
  });

  it('sorts by rating descending', () => {
    const sorted = sortLibraryItems(items, 'ratingDesc');
    expect(sorted.map((item) => item.title)).toEqual(['Breaking Bad', 'Arrival', 'Zodiac']);
  });

  it('sorts by recently added', () => {
    const sorted = sortLibraryItems(items, 'recentlyAdded');
    expect(sorted.map((item) => item.title)).toEqual(['Arrival', 'Breaking Bad', 'Zodiac']);
  });
});

describe('getAvailableSortOptions', () => {
  it('includes recently added when supported', () => {
    expect(getAvailableSortOptions(true)).toEqual(['recentlyAdded', 'titleAsc', 'ratingDesc']);
  });

  it('excludes recently added for favorites', () => {
    expect(getAvailableSortOptions(false)).toEqual(['titleAsc', 'ratingDesc']);
  });
});
