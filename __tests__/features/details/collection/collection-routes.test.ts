import {
  buildCollectionDetailRoute,
  isCollectionDetailPathname,
  parseCollectionStackSegment,
  parseCollectionTmdbIdFromPathname,
} from '@/features/details/shared/routes';

describe('collection routes', () => {
  it('builds the collection detail route from a tmdb id', () => {
    expect(buildCollectionDetailRoute(9485)).toBe('/collection/9485');
  });

  it('parses the collection tmdb id from the pathname', () => {
    expect(parseCollectionTmdbIdFromPathname('/collection/9485')).toBe(9485);
    expect(parseCollectionTmdbIdFromPathname('collection/9485')).toBe(9485);
    expect(parseCollectionTmdbIdFromPathname('/movie/9485')).toBeNull();
    expect(parseCollectionStackSegment('/collection/9485')).toBe('9485');
  });

  it('detects collection detail pathnames', () => {
    expect(isCollectionDetailPathname('/collection/9485')).toBe(true);
    expect(isCollectionDetailPathname('/movie/9485')).toBe(false);
  });
});
