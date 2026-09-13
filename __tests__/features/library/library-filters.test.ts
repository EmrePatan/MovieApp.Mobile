import { filterLibraryItems } from '@/features/library/utils/library-filters';
import type { LibraryItem } from '@/features/watchlists/utils/library-items';

const movie: LibraryItem = {
  id: 'movie-1',
  type: 'movie',
  title: 'Inception',
  posterPath: null,
  airDate: '2010-07-16',
  voteAverage: 8.8,
  createdAt: '',
};

const tv: LibraryItem = {
  id: 'tv-1',
  type: 'tv',
  title: 'Breaking Bad',
  posterPath: null,
  airDate: '2008-01-20',
  voteAverage: 8.9,
  createdAt: '',
};

describe('filterLibraryItems', () => {
  it('returns all items when filter is all', () => {
    expect(filterLibraryItems([movie, tv], 'all')).toEqual([movie, tv]);
  });

  it('returns only movies when filter is movie', () => {
    expect(filterLibraryItems([movie, tv], 'movie')).toEqual([movie]);
  });

  it('returns only tv when filter is tv', () => {
    expect(filterLibraryItems([movie, tv], 'tv')).toEqual([tv]);
  });
});
