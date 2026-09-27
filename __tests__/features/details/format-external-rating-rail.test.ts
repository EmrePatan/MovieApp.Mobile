import {
  buildExternalRatingRailDisplayItems,
  buildExternalRatingRailItems,
  formatExternalRatingRailValue,
  mergeCatalogTmdbRatingForRail,
} from '@/features/details/shared/utils/format-external-rating-rail';

describe('formatExternalRatingRailValue', () => {
  it('formats percent scores without scale suffix', () => {
    expect(formatExternalRatingRailValue({ source: 'tomatometer', value: 95, scale: 100 })).toBe(
      '95%',
    );
  });

  it('formats ten-point scores with one decimal', () => {
    expect(formatExternalRatingRailValue({ source: 'imdb', value: 8, scale: 10 })).toBe('8.0');
  });
});

describe('buildExternalRatingRailItems', () => {
  it('preserves provider order and splits rotten tomatoes meters', () => {
    const items = buildExternalRatingRailItems([
      { source: 'tmdb', value: 8.1, scale: 10 },
      { source: 'popcornmeter', value: 77, scale: 100 },
      { source: 'imdb', value: 8, scale: 10 },
      { source: 'tomatometer', value: 95, scale: 100 },
    ]);

    expect(items.map((item) => item.id)).toEqual([
      'imdb',
      'tmdb',
      'tomatometer',
      'popcornmeter',
    ]);
  });

  it('omits providers without values', () => {
    expect(buildExternalRatingRailItems([])).toEqual([]);
  });

  it('places TMDB immediately after IMDb', () => {
    const items = buildExternalRatingRailItems([
      { source: 'metacritic', value: 70, scale: 100 },
      { source: 'letterboxd', value: 4.2, scale: 5 },
      { source: 'tmdb', value: 8.1, scale: 10 },
      { source: 'imdb', value: 8, scale: 10 },
    ]);

    expect(items.map((item) => item.id)).toEqual(['imdb', 'tmdb', 'letterboxd', 'metacritic']);
  });
});

describe('mergeCatalogTmdbRatingForRail', () => {
  it('adds catalog TMDB vote when snapshot omits TMDB', () => {
    const merged = mergeCatalogTmdbRatingForRail(
      [{ source: 'imdb', value: 8, scale: 10 }],
      7.6,
    );

    expect(buildExternalRatingRailItems(merged).map((item) => item.id)).toEqual(['imdb', 'tmdb']);
  });

  it('does not duplicate TMDB when snapshot already includes it', () => {
    const merged = mergeCatalogTmdbRatingForRail(
      [{ source: 'tmdb', value: 8.1, scale: 10 }],
      7.6,
    );

    expect(merged.filter((rating) => rating.source === 'tmdb')).toHaveLength(1);
  });
});

describe('buildExternalRatingRailDisplayItems', () => {
  it('fills missing slots with score placeholders while loading', () => {
    const items = buildExternalRatingRailDisplayItems([], {
      catalogTmdbVoteAverage: 8.1,
      includeScorePlaceholders: true,
    });

    expect(items.map((item) => item.id)).toEqual([
      'imdb',
      'tmdb',
      'letterboxd',
      'metacritic',
      'tomatometer',
      'popcornmeter',
    ]);
    expect(items.find((item) => item.id === 'imdb')?.scorePending).toBe(true);
    expect(items.find((item) => item.id === 'tmdb')?.scorePending).toBeUndefined();
    expect(items.find((item) => item.id === 'tmdb')?.valueLabel).toBe('8.1');
  });

  it('returns resolved items only when placeholders are disabled', () => {
    const items = buildExternalRatingRailDisplayItems(
      [{ source: 'imdb', value: 8, scale: 10 }],
      { includeScorePlaceholders: false },
    );

    expect(items.map((item) => item.id)).toEqual(['imdb']);
  });
});
