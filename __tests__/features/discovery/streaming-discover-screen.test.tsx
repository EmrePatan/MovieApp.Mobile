import { fireEvent, render, screen } from '@testing-library/react-native';
import StreamingDiscoverScreen from '../../../app/(tabs)/(app-shell)/streaming-discover';
import { useDiscoveryWatchProviders } from '@/features/discovery/hooks/useDiscoveryWatchProviders';
import { useStreamingDiscover } from '@/features/discovery/hooks/useStreamingDiscover';
import { openCatalogDetailFromLibraryStack } from '@/features/details/shared/navigation/catalog-detail-navigation';
import { t } from '../../i18n/i18n-test-utils';

const mockSetParams = jest.fn();
const mockPush = jest.fn();
const mockReplace = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ setParams: mockSetParams, push: mockPush, replace: mockReplace, back: jest.fn() }),
  useLocalSearchParams: jest.fn(() => ({})),
  useSegments: jest.fn(() => ['streaming-discover']),
  usePathname: jest.fn(() => '/streaming-discover'),
  useFocusEffect: (callback: () => void | (() => void)) => {
    const cleanup = callback();
    return cleanup;
  },
}));

jest.mock('@/features/discovery/hooks/useDiscoveryWatchProviders', () => ({
  useDiscoveryWatchProviders: jest.fn(),
}));

jest.mock('@/features/discovery/hooks/useStreamingDiscover', () => ({
  useStreamingDiscover: jest.fn(),
}));

jest.mock('@/features/discovery/hooks/useStreamingProviderSpotlight', () => ({
  useStreamingProviderSpotlight: jest.fn(() => ({
    data: { items: [] },
    isLoading: false,
    isError: false,
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

jest.mock('@/features/details/shared/components/DetailScreenScaffold', () => ({
  DetailBackButton: () => null,
}));

jest.mock('@/features/details/shared/navigation/catalog-detail-navigation', () => ({
  openCatalogDetailFromLibraryStack: jest.fn(),
}));

jest.mock('@tanstack/react-query', () => {
  const actual = jest.requireActual('@tanstack/react-query');

  return {
    ...actual,
    useQueryClient: () => ({
      prefetchQuery: jest.fn(),
      invalidateQueries: jest.fn(),
    }),
  };
});

describe('StreamingDiscoverScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    const { useLocalSearchParams } = jest.requireMock('expo-router');
    useLocalSearchParams.mockReturnValue({});
    (useDiscoveryWatchProviders as jest.Mock).mockReturnValue({
      data: {
        watchRegion: 'TR',
        mediaType: 'movie',
        providers: [
          { providerId: 8, name: 'Netflix', logoPath: '/logo.png', displayPriority: 1 },
          { providerId: 337, name: 'Disney Plus', logoPath: '/logo2.png', displayPriority: 2 },
        ],
      },
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
    });
    (useStreamingDiscover as jest.Mock).mockReturnValue({
      data: {
        pages: [
          {
            items: [
              {
                id: 'movie-1',
                type: 'movie',
                title: 'Inception',
                posterUrl: null,
                releaseDate: '2010-07-16',
                voteAverage: 8.8,
                year: 2010,
              },
            ],
          },
        ],
      },
      isLoading: false,
      isError: false,
      isFetchingNextPage: false,
      isRefetching: false,
      hasNextPage: false,
      fetchNextPage: jest.fn(),
      refetch: jest.fn(),
    });
  });

  it('shows platform picker posters when no provider is selected', () => {
    render(<StreamingDiscoverScreen />);

    expect(screen.getByTestId('streaming-platform-picker')).toBeTruthy();
    expect(screen.getByTestId('streaming-hub-poster-8')).toBeTruthy();
    expect(screen.queryByTestId('streaming-discover-list')).toBeNull();
  });

  it('shows weekly catalog list when a provider is selected', () => {
    const { useLocalSearchParams } = jest.requireMock('expo-router');
    useLocalSearchParams.mockReturnValue({ watchProviderId: '8' });

    render(<StreamingDiscoverScreen />);

    expect(screen.getByTestId('streaming-discover-list')).toBeTruthy();
    expect(screen.getByTestId('streaming-platform-header')).toBeTruthy();
    expect(screen.getByText('Netflix')).toBeTruthy();
    expect(screen.getByText(t('discovery.streamingPlatform.catalogSubtitle'))).toBeTruthy();
    expect(screen.getByLabelText('Inception, Movie · 2010 · ★ 8.8')).toBeTruthy();
  });

  it('loads providers using the user region by default', () => {
    render(<StreamingDiscoverScreen />);

    expect(useDiscoveryWatchProviders).toHaveBeenCalledWith('movie', 'TR', true);
  });

  it('opens detail with contextual watchRegion while preserving return href', () => {
    const { useLocalSearchParams } = jest.requireMock('expo-router');
    useLocalSearchParams.mockReturnValue({ watchProviderId: '8', watchRegion: 'TR' });

    render(<StreamingDiscoverScreen />);

    fireEvent.press(screen.getByLabelText('Inception, Movie · 2010 · ★ 8.8'));

    expect(openCatalogDetailFromLibraryStack).toHaveBeenCalledWith(
      expect.anything(),
      'movie-1',
      'movie',
      'discover',
      expect.objectContaining({ watchRegion: 'TR' }),
    );
  });
});
