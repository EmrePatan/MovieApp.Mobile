import { render, screen } from '@testing-library/react-native';
import { I18nextProvider } from 'react-i18next';
import { changeUiLanguage, i18n } from '@/i18n';
import {
  translateContentType,
  translateDiscoveryBrowseMode,
  translateLibrarySort,
  translateGenreName,
  translateMovieDnaGenreTitle,
} from '@/i18n/catalog-labels';
import { formatContentType } from '@/utils/format';
import { NotificationsEmptyState } from '@/features/notifications/components/NotificationsEmptyState';
import { InsightsMilestonesSection } from '@/features/insights/components/InsightsMilestonesSection';
import { ProfileYourYearSection } from '@/features/profile/components/ProfileYourYearSection';
import { LibraryContinueWatchingSection } from '@/features/library/components/LibraryContinueWatchingSection';
import { createProfileStatisticsFixture } from '@/features/profile/utils/profile-statistics-fixtures';
import { AiRecommendationsContent } from '@/features/ai-recommendations/components/AiRecommendationsContent';
import { InsightsMovieDnaHero } from '@/features/insights/components/InsightsMovieDnaHero';
import { insightsV3Fixture } from '@/features/insights/utils/insights-fixtures';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

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
    expect(translateGenreName('Action')).toBe('Aksiyon');
    expect(translateGenreName('Science Fiction')).toBe('Bilim Kurgu');
    expect(translateGenreName('Reality')).toBe('Gerçeklik');
    expect(translateGenreName('Talk')).toBe('Söyleşi');
    expect(translateGenreName('Western')).toBe('Kovboy');
    expect(formatContentType('movie')).toBe('Film');
  });

  it('renders localized notifications empty state', async () => {
    renderWithI18n(<NotificationsEmptyState />);

    expect(screen.getByText('No notifications yet')).toBeTruthy();

    await changeUiLanguage('tr');
    renderWithI18n(<NotificationsEmptyState />);

    expect(screen.getByText('Henüz bildirim yok')).toBeTruthy();
  });

  it('renders localized movie dna kicker', async () => {
    renderWithI18n(<InsightsMovieDnaHero movieDna={insightsV3Fixture.movieDna} />);

    expect(screen.getByText('Your Movie DNA')).toBeTruthy();

    await changeUiLanguage('tr');
    renderWithI18n(<InsightsMovieDnaHero movieDna={insightsV3Fixture.movieDna} />);

    expect(screen.getByText("Film DNA'n")).toBeTruthy();
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

  it('renders localized profile preview section headers', async () => {
    const statistics = createProfileStatisticsFixture();
    renderWithI18n(<ProfileYourYearSection activity={statistics.activity} />);

    expect(screen.getByText('Your Year')).toBeTruthy();

    await changeUiLanguage('tr');
    renderWithI18n(<ProfileYourYearSection activity={statistics.activity} />);

    expect(screen.getByText('Senin Yılın')).toBeTruthy();
  });

  it('renders localized continue watching section title', async () => {
    renderWithI18n(
      <LibraryContinueWatchingSection
        items={[
          {
            id: 'tv-1',
            title: 'Breaking Bad',
            contentType: 'tv',
            posterUrl: null,
            voteAverage: 9,
            seasonNumber: 1,
            episodeNumber: 1,
            episodeName: 'Pilot',
          },
        ]}
        onItemPress={jest.fn()}
      />,
    );

    expect(screen.getByText('Continue Watching')).toBeTruthy();

    await changeUiLanguage('tr');
    renderWithI18n(
      <LibraryContinueWatchingSection
        items={[
          {
            id: 'tv-1',
            title: 'Breaking Bad',
            contentType: 'tv',
            posterUrl: null,
            voteAverage: 9,
            seasonNumber: 1,
            episodeNumber: 1,
            episodeName: 'Pilot',
          },
        ]}
        onItemPress={jest.fn()}
      />,
    );

    expect(screen.getByText('İzlemeye Devam Et')).toBeTruthy();
  });

  it('renders localized AI recommendations composer copy', async () => {
    const queryClient = new QueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <I18nextProvider i18n={i18n}>
          <AiRecommendationsContent />
        </I18nextProvider>
      </QueryClientProvider>,
    );

    expect(screen.getByText('What should we find?')).toBeTruthy();

    await changeUiLanguage('tr');
    render(
      <QueryClientProvider client={queryClient}>
        <I18nextProvider i18n={i18n}>
          <AiRecommendationsContent />
        </I18nextProvider>
      </QueryClientProvider>,
    );

    expect(screen.getByText('Ne bulalım?')).toBeTruthy();
  });
});
