import {
  buildExternalRatingCards,
  formatExternalRatingValue,
  formatRottenTomatoesScores,
} from '@/features/external-ratings/utils/format-external-rating';

describe('format-external-rating', () => {
  it('formats native scales', () => {
    expect(formatExternalRatingValue({ source: 'imdb', value: 8.4, scale: 10 })).toBe('8.4 / 10');
    expect(formatExternalRatingValue({ source: 'letterboxd', value: 4.2, scale: 5 })).toBe('4.2 / 5');
    expect(formatExternalRatingValue({ source: 'tomatometer', value: 93, scale: 100 })).toBe('93%');
  });

  it('combines rotten tomatoes critics and audience in one line', () => {
    const line = formatRottenTomatoesScores(
      { source: 'tomatometer', value: 93, scale: 100 },
      { source: 'popcornmeter', value: 89, scale: 100 },
    );

    expect(line).toBe('93% · 89%');
  });

  it('builds a rotten tomatoes card with paired score fields', () => {
    const cards = buildExternalRatingCards([
      { source: 'imdb', value: 8.4, scale: 10 },
      { source: 'tomatometer', value: 93, scale: 100 },
      { source: 'popcornmeter', value: 89, scale: 100 },
      { source: 'metacritic', value: 82, scale: 100 },
    ]);

    expect(cards.map((card) => card.id)).toEqual([
      'imdb',
      'metacritic',
      'rotten-tomatoes',
    ]);

    const rtCard = cards[2];
    expect(rtCard.kind).toBe('rotten-tomatoes');
    if (rtCard.kind === 'rotten-tomatoes') {
      expect(rtCard.tomatometerScore).toBe('93%');
      expect(rtCard.popcornmeterScore).toBe('89%');
      expect(rtCard.accessibilityLabel).toContain('Tomatometer 93%');
      expect(rtCard.accessibilityLabel).toContain('Popcornmeter 89%');
    }
  });
});
