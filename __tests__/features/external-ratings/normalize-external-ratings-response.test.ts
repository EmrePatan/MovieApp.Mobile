import {
  isValidExternalRatingItem,
  normalizeExternalRatingsResponse,
} from '@/features/external-ratings/utils/normalize-external-ratings-response';

describe('normalize-external-ratings-response', () => {
  it('rejects invalid rating rows', () => {
    expect(isValidExternalRatingItem(null)).toBe(false);
    expect(isValidExternalRatingItem({ source: 'imdb', value: null, scale: 10 })).toBe(false);
    expect(isValidExternalRatingItem({ source: '', value: 8, scale: 10 })).toBe(false);
    expect(isValidExternalRatingItem({ source: 'imdb', value: 8, scale: 0 })).toBe(false);
  });

  it('normalizes null ratings to an empty list', () => {
    expect(
      normalizeExternalRatingsResponse({
        fetchedAtUtc: null,
        isStale: false,
        ratings: null,
      }),
    ).toEqual({ fetchedAtUtc: null, isStale: false, ratings: [] });
  });

  it('filters broken rows and keeps valid ratings', () => {
    expect(
      normalizeExternalRatingsResponse({
        fetchedAtUtc: '2026-01-01T00:00:00Z',
        isStale: true,
        ratings: [
          { source: 'imdb', value: 7.5, scale: 10 },
          { source: 'letterboxd', value: null, scale: 5 },
          null,
        ],
      }),
    ).toEqual({
      fetchedAtUtc: '2026-01-01T00:00:00Z',
      isStale: true,
      ratings: [{ source: 'imdb', value: 7.5, scale: 10 }],
    });
  });
});
