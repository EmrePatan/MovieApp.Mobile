import { resolveHomeSectionTitle } from '@/features/home/utils/resolve-home-section-title';
import { t } from '../../i18n/i18n-test-utils';

describe('resolveHomeSectionTitle', () => {
  it('localizes known home section types in English', () => {
    expect(resolveHomeSectionTitle('HotThisWeek', 'Hot This Week', t)).toBe('Hot This Week');
    expect(resolveHomeSectionTitle('Trending', 'Trending Now', t)).toBe('Trending Now');
    expect(resolveHomeSectionTitle('TopRated', 'Top Rated', t)).toBe('Top Rated');
    expect(resolveHomeSectionTitle('NewReleases', 'New Releases', t)).toBe('New Releases');
    expect(resolveHomeSectionTitle('ComingUp', 'Coming Up', t)).toBe('Coming Up');
    expect(resolveHomeSectionTitle('OnTvThisWeek', 'On TV This Week', t)).toBe('On TV This Week');
    expect(resolveHomeSectionTitle('NowInTheaters', 'Now in Theaters', t)).toBe('Now in Theaters');
    expect(
      resolveHomeSectionTitle('ComingUp', 'Coming Up', t, { comingUpSource: 'personalized' }),
    ).toBe('Coming Up For You');
  });

  it('falls back to the API title for unknown section types', () => {
    expect(resolveHomeSectionTitle('Genre', 'Action Hits', t)).toBe('Action Hits');
  });
});
