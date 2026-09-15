import {
  createDiscoverHref,
  parseDiscoverParams,
  serializeDiscoverRoute,
} from '@/features/discovery/utils/discover-params';

describe('discover params', () => {
  it('parses valid params', () => {
    const state = parseDiscoverParams({
      mode: 'top_rated',
      type: 'movie',
      genres: 'genre-1,genre-2',
      year: '2020',
      minRating: '7',
      language: 'en',
      sort: 'rating_desc',
    });

    expect(state).toEqual({
      mode: 'top_rated',
      type: 'movie',
      filters: {
        genreIds: ['genre-1', 'genre-2'],
        year: 2020,
        minRating: 7,
        language: 'en',
        sort: 'rating_desc',
      },
    });
  });

  it('falls back to safe defaults for invalid params', () => {
    const state = parseDiscoverParams({
      mode: 'invalid',
      type: 'invalid',
      year: 'abc',
      minRating: '99',
      sort: 'invalid',
    });

    expect(state.mode).toBe('trending');
    expect(state.type).toBe('all');
    expect(state.filters.year).toBeNull();
    expect(state.filters.minRating).toBeNull();
    expect(state.filters.sort).toBe('popularity_desc');
  });

  it('serializes browse route', () => {
    expect(
      serializeDiscoverRoute({
        mode: 'trending',
        type: 'all',
        filters: {
          genreIds: ['genre-1'],
          year: 2019,
          minRating: null,
          language: null,
          sort: 'popularity_desc',
        },
      }),
    ).toBe('/discover-browse?mode=trending&type=all&genres=genre-1&year=2019');
  });

  it('creates default discover href', () => {
    expect(createDiscoverHref()).toBe('/discover-browse?mode=trending&type=all');
  });
});
