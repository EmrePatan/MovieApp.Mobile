import {
  DETAIL_KEYWORD_RAIL_MAX,
  limitKeywordsForDetailRail,
} from '@/features/details/shared/utils/detail-keyword-rail';
import { createKeywordDiscoverHref } from '@/features/discovery/utils/discover-params';
import { getDiscoverBrowseScreenTitle } from '@/features/discovery/types';

describe('detail keyword rail', () => {
  it('limits keywords to a compact rail cap', () => {
    const keywords = Array.from({ length: 30 }, (_, index) => ({
      id: `11111111-1111-4111-8111-${String(index).padStart(12, '0')}`,
      name: `Keyword ${index}`,
    }));

    expect(limitKeywordsForDetailRail(keywords)).toHaveLength(DETAIL_KEYWORD_RAIL_MAX);
  });

});

describe('keyword discover navigation', () => {
  it('serializes keyword id and localized label for browse', () => {
    const keywordId = '11111111-1111-4111-8111-111111111111';
    const href = createKeywordDiscoverHref({
      id: keywordId,
      name: 'Time Travel',
    });

    expect(href).toContain(`keywords=${keywordId}`);
    const query = href.split('?')[1] ?? '';
    const params = new URLSearchParams(query);
    const labels = JSON.parse(params.get('keywordLabels') ?? '{}') as Record<string, string>;
    expect(labels[keywordId]).toBe('Time Travel');
  });

  it('uses keyword label as browse title when a single keyword is active', () => {
    const title = getDiscoverBrowseScreenTitle('trending', {
      genreIds: [],
      year: null,
      yearFrom: null,
      yearTo: null,
      minRating: null,
      minVoteCount: null,
      minRuntimeMinutes: null,
      maxRuntimeMinutes: null,
      language: null,
      originCountry: null,
      keywordIds: ['kw-guid'],
      keywordLabels: { 'kw-guid': 'Zeitreise' },
      tvStatuses: [],
      sort: 'popularity_desc',
    });

    expect(title).toBe('Zeitreise');
  });
});
