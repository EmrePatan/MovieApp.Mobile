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
      railOrder: [
        'platforms',
        'genres',
        'world-cinema',
        'hidden-gems',
        'popular',
        'new-releases',
        'top-rated',
      ],
      trending: {
        items: [
          {
            id: 'trend-1',
            type: 'movie',
            title: 'Should Not Trend',
            posterUrl: '/poster.jpg',
          },
        ],
      },
      hiddenGems: {
        items: [
          {
            id: 'gem-1',
            type: 'movie',
            title: 'Quiet Gem',
            posterUrl: '/poster.jpg',
          },
          {
            id: 'person-1',
            type: 'person',
            title: 'Not A Gem',
            posterUrl: null,
          },
        ],
      },
      popular: {
        items: [
          {
            id: 'pop-1',
            type: 'tv',
            title: 'Popular Show',
            posterUrl: '/poster.jpg',
          },
        ],
      },
      topRated: {
        items: [
          {
            id: 'top-1',
            type: 'movie',
            title: 'Top Title',
            posterUrl: '/poster.jpg',
          },
        ],
      },
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
    refetch: jest.fn(),
  })),
}));

jest.mock('@/features/discovery/hooks/useGenres', () => ({
  useGenres: jest.fn(() => ({
    data: [
      { id: 'g-action', name: 'Action' },
      { id: 'g-drama', name: 'Drama' },
      { id: 'g-news', name: 'News' },
    ],
    isLoading: false,
    isError: false,
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

jest.mock('@/features/discovery/hooks/useDiscoveryWatchProviders', () => ({
  useDiscoveryWatchProviders: jest.fn(() => ({
    data: {
      watchRegion: 'TR',
      mediaType: 'movie',
      providers: [
        {
          providerId: 8,
          name: 'Netflix',
          logoPath: '/netflix.png',
          displayPriority: 1,
        },
      ],
    },
    isLoading: false,
    isError: false,
    refetch: jest.fn(),
  })),
}));

jest.mock('@/features/discovery/hooks/useStreamingProviderSpotlight', () => ({
  useStreamingProviderSpotlight: jest.fn(() => ({
    data: {
      items: [
        {
          id: 'spot-1',
          type: 'movie',
          title: 'Spotlight Film',
          posterUrl: '/poster.jpg',
        },
      ],
    },
    isLoading: false,
    isError: false,
    refetch: jest.fn(),
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

describe('DiscoverHubContent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the discover hub feature entries without a duplicate title header', () => {
    render(<DiscoverHubContent />);

    expect(screen.queryByText('Discover')).toBeNull();
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

    expect(screen.getByLabelText(t('discover.hub.aiRecommendations.accessibility'))).toBeTruthy();
    fireEvent.press(screen.getByLabelText(t('discover.hub.aiRecommendations.accessibility')));

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

    expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('originCountry=KR'));
  });

  it('updates preview collection when a cinema chip is selected', () => {
    const { useWorldCinemaPreview } = jest.requireMock(
      '@/features/discovery/hooks/useWorldCinemaPreview',
    );

    render(<DiscoverHubContent />);

    fireEvent.press(screen.getByTestId('world-cinema-chip-JP'));

    expect(useWorldCinemaPreview).toHaveBeenLastCalledWith('JP', 'movie');
  });

  it('renders streaming platform poster row and opens platform on tap', () => {
    render(<DiscoverHubContent />);

    expect(screen.getByTestId('streaming-platforms-hub')).toBeTruthy();
    expect(screen.queryByTestId('streaming-platforms-preview')).toBeNull();

    fireEvent.press(
      screen.getByLabelText(
        t('discover.streamingPlatformsHub.openPlatform', { provider: 'Netflix' }),
      ),
    );

    expect(mockOpenLibraryStackScreen).toHaveBeenCalledWith(
      expect.anything(),
      expect.stringContaining('watchProviderId=8'),
      '/discover',
    );
  });

  it('opens streaming platforms directory from See All', () => {
    render(<DiscoverHubContent />);

    fireEvent.press(screen.getByTestId('streaming-platforms-hub-see-all'));

    expect(mockOpenLibraryStackScreen).toHaveBeenCalledWith(
      expect.anything(),
      '/streaming-platforms',
      '/discover',
    );
  });

  it('renders Keşfet rails in catalog order without a general trend rail', () => {
    render(<DiscoverHubContent />);

    expect(screen.getByText('Fresh Release')).toBeTruthy();
    expect(screen.getByText('Quiet Gem')).toBeTruthy();
    expect(screen.getByText('Popular Show')).toBeTruthy();
    expect(screen.getByText('Top Title')).toBeTruthy();
    expect(screen.queryByText('Should Not Trend')).toBeNull();
    expect(screen.queryByText('Not A Gem')).toBeNull();
    expect(screen.queryByTestId('on-tv-this-week-preview')).toBeNull();
    expect(screen.queryByTestId('now-in-theaters-preview')).toBeNull();
    expect(screen.getByTestId('genres-hub')).toBeTruthy();
    expect(screen.getByText('By Genre')).toBeTruthy();
    expect(screen.getByText('Action')).toBeTruthy();
    expect(screen.queryByText('News')).toBeNull();

    const serialized = JSON.stringify(screen.toJSON());
    const railIds = [
      'streaming-platforms-hub',
      'genres-hub',
      'world-cinema-hub',
      'discover-rail-hidden-gems',
      'discover-rail-popular',
      'discover-rail-new-releases',
      'discover-rail-top-rated',
    ];
    const indexes = railIds.map((id) => serialized.indexOf(id));
    expect(indexes.every((index) => index >= 0)).toBe(true);
    expect([...indexes].sort((left, right) => left - right)).toEqual(indexes);
  });

  it('renders Türlere Göre when the genres API returns Turkish names', () => {
    const { useGenres } = jest.requireMock('@/features/discovery/hooks/useGenres') as {
      useGenres: jest.Mock;
    };
    const original = useGenres.getMockImplementation();
    useGenres.mockImplementation(() => ({
      data: [
        { id: 'g-news', name: 'Haber' },
        { id: 'g-comedy', name: 'Komedi' },
        { id: 'g-action', name: 'Aksiyon' },
        { id: 'g-scifi', name: 'Bilim Kurgu' },
      ],
      isLoading: false,
      isError: false,
    }));

    try {
      render(<DiscoverHubContent />);

      expect(screen.getByTestId('genres-hub')).toBeTruthy();
      expect(screen.getByText('By Genre')).toBeTruthy();
      expect(screen.getByText('Aksiyon')).toBeTruthy();
      expect(screen.getByText('Komedi')).toBeTruthy();
      expect(screen.getByText('Bilim Kurgu')).toBeTruthy();
      expect(screen.queryByText('Haber')).toBeNull();

      const serialized = JSON.stringify(screen.toJSON());
      const labels = ['Aksiyon', 'Komedi', 'Bilim Kurgu'];
      const indexes = labels.map((label) => serialized.indexOf(label));
      expect(indexes.every((index) => index >= 0)).toBe(true);
      expect([...indexes].sort((left, right) => left - right)).toEqual(indexes);
    } finally {
      useGenres.mockImplementation(original);
    }
  });

  it('still renders the genres rail when returned names are outside the main set', () => {
    const { useGenres } = jest.requireMock('@/features/discovery/hooks/useGenres') as {
      useGenres: jest.Mock;
    };
    const original = useGenres.getMockImplementation();
    useGenres.mockImplementation(() => ({
      data: [{ id: 'g-local', name: 'Yerel Tür' }],
      isLoading: false,
      isError: false,
    }));

    try {
      render(<DiscoverHubContent />);

      expect(screen.getByTestId('genres-hub')).toBeTruthy();
      expect(screen.getByText('Yerel Tür')).toBeTruthy();
    } finally {
      useGenres.mockImplementation(original);
    }
  });

  it('opens a main genre on the popular title list', () => {
    render(<DiscoverHubContent />);

    fireEvent.press(screen.getByTestId('genre-hub-tile-g-action'));

    expect(mockOpenLibraryStackScreen).toHaveBeenCalledWith(
      expect.anything(),
      expect.stringContaining('mode=popular'),
      '/discover',
    );
    expect(mockOpenLibraryStackScreen).toHaveBeenCalledWith(
      expect.anything(),
      expect.stringContaining('genres=g-action'),
      '/discover',
    );
  });

  it('opens new releases browse from See All', () => {
    render(<DiscoverHubContent />);

    fireEvent.press(
      screen.getByLabelText(t('common.seeAllTitle', { title: t('discover.hub.newReleases') })),
    );

    expect(mockOpenLibraryStackScreen).toHaveBeenCalledWith(
      expect.anything(),
      '/discover-browse?mode=new_releases&type=all',
      '/(tabs)/discover',
    );
  });
});
