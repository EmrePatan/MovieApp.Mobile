import { resolveHomeSectionTitle } from '@/features/home/utils/resolve-home-section-title';
import { t } from '../../i18n/i18n-test-utils';

describe('resolveHomeSectionTitle', () => {
  it('localizes known home section types in English', () => {
    expect(resolveHomeSectionTitle('Trending', 'Trending Now', t)).toBe('Trending Now');
    expect(resolveHomeSectionTitle('TopRated', 'Top Rated', t)).toBe('Top Rated');
    expect(resolveHomeSectionTitle('NewReleases', 'New Releases', t)).toBe('New Releases');
    expect(resolveHomeSectionTitle('ComingUp', 'Coming Up', t)).toBe('Coming Up');
  });

  it('falls back to the API title for unknown section types', () => {
    expect(resolveHomeSectionTitle('Genre', 'Action Hits', t)).toBe('Action Hits');
  });
});
