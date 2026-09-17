import { fireEvent, render, screen } from '@testing-library/react-native';
import { LibraryWatchlistDetailContent } from '@/features/library/components/LibraryWatchlistDetailContent';

const mockPush = jest.fn();
const mockBack = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush, back: mockBack }),
  useSegments: () => ['watchlist', 'wl-1'],
}));

jest.mock('@/auth/useAuth', () => ({
  useAuth: jest.fn(() => ({ isAuthenticated: true })),
}));

const mockRefetchItems = jest.fn();
const mockFetchNextPage = jest.fn();
const mockRefetchWatchlists = jest.fn();

jest.mock('@/features/watchlists/hooks/useWatchlists', () => ({
  useWatchlists: jest.fn(() => ({
    data: [
      {
        id: 'wl-1',
        name: 'Weekend Movies',
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-02T00:00:00Z',
        itemCount: 1,
      },
    ],
    isRefetching: false,
    refetch: mockRefetchWatchlists,
  })),
}));

jest.mock('@/features/watchlists/hooks/useWatchlistItems', () => ({
  useWatchlistItems: jest.fn(() => ({
    data: {
      pages: [
        {
          movies: [
            {
              id: 'movie-1',
              title: 'Interstellar',
              posterPath: '/poster.jpg',
              releaseDate: '2014-11-05',
              voteAverage: 8.5,
              createdAt: '2026-01-01T00:00:00Z',
            },
          ],
          tvShows: [],
          page: 1,
          pageSize: 20,
          totalCount: 1,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      ],
    },
    isLoading: false,
    isError: false,
    isRefetching: false,
    isFetching: false,
    isFetchingNextPage: false,
    hasNextPage: false,
    refetch: mockRefetchItems,
    fetchNextPage: mockFetchNextPage,
  })),
}));

jest.mock('@/features/watchlists/hooks/useWatchlistMutations', () => ({
  useDeleteWatchlistMutation: jest.fn(() => ({
    mutate: jest.fn(),
    isPending: false,
  })),
  useRemoveWatchlistItemMutation: jest.fn(() => ({
    mutate: jest.fn(),
    isPending: false,
  })),
}));

describe('LibraryWatchlistDetailContent', () => {
  it('renders the selected watchlist contents', () => {
    render(<LibraryWatchlistDetailContent watchlistId="wl-1" />);

    expect(screen.getByTestId('library-watchlist-detail')).toBeTruthy();
    expect(screen.getByText('Weekend Movies')).toBeTruthy();
    expect(screen.getByText('Interstellar')).toBeTruthy();
  });

  it('exposes list management actions', () => {
    render(<LibraryWatchlistDetailContent watchlistId="wl-1" />);

    expect(screen.getByText('Delete List')).toBeTruthy();
    expect(screen.getByLabelText('Remove Interstellar from watchlist')).toBeTruthy();
  });
});
