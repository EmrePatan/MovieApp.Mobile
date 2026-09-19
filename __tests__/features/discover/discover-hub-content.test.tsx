import { fireEvent, render, screen } from '@testing-library/react-native';
import { DiscoverHubContent } from '@/features/discover/components/DiscoverHubContent';
import { t } from '../../i18n/i18n-test-utils';

const mockPush = jest.fn();
const mockOpenLibraryStackScreen = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush }),
}));

jest.mock('@tanstack/react-query', () => ({
  useQueryClient: () => ({}),
}));

jest.mock('@/features/discovery/hooks/useExplorePreview', () => ({
  useExplorePreview: jest.fn(() => ({
    data: {
      trending: { items: [] },
      topRated: { items: [] },
      newReleases: {
        items: [
          {
            id: 'movie-2',
            type: 'movie',
            title: 'Fresh Release',
            posterUrl: '/poster.jpg',
          },
        ],
      },
    },
  })),
}));

jest.mock('@/features/discovery/hooks/useNowInTheatersPreview', () => ({
  useNowInTheatersPreview: jest.fn(() => ({
    data: {
      items: [
        {
          id: 'movie-1',
          type: 'movie',
          title: 'Cinema One',
          posterUrl: '/poster.jpg',
        },
      ],
    },
    isLoading: false,
    isError: false,
    refetch: jest.fn(),
  })),
}));

jest.mock('@/features/discovery/hooks/useOnTvThisWeekPreview', () => ({
  useOnTvThisWeekPreview: jest.fn(() => ({
    data: {
      items: [
        {
          id: 'tv-1',
          type: 'tv',
          title: 'Airing Drama',
          posterUrl: '/poster.jpg',
        },
      ],
    },
    isLoading: false,
    isError: false,
    refetch: jest.fn(),
  })),
}));

jest.mock('@/features/regions/hooks/useRegionalPreference', () => ({
  useRegionalPreference: jest.fn(() => ({
    region: 'TR',
    source: 'fallback',
    isHydrated: true,
    setRegion: jest.fn(),
    resetToDeviceDefault: jest.fn(),
  })),
}));

jest.mock('@/features/discovery/hooks/useWorldCinemaPreview', () => ({
  useWorldCinemaPreview: jest.fn(() => ({
    data: {
      items: [
        {
          id: 'movie-1',
          type: 'movie',
          title: 'Parasite',
          posterUrl: '/poster.jpg',
        },
      ],
    },
    isLoading: false,
    isError: false,
    refetch: jest.fn(),
  })),
}));

jest.mock('@/features/library/navigation/library-stack-navigation', () => ({
  openLibraryStackScreen: (...args: unknown[]) => mockOpenLibraryStackScreen(...args),
}));

jest.mock('@/features/navigation/components/GlobalSearchEntry', () => ({
  GlobalSearchEntry: ({ origin }: { origin: string }) => {
    const React = require('react');
    const { Pressable, Text } = require('react-native');
    return React.createElement(
      Pressable,
      { accessibilityLabel: `Global search from ${origin}` },
      React.createElement(Text, null, 'Search movies, shows & people'),
    );
  },
}));

describe('DiscoverHubContent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the discover hub search entry and D1 filters entry', () => {
    render(<DiscoverHubContent />);

    expect(screen.getByText('Discover')).toBeTruthy();
    expect(screen.getByLabelText('Global search from discover')).toBeTruthy();
    expect(screen.getByLabelText('Advanced Discover')).toBeTruthy();
    expect(screen.getByText('Advanced Discover')).toBeTruthy();
    expect(screen.getByText('Genre · Year · Rating · Runtime · Country')).toBeTruthy();
  });

  it('opens advanced discover from Advanced Discover entry', () => {
    render(<DiscoverHubContent />);

    fireEvent.press(screen.getByLabelText('Advanced Discover'));

    expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('/advanced-discover'));
  });

  it('activates Pick Something For Me from the discover hub', () => {
    render(<DiscoverHubContent />);

    expect(screen.getByLabelText('Pick Something For Me')).toBeTruthy();
    fireEvent.press(screen.getByLabelText('Pick Something For Me'));

    expect(mockPush).toHaveBeenCalledWith('/pick-something');
  });

  it('opens AI Recommendations from the discover hub', () => {
    render(<DiscoverHubContent />);

    expect(screen.getByLabelText('AI Recommendations')).toBeTruthy();
    fireEvent.press(screen.getByLabelText('AI Recommendations'));

    expect(mockPush).toHaveBeenCalledWith('/ai-recommendations');
  });

  it('renders World Cinema hub with default collection preview', () => {
    render(<DiscoverHubContent />);

    expect(screen.getByTestId('world-cinema-hub')).toBeTruthy();
    expect(screen.getByTestId('world-cinema-preview')).toBeTruthy();
    expect(screen.getByText('Parasite')).toBeTruthy();
    expect(screen.getByLabelText(t('discover.worldCinemaHub.seeAllAccessibility'))).toBeTruthy();
  });

  it('opens world cinema with selected origin country from Explore', () => {
    render(<DiscoverHubContent />);

    fireEvent.press(screen.getByLabelText(t('discover.worldCinemaHub.seeAllAccessibility')));

    expect(mockPush).toHaveBeenCalledWith(
      expect.stringContaining('originCountry=KR'),
    );
  });

  it('updates preview collection when a cinema chip is selected', () => {
    const { useWorldCinemaPreview } = jest.requireMock(
      '@/features/discovery/hooks/useWorldCinemaPreview',
    );

    render(<DiscoverHubContent />);

    fireEvent.press(screen.getByTestId('world-cinema-chip-JP'));

    expect(useWorldCinemaPreview).toHaveBeenLastCalledWith('JP', 'movie');
  });

  it('renders On TV This Week preview section with See All', () => {
    render(<DiscoverHubContent />);

    expect(screen.getByTestId('on-tv-this-week-preview')).toBeTruthy();
    expect(
      screen.getByLabelText(
        t('common.seeAllTitle', { title: t('discover.hub.onTvThisWeek.title') }),
      ),
    ).toBeTruthy();
  });

  it('opens on tv this week from See All', () => {
    render(<DiscoverHubContent />);

    fireEvent.press(
      screen.getByLabelText(
        t('common.seeAllTitle', { title: t('discover.hub.onTvThisWeek.title') }),
      ),
    );

    expect(mockPush).toHaveBeenCalledWith('/on-tv-this-week');
  });

  it('renders Now in Theaters preview section with See All', () => {
    render(<DiscoverHubContent />);

    expect(screen.getByTestId('now-in-theaters-preview')).toBeTruthy();
    expect(
      screen.getByLabelText(
        t('common.seeAllTitle', { title: t('discover.hub.nowInTheaters.title') }),
      ),
    ).toBeTruthy();
  });

  it('opens now in theaters from See All', () => {
    render(<DiscoverHubContent />);

    fireEvent.press(
      screen.getByLabelText(
        t('common.seeAllTitle', { title: t('discover.hub.nowInTheaters.title') }),
      ),
    );

    expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('/now-in-theaters'));
  });

  it('opens streaming discover from Streaming Services', () => {
    render(<DiscoverHubContent />);

    fireEvent.press(screen.getByLabelText('Streaming Services'));

    expect(mockPush).toHaveBeenCalledWith(
      expect.stringContaining('/streaming-discover?mediaType=movie&watchRegion=TR'),
    );
  });

  it('renders New Releases preview and does not show Explore by Genre', () => {
    render(<DiscoverHubContent />);

    expect(screen.getByText('Fresh Release')).toBeTruthy();
    expect(
      screen.getByLabelText(
        t('common.seeAllTitle', { title: t('discover.hub.newReleases') }),
      ),
    ).toBeTruthy();
    expect(screen.queryByText('Explore by Genre')).toBeNull();
  });

  it('opens new releases browse from See All', () => {
    render(<DiscoverHubContent />);

    fireEvent.press(
      screen.getByLabelText(
        t('common.seeAllTitle', { title: t('discover.hub.newReleases') }),
      ),
    );

    expect(mockOpenLibraryStackScreen).toHaveBeenCalledWith(
      expect.anything(),
      '/discover-browse?mode=new_releases&type=all',
      '/(tabs)/discover',
    );
  });

});
