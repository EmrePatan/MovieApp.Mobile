import {
  createDiscoverHref,
  parseDiscoverParams,
  serializeDiscoverRoute,
} from '@/features/discovery/utils/discover-params';
import { createDefaultDiscoveryFilters } from '@/features/discovery/types';

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
        ...createDefaultDiscoveryFilters('top_rated'),
        genreIds: ['genre-1', 'genre-2'],
        year: 2020,
        minRating: 7,
        language: 'en',
        sort: 'rating_desc',
      },
    });
  });

  it('parses extended browse filter params including keywords and tv status', () => {
    const state = parseDiscoverParams({
      mode: 'trending',
      type: 'tv',
      yearFrom: '2010',
      yearTo: '2019',
      minVoteCount: '500',
      minRuntime: '40',
      maxRuntime: '60',
      originCountry: 'KR',
      keywords: 'kw-1,kw-2',
      tvStatus: 'returning_series,ended',
    });

    expect(state.filters.yearFrom).toBe(2010);
    expect(state.filters.yearTo).toBe(2019);
    expect(state.filters.minVoteCount).toBe(500);
    expect(state.filters.minRuntimeMinutes).toBe(40);
    expect(state.filters.maxRuntimeMinutes).toBe(60);
    expect(state.filters.originCountry).toBe('KR');
    expect(state.filters.keywordIds).toEqual(['kw-1', 'kw-2']);
    expect(state.filters.tvStatuses).toEqual(['returning_series', 'ended']);
  });

  it('drops tv status when content type is movie', () => {
    const state = parseDiscoverParams({
      type: 'movie',
      tvStatus: 'ended',
    });

    expect(state.filters.tvStatuses).toEqual([]);
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
          ...createDefaultDiscoveryFilters('trending'),
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
