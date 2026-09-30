import {
  createWorldCinemaHref,
  parseWorldCinemaParams,
} from '@/features/discovery/utils/world-cinema-params';
import { createDefaultWorldCinemaFilters } from '@/features/discovery/world-cinema-types';

describe('world-cinema-params', () => {
  it('parses valid world cinema params', () => {
    const state = parseWorldCinemaParams({
      mediaType: 'tv',
      originCountry: 'FR',
      sort: 'rating_desc',
    });

    expect(state).toEqual({
      ...createDefaultWorldCinemaFilters(),
      mediaType: 'tv',
      originCountry: 'FR',
      sort: 'rating_desc',
    });
  });

  it('falls back to safe defaults for invalid values', () => {
    const state = parseWorldCinemaParams({
      mediaType: 'invalid',
      originCountry: 'FRA',
      sort: 'unknown',
    });

    expect(state.mediaType).toBe('movie');
    expect(state.originCountry).toBe('KR');
    expect(state.sort).toBe('popularity_desc');
  });

  it('serializes explore href with selected origin country', () => {
    expect(
      createWorldCinemaHref({
        mediaType: 'movie',
        originCountry: 'JP',
      }),
    ).toBe('/world-cinema?mediaType=movie&originCountry=JP');
  });

  it('round-trips genre and year filters', () => {
    const state = parseWorldCinemaParams({
      mediaType: 'movie',
      originCountry: 'KR',
      genres: 'g1,g2',
      yearFrom: '2010',
      yearTo: '2019',
      keywords: 'kw-1',
    });

    expect(state.genreIds).toEqual(['g1', 'g2']);
    expect(state.yearFrom).toBe(2010);
    expect(state.yearTo).toBe(2019);
    expect(state.keywordIds).toEqual(['kw-1']);
  });
});
