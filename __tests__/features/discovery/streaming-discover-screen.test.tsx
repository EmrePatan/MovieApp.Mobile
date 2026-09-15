import { fireEvent, render, screen } from '@testing-library/react-native';
import StreamingDiscoverScreen from '../../../app/streaming-discover';
import { useDiscoveryWatchProviders } from '@/features/discovery/hooks/useDiscoveryWatchProviders';
import { useStreamingDiscover } from '@/features/discovery/hooks/useStreamingDiscover';

const mockReplace = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: mockReplace, back: jest.fn() }),
  useLocalSearchParams: jest.fn(() => ({})),
}));

jest.mock('@/features/discovery/hooks/useDiscoveryWatchProviders', () => ({
  useDiscoveryWatchProviders: jest.fn(),
}));

jest.mock('@/features/discovery/hooks/useStreamingDiscover', () => ({
  useStreamingDiscover: jest.fn(),
}));

jest.mock('@/features/details/shared/components/DetailScreenScaffold', () => ({
  DetailBackButton: () => null,
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
      data: { pages: [{ items: [] }] },
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

  it('selects a provider via replace navigation', () => {
    render(<StreamingDiscoverScreen />);

    fireEvent.press(screen.getByLabelText('Netflix'));

    expect(mockReplace).toHaveBeenCalledWith(expect.stringContaining('watchProviderId=8'));
  });
});
