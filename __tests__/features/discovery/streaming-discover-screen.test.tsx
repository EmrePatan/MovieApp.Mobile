import { fireEvent, render, screen } from '@testing-library/react-native';
import StreamingDiscoverScreen from '../../../app/streaming-discover';
import { useDiscoveryWatchProviders } from '@/features/discovery/hooks/useDiscoveryWatchProviders';
import { useStreamingDiscover } from '@/features/discovery/hooks/useStreamingDiscover';
import { openCatalogDetailFromLibraryStack } from '@/features/details/shared/navigation/catalog-detail-navigation';

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

  it('mounts the streaming discover FlatList with result rows when a provider is selected', () => {
    const { useLocalSearchParams } = jest.requireMock('expo-router');
    useLocalSearchParams.mockReturnValue({ watchProviderId: '8' });

    render(<StreamingDiscoverScreen />);

    expect(screen.getByTestId('streaming-discover-scroll')).toBeTruthy();
    expect(screen.getByLabelText('Netflix')).toBeTruthy();
    expect(screen.getByLabelText('Inception, Movie · 2010 · ★ 8.8')).toBeTruthy();
  });

  it('renders provider selector outside FlatList when results data is empty and no provider is selected', () => {
    (useStreamingDiscover as jest.Mock).mockReturnValue({
      data: {
        pages: [
          {
            items: [],
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

    render(<StreamingDiscoverScreen />);

    expect(screen.getByTestId('streaming-discover-provider-header')).toBeTruthy();
    expect(screen.getByLabelText('Netflix')).toBeTruthy();
    expect(screen.getByLabelText('Disney Plus')).toBeTruthy();
    expect(screen.queryByTestId('streaming-discover-scroll')).toBeNull();
  });

  it('renders streaming discover controls without a region selector', () => {
    render(<StreamingDiscoverScreen />);

    expect(screen.getByText('Streaming Services')).toBeTruthy();
    expect(screen.getByText('Where do you watch?')).toBeTruthy();
    expect(screen.queryByTestId('watch-region-selector')).toBeNull();
    expect(screen.queryByText('Watch region')).toBeNull();
  });

  it('loads providers using the user region by default', () => {
    render(<StreamingDiscoverScreen />);

    expect(useDiscoveryWatchProviders).toHaveBeenCalledWith('movie', 'TR', true);
  });

  it('honors explicit watchRegion deep links', () => {
    const { useLocalSearchParams } = jest.requireMock('expo-router');
    useLocalSearchParams.mockReturnValue({ watchRegion: 'US' });

    render(<StreamingDiscoverScreen />);

    expect(useDiscoveryWatchProviders).toHaveBeenCalledWith('movie', 'US', true);
  });

  it('selects providers via setParams without pushing navigation history', () => {
    render(<StreamingDiscoverScreen />);

    fireEvent.press(screen.getByLabelText('Netflix'));
    fireEvent.press(screen.getByLabelText('Disney Plus'));

    expect(mockSetParams).toHaveBeenCalled();
    expect(mockSetParams.mock.calls.some(([params]) => params.watchProviderId === '8')).toBe(true);
    expect(mockReplace).not.toHaveBeenCalled();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('opens detail with contextual watchRegion while preserving return href', () => {
    const { useLocalSearchParams } = jest.requireMock('expo-router');
    useLocalSearchParams.mockReturnValue({
      watchRegion: 'US',
      watchProviderId: '8',
      watchMonetizationType: 'stream',
    });

    render(<StreamingDiscoverScreen />);
    fireEvent.press(screen.getByLabelText('Inception, Movie · 2010 · ★ 8.8'));

    expect(openCatalogDetailFromLibraryStack).toHaveBeenCalledWith(
      expect.anything(),
      'movie-1',
      'movie',
      'discover',
      expect.objectContaining({
        watchRegion: 'US',
        libraryReturnHref: expect.stringContaining('watchRegion=US'),
      }),
    );
  });
});
