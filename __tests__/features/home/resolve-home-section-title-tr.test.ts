import { resolveHomeSectionTitle } from '@/features/home/utils/resolve-home-section-title';
import { initI18nForTests, t } from '../../i18n/i18n-test-utils';

describe('resolveHomeSectionTitle (Turkish)', () => {
  beforeAll(async () => {
    await initI18nForTests('tr');
  });

  it('localizes known home section types in Turkish', () => {
    expect(resolveHomeSectionTitle('HotThisWeek', 'Hot This Week', t)).toBe('Bu Hafta Trend');
    expect(resolveHomeSectionTitle('Trending', 'Trending Now', t)).toBe('Bu Hafta Trend');
    expect(resolveHomeSectionTitle('TopRated', 'Top Rated', t)).toBe('En Yüksek Puanlı');
    expect(resolveHomeSectionTitle('NewReleases', 'New Releases', t)).toBe('Yeni Yayınlar');
    expect(resolveHomeSectionTitle('ComingUp', 'Coming Up', t)).toBe('Yakında');
    expect(resolveHomeSectionTitle('ComingUp', 'Coming Up', t, { comingUpSource: 'for-you' })).toBe(
      'Yakında',
    );
    expect(
      resolveHomeSectionTitle('ComingUp', 'Coming Up', t, { comingUpSource: 'personalized' }),
    ).toBe('Senin İçin Yakında');
    expect(resolveHomeSectionTitle('RecommendedForYou', 'Recommended For You', t)).toBe(
      'Senin için önerilen',
    );
    expect(resolveHomeSectionTitle('OnTvThisWeek', 'On TV This Week', t)).toBe('Bu Hafta TV’de');
    expect(resolveHomeSectionTitle('NowInTheaters', 'Now in Theaters', t)).toBe(
      'Şimdi Sinemalarda',
    );
  });
});
