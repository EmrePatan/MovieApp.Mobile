import { buildDiscoveryKeywordsPath, buildBrowsePath, buildWorldCinemaPath } from '@/features/discovery/api/routes';
import { createDefaultDiscoveryFilters } from '@/features/discovery/types';
import { createDefaultWorldCinemaState } from '@/features/discovery/world-cinema-types';

describe('discovery catalog filter routes', () => {
  it('builds keyword search path', () => {
    expect(
      buildDiscoveryKeywordsPath({
        query: 'time',
        page: 1,
        pageSize: 20,
      }),
    ).toBe('/api/discovery/keywords?query=time&page=1&pageSize=20');
  });

  it('appends keyword and tv status params on browse', () => {
    const path = buildBrowsePath({
      mode: 'trending',
      type: 'tv',
      page: 1,
      pageSize: 20,
      ...createDefaultDiscoveryFilters('trending'),
      keywordIds: ['kw-1'],
      tvStatuses: ['returning_series'],
      sort: 'popularity_desc',
    });

    expect(path).toContain('keywordId=kw-1');
    expect(path).toContain('tvStatus=returning_series');
  });

  it('appends world cinema advanced filter params', () => {
    const path = buildWorldCinemaPath({
      ...createDefaultWorldCinemaState(),
      genreIds: ['g1'],
      yearFrom: 2010,
      yearTo: 2019,
      minRating: 7,
      originalLanguage: 'ko',
      keywordIds: ['kw-1'],
      page: 1,
      pageSize: 20,
    });

    expect(path).toContain('genreId=g1');
    expect(path).toContain('yearFrom=2010');
    expect(path).toContain('yearTo=2019');
    expect(path).toContain('minRating=7');
    expect(path).toContain('originalLanguage=ko');
    expect(path).toContain('keywordId=kw-1');
  });
});
