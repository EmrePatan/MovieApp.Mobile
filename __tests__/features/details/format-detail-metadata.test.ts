import {
  formatMovieDetailMetadataLine,
  formatTvDetailMetadataLine,
} from '@/features/details/shared/utils/format-detail-metadata';

describe('formatMovieDetailMetadataLine', () => {
  it('omits TMDB vote average from the metadata line', () => {
    const line = formatMovieDetailMetadataLine({
      releaseDate: '2014-11-07',
      runtimeMinutes: 169,
    });

    expect(line).not.toMatch(/★|8\./);
    expect(line).toContain('2014');
  });
});

describe('formatTvDetailMetadataLine', () => {
  it('omits TMDB vote average from the metadata line', () => {
    const line = formatTvDetailMetadataLine({
      firstAirDate: '2008-01-20',
      seasonCount: 5,
    });

    expect(line).not.toMatch(/★|8\./);
    expect(line).toContain('2008');
  });
});
