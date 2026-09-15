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

  it('renders streaming discover controls and attribution', () => {
    render(<StreamingDiscoverScreen />);

    expect(screen.getByText('Streaming Services')).toBeTruthy();
    expect(screen.getByText('Where do you watch?')).toBeTruthy();
    expect(screen.getByText('Availability')).toBeTruthy();
    expect(screen.getByTestId('justwatch-attribution')).toBeTruthy();
    expect(screen.getByLabelText('Netflix')).toBeTruthy();
  });

  it('prompts users to choose a provider before showing results', () => {
    render(<StreamingDiscoverScreen />);

    expect(screen.getByText('Choose a streaming service')).toBeTruthy();
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

  it('updates watchRegion and mediaType via setParams', () => {
    render(<StreamingDiscoverScreen />);

    fireEvent.press(screen.getByLabelText('Watch region Turkey'));
    fireEvent.press(screen.getByLabelText('United States'));
    fireEvent.press(screen.getByLabelText('TV Shows'));

    expect(mockSetParams).toHaveBeenCalled();
    expect(mockSetParams.mock.calls.some(([params]) => params.watchRegion === 'US')).toBe(true);
    expect(mockSetParams.mock.calls.some(([params]) => params.mediaType === 'tv')).toBe(true);
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('opens detail with contextual watchRegion while preserving return href', () => {
    const { useLocalSearchParams } = jest.requireMock('expo-router');
    useLocalSearchParams.mockReturnValue({
      watchRegion: 'US',
      watchProviderId: '8',
      watchMonetizationType: 'stream',
    });

    render(<StreamingDiscoverScreen />);
    fireEvent.press(screen.getByText('Inception'));

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
