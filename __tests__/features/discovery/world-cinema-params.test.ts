import {
  createWorldCinemaHref,
  parseWorldCinemaParams,
} from '@/features/discovery/utils/world-cinema-params';

describe('world-cinema-params', () => {
  it('parses valid world cinema params', () => {
    const state = parseWorldCinemaParams({
      mediaType: 'tv',
      originCountry: 'FR',
      sort: 'rating_desc',
    });

    expect(state).toEqual({
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
});
