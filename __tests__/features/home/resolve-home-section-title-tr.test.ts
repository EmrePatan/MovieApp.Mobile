import { resolveHomeSectionTitle } from '@/features/home/utils/resolve-home-section-title';
import { initI18nForTests, t } from '../../i18n/i18n-test-utils';

describe('resolveHomeSectionTitle (Turkish)', () => {
  beforeAll(async () => {
    await initI18nForTests('tr');
  });

  it('localizes known home section types in Turkish', () => {
    expect(resolveHomeSectionTitle('Trending', 'Trending Now', t)).toBe('Şimdi Trend');
    expect(resolveHomeSectionTitle('TopRated', 'Top Rated', t)).toBe('En Yüksek Puanlı');
    expect(resolveHomeSectionTitle('NewReleases', 'New Releases', t)).toBe('Yeni Vizyon');
    expect(resolveHomeSectionTitle('ComingUp', 'Coming Up', t)).toBe('Yakında');
    expect(resolveHomeSectionTitle('RecommendedForYou', 'Recommended For You', t)).toBe(
      'Senin İçin Önerilen',
    );
  });
});
