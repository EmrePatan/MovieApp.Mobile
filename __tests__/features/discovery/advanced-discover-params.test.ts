import {
  createAdvancedDiscoverHref,
  parseAdvancedDiscoverParams,
  serializeAdvancedDiscoverRoute,
} from '@/features/discovery/utils/advanced-discover-params';

describe('advanced discover params', () => {
  it('parses defaults when params are empty', () => {
    const state = parseAdvancedDiscoverParams({});

    expect(state.mediaType).toBe('movie');
    expect(state.filters.genreIds).toEqual([]);
    expect(state.filters.sort).toBe('popularity_desc');
    expect(state.filters.genreMatch).toBe('all');
  });

  it('serializes active filters into route params', () => {
    const route = serializeAdvancedDiscoverRoute({
      mediaType: 'tv',
      filters: {
        genreIds: ['genre-1', 'genre-2'],
        genreMatch: 'any',
        year: null,
        yearFrom: 2018,
        yearTo: 2024,
        minRating: 7,
        maxRating: 9,
        minVoteCount: 100,
        minRuntimeMinutes: 90,
        maxRuntimeMinutes: 120,
        originalLanguage: 'en',
        originCountry: 'US',
        certification: null,
        certificationCountry: null,
        releaseTypes: [],
        watchRegion: 'US',
        watchProviderIds: [8],
        watchMonetizationTypes: ['stream'],
        sort: 'rating_desc',
      },
    });

    expect(route).toContain('mediaType=tv');
    expect(route).toContain('genres=genre-1');
    expect(route).toContain('genreMatch=any');
    expect(route).toContain('maxRating=9');
    expect(route).toContain('minVoteCount=100');
    expect(route).toContain('yearFrom=2018');
    expect(route).toContain('yearTo=2024');
    expect(route).toContain('minRating=7');
    expect(route).toContain('minRuntime=90');
    expect(route).toContain('maxRuntime=120');
    expect(route).toContain('language=en');
    expect(route).toContain('originCountry=US');
    expect(route).toContain('sort=rating_desc');
  });

  it('round-trips parsed params', () => {
    const href = createAdvancedDiscoverHref({
      mediaType: 'movie',
      filters: {
        genreIds: ['genre-2'],
        year: 2020,
        minRating: 8,
        sort: 'newest',
      },
    });

    const query = href.split('?')[1] ?? '';
    const params = Object.fromEntries(new URLSearchParams(query).entries());
    const parsed = parseAdvancedDiscoverParams(params);

    expect(parsed.mediaType).toBe('movie');
    expect(parsed.filters.genreIds).toEqual(['genre-2']);
    expect(parsed.filters.year).toBe(2020);
    expect(parsed.filters.minRating).toBe(8);
    expect(parsed.filters.sort).toBe('newest');
  });
});
