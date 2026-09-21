import { FlatList } from 'react-native';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { useAuth } from '@/auth/useAuth';
import { useFollowingCatalog } from '@/features/following/hooks/useFollowingCatalog';
import FollowingScreen from '../../../app/(tabs)/(app-shell)/following';

const mockPush = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush, navigate: jest.fn() }),
  useSegments: jest.fn(() => []),
}));

jest.mock('@/auth/useAuth', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@/features/following/hooks/useFollowingCatalog', () => ({
  useFollowingCatalog: jest.fn(),
}));

const movieItem = {
  id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  type: 'movie' as const,
  title: 'Dune: Part Three',
  posterUrl: 'https://example.com/dune.jpg',
  releaseDate: '2026-12-18',
  year: 2026,
};

const tvItem = {
  id: '7c9e6679-7425-40de-944b-e07fc1f90ae7',
  type: 'tv' as const,
  title: 'Severance',
  posterUrl: 'https://example.com/severance.jpg',
  releaseDate: null,
  year: 2022,
};

function createFollowingQueryMock(overrides: Record<string, unknown> = {}) {
  return {
    data: {
      pages: [
        {
          items: [movieItem, tvItem],
          page: 1,
          pageSize: 20,
          totalCount: 2,
          totalPages: 1,
        },
      ],
    },
    isLoading: false,
    isError: false,
    refetch: jest.fn(),
    isRefetching: false,
    isFetchingNextPage: false,
    isFetching: false,
    isFetchNextPageError: false,
    hasNextPage: false,
    fetchNextPage: jest.fn(),
    ...overrides,
  };
}

describe('FollowingScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({ isAuthenticated: true });
  });

  it('renders logged-out state', () => {
    (useAuth as jest.Mock).mockReturnValue({ isAuthenticated: false });
    (useFollowingCatalog as jest.Mock).mockReturnValue(createFollowingQueryMock());

    render(<FollowingScreen />);

    expect(screen.getByText('Sign in to view your following list')).toBeTruthy();
    fireEvent.press(screen.getByText('Sign In'));
    expect(mockPush).toHaveBeenCalledWith('/(auth)/login');
  });

  it('renders loading state', () => {
    (useFollowingCatalog as jest.Mock).mockReturnValue(
      createFollowingQueryMock({
        data: undefined,
        isLoading: true,
      }),
    );

    render(<FollowingScreen />);

    expect(screen.getByLabelText('Loading following')).toBeTruthy();
  });

  it('renders mixed movie and tv items and navigates to detail', () => {
    (useFollowingCatalog as jest.Mock).mockReturnValue(createFollowingQueryMock());

    render(<FollowingScreen />);

    expect(screen.getByText('Following')).toBeTruthy();
    expect(screen.getByText('Dune: Part Three')).toBeTruthy();
    expect(screen.getByText('Severance')).toBeTruthy();

    fireEvent.press(screen.getByRole('button', { name: /Dune: Part Three/ }));
    expect(mockPush).toHaveBeenCalledWith('/movie/3fa85f64-5717-4562-b3fc-2c963f66afa6');
  });

  it('renders empty state when there are no follows', () => {
    (useFollowingCatalog as jest.Mock).mockReturnValue(
      createFollowingQueryMock({
        data: {
          pages: [
            {
              items: [],
              page: 1,
              pageSize: 20,
              totalCount: 0,
              totalPages: 0,
            },
          ],
        },
      }),
    );

    render(<FollowingScreen />);

    expect(screen.getByText('Nothing followed yet')).toBeTruthy();
  });

  it('renders error state with retry', () => {
    const refetch = jest.fn();
    (useFollowingCatalog as jest.Mock).mockReturnValue(
      createFollowingQueryMock({
        data: undefined,
        isError: true,
        refetch,
      }),
    );

    render(<FollowingScreen />);

    expect(screen.getByText('Unable to load following. Please try again.')).toBeTruthy();
    fireEvent.press(screen.getByText('Retry'));
    expect(refetch).toHaveBeenCalled();
  });

  it('filters loaded pages by content type', () => {
    (useFollowingCatalog as jest.Mock).mockReturnValue(createFollowingQueryMock());

    render(<FollowingScreen />);

    fireEvent.press(screen.getByText('Movies'));
    expect(screen.getByText('Dune: Part Three')).toBeTruthy();
    expect(screen.queryByText('Severance')).toBeNull();
  });

  it('loads the next page when more pages are available', () => {
    const fetchNextPage = jest.fn();
    (useFollowingCatalog as jest.Mock).mockReturnValue(
      createFollowingQueryMock({
        hasNextPage: true,
        fetchNextPage,
      }),
    );

    const { UNSAFE_getByType } = render(<FollowingScreen />);

    UNSAFE_getByType(FlatList).props.onEndReached?.();
    expect(fetchNextPage).toHaveBeenCalled();
  });
});
