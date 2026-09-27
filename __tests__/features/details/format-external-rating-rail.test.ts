import {
  buildExternalRatingRailItems,
  formatExternalRatingRailValue,
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
});
