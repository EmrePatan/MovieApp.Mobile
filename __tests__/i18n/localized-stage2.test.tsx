import { render, screen } from '@testing-library/react-native';
import { I18nextProvider } from 'react-i18next';
import { changeUiLanguage, i18n } from '@/i18n';
import {
  translateContentType,
  translateDiscoveryBrowseMode,
  translateLibrarySort,
  translateMovieDnaGenreTitle,
} from '@/i18n/catalog-labels';
import { formatContentType } from '@/utils/format';
import { NotificationsEmptyState } from '@/features/notifications/components/NotificationsEmptyState';
import { InsightsMilestonesSection } from '@/features/insights/components/InsightsMilestonesSection';

function renderWithI18n(ui: React.ReactElement) {
  return render(<I18nextProvider i18n={i18n}>{ui}</I18nextProvider>);
}

describe('Stage 2 localization', () => {
  beforeEach(async () => {
    await changeUiLanguage('en');
  });

  it('translates catalog label helpers in English', () => {
    expect(translateContentType('movie')).toBe('Movie');
    expect(translateDiscoveryBrowseMode('trending')).toBe('Trending');
    expect(translateLibrarySort('titleAsc')).toBe('Title A–Z');
    expect(translateMovieDnaGenreTitle('Science Fiction')).toBe('Sci-Fi Explorer');
    expect(formatContentType('tv')).toBe('TV');
  });

  it('translates catalog label helpers in Turkish', async () => {
    await changeUiLanguage('tr');

    expect(translateContentType('person')).toBe('Kişi');
    expect(translateDiscoveryBrowseMode('top_rated')).toBe('En Yüksek Puanlı');
    expect(translateLibrarySort('recentlyAdded')).toBe('Son Eklenenler');
    expect(formatContentType('movie')).toBe('Film');
  });

  it('renders localized notifications empty state', async () => {
    renderWithI18n(<NotificationsEmptyState />);

    expect(screen.getByText('No notifications yet')).toBeTruthy();

    await changeUiLanguage('tr');
    renderWithI18n(<NotificationsEmptyState />);

    expect(screen.getByText('Henüz bildirim yok')).toBeTruthy();
  });

  it('renders localized insights milestone section header', async () => {
    renderWithI18n(
      <InsightsMilestonesSection
        achievements={[
          {
            id: 'a1',
            title: 'First movie watched',
            category: 'movies',
            targetValue: 1,
            currentValue: 1,
            achieved: true,
            achievedAt: '2026-01-01T00:00:00Z',
          },
        ]}
      />,
    );

    expect(screen.getByText('Achievements')).toBeTruthy();

    await changeUiLanguage('tr');
    renderWithI18n(
      <InsightsMilestonesSection
        achievements={[
          {
            id: 'a1',
            title: 'First movie watched',
            category: 'movies',
            targetValue: 1,
            currentValue: 1,
            achieved: true,
            achievedAt: '2026-01-01T00:00:00Z',
          },
        ]}
      />,
    );

    expect(screen.getByText('Başarılar')).toBeTruthy();
  });
});
