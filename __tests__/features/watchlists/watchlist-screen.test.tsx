import { fireEvent, render, screen } from '@testing-library/react-native';
import { FlatList } from 'react-native';
import { ApiError } from '@/api/errors';
import { useAuth } from '@/auth/useAuth';
import { useWatchlistItems } from '@/features/watchlists/hooks/useWatchlistItems';
import {
  useDeleteWatchlistMutation,
  useRemoveWatchlistItemMutation,
} from '@/features/watchlists/hooks/useWatchlistMutations';
import { useWatchlists } from '@/features/watchlists/hooks/useWatchlists';
import WatchlistScreen from '../../../app/(tabs)/watchlist';

const mockPush = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush }),
}));

jest.mock('@/auth/useAuth', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@/features/watchlists/hooks/useWatchlists', () => ({
  useWatchlists: jest.fn(),
}));

jest.mock('@/features/watchlists/hooks/useWatchlistItems', () => ({
  useWatchlistItems: jest.fn(),
}));

jest.mock('@/features/watchlists/hooks/useWatchlistMutations', () => ({
  useDeleteWatchlistMutation: jest.fn(),
  useRemoveWatchlistItemMutation: jest.fn(),
  useCreateWatchlistForLibrary: jest.fn(() => ({
    mutate: jest.fn(),
    isPending: false,
  })),
}));

function mockWatchlists(overrides: Record<string, unknown> = {}) {
  (useWatchlists as jest.Mock).mockReturnValue({
    data: [],
    isLoading: false,
    isError: false,
    refetch: jest.fn(),
    isRefetching: false,
    ...overrides,
  });
}

function mockItems(overrides: Record<string, unknown> = {}) {
  (useWatchlistItems as jest.Mock).mockReturnValue({
    data: undefined,
    isLoading: false,
    isError: false,
    refetch: jest.fn(),
    isRefetching: false,
    isFetchingNextPage: false,
    hasNextPage: false,
    fetchNextPage: jest.fn(),
    ...overrides,
  });
}

describe('WatchlistScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    (useDeleteWatchlistMutation as jest.Mock).mockReturnValue({
      mutate: jest.fn(),
      isPending: false,
    });

    (useRemoveWatchlistItemMutation as jest.Mock).mockReturnValue({
      mutate: jest.fn(),
      isPending: false,
    });
  });

  it('renders logged-out state', () => {
    (useAuth as jest.Mock).mockReturnValue({ isAuthenticated: false });
    mockWatchlists();
    mockItems();

    render(<WatchlistScreen />);
    expect(screen.getByText('Sign in to manage your watchlists')).toBeTruthy();
    fireEvent.press(screen.getByText('Sign In'));
    expect(mockPush).toHaveBeenCalledWith('/(auth)/login');
  });

  it('renders empty watchlists state', () => {
    (useAuth as jest.Mock).mockReturnValue({ isAuthenticated: true });
    mockWatchlists();
    mockItems();

    render(<WatchlistScreen />);
    expect(screen.getByText("You don't have any watchlists yet")).toBeTruthy();
  });

  it('renders loading skeleton for items', () => {
    (useAuth as jest.Mock).mockReturnValue({ isAuthenticated: true });
    mockWatchlists({
      data: [
        {
          id: 'wl-1',
          name: 'Favorites',
          itemCount: 1,
          createdAt: '',
          updatedAt: '',
        },
      ],
    });
    mockItems({ isLoading: true });

    render(<WatchlistScreen />);
    expect(screen.getByLabelText('Loading watchlist items')).toBeTruthy();
  });

  it('renders selected watchlist items and navigates to movie detail', () => {
    (useAuth as jest.Mock).mockReturnValue({ isAuthenticated: true });
    mockWatchlists({
      data: [
        {
          id: 'wl-1',
          name: 'Favorites',
          itemCount: 1,
          createdAt: '',
          updatedAt: '',
        },
      ],
    });
    mockItems({
      data: {
        pages: [
          {
            movies: [
              {
                id: 'movie-id',
                title: 'Interstellar',
                posterPath: null,
                releaseDate: '2014-11-07',
                voteAverage: 8.4,
                createdAt: '2026-09-11T14:30:00Z',
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
    });

    render(<WatchlistScreen />);
    expect(screen.getAllByText('Favorites').length).toBeGreaterThan(0);
    fireEvent.press(screen.getByLabelText('Interstellar, Movie, 2014, rating 8.4'));
    expect(mockPush).toHaveBeenCalledWith('/movie/movie-id');
  });

  it('filters to tv only', () => {
    (useAuth as jest.Mock).mockReturnValue({ isAuthenticated: true });
    mockWatchlists({
      data: [
        {
          id: 'wl-1',
          name: 'Mixed',
          itemCount: 2,
          createdAt: '',
          updatedAt: '',
        },
      ],
    });
    mockItems({
      data: {
        pages: [
          {
            movies: [
              {
                id: 'movie-id',
                title: 'Interstellar',
                posterPath: null,
                releaseDate: '2014-11-07',
                voteAverage: 8.4,
                createdAt: '2026-09-11T14:30:00Z',
              },
            ],
            tvShows: [
              {
                id: 'tv-id',
                title: 'Breaking Bad',
                posterPath: null,
                firstAirDate: '2008-01-20',
                voteAverage: 8.9,
                createdAt: '2026-09-12T14:30:00Z',
              },
            ],
            page: 1,
            pageSize: 20,
            totalCount: 2,
            totalPages: 1,
            hasNextPage: false,
            hasPreviousPage: false,
          },
        ],
      },
    });

    render(<WatchlistScreen />);
    fireEvent.press(screen.getByLabelText('Filter TV Shows'));
    expect(screen.getByLabelText('Breaking Bad, TV, 2008, rating 8.9')).toBeTruthy();
    expect(screen.queryByLabelText('Interstellar, Movie, 2014, rating 8.4')).toBeNull();
  });

  it('renders empty selected watchlist state', () => {
    (useAuth as jest.Mock).mockReturnValue({ isAuthenticated: true });
    mockWatchlists({
      data: [
        {
          id: 'wl-1',
          name: 'Favorites',
          itemCount: 0,
          createdAt: '',
          updatedAt: '',
        },
      ],
    });
    mockItems({
      data: {
        pages: [
          {
            movies: [],
            tvShows: [],
            page: 1,
            pageSize: 20,
            totalCount: 0,
            totalPages: 0,
            hasNextPage: false,
            hasPreviousPage: false,
          },
        ],
      },
    });

    render(<WatchlistScreen />);
    expect(screen.getByText('Your watchlist is empty')).toBeTruthy();
    fireEvent.press(screen.getByText('Browse'));
    expect(mockPush).toHaveBeenCalledWith('/search');
  });

  it('navigates to tv detail and removes tv item', () => {
    const removeMutate = jest.fn();
    (useRemoveWatchlistItemMutation as jest.Mock).mockReturnValue({
      mutate: removeMutate,
      isPending: false,
    });

    (useAuth as jest.Mock).mockReturnValue({ isAuthenticated: true });
    mockWatchlists({
      data: [
        {
          id: 'wl-1',
          name: 'Series',
          itemCount: 1,
          createdAt: '',
          updatedAt: '',
        },
      ],
    });
    mockItems({
      data: {
        pages: [
          {
            movies: [],
            tvShows: [
              {
                id: 'tv-id',
                title: 'Breaking Bad',
                posterPath: null,
                firstAirDate: '2008-01-20',
                voteAverage: 8.9,
                createdAt: '2026-09-12T14:30:00Z',
              },
            ],
            page: 1,
            pageSize: 20,
            totalCount: 1,
            totalPages: 1,
            hasNextPage: false,
            hasPreviousPage: false,
          },
        ],
      },
    });

    render(<WatchlistScreen />);
    fireEvent.press(screen.getByLabelText('Breaking Bad, TV, 2008, rating 8.9'));
    expect(mockPush).toHaveBeenCalledWith('/tv/tv-id');

    fireEvent.press(screen.getByLabelText('Remove Breaking Bad from watchlist'));
    expect(removeMutate).toHaveBeenCalledWith(
      { contentType: 'tv', contentId: 'tv-id' },
      expect.any(Object),
    );
  });

  it('loads next page when more items are available', () => {
    const fetchNextPage = jest.fn();
    (useAuth as jest.Mock).mockReturnValue({ isAuthenticated: true });
    mockWatchlists({
      data: [
        {
          id: 'wl-1',
          name: 'Long List',
          itemCount: 40,
          createdAt: '',
          updatedAt: '',
        },
      ],
    });
    mockItems({
      data: {
        pages: [
          {
            movies: [
              {
                id: 'movie-id',
                title: 'Interstellar',
                posterPath: null,
                releaseDate: '2014-11-07',
                voteAverage: 8.4,
                createdAt: '2026-09-11T14:30:00Z',
              },
            ],
            tvShows: [],
            page: 1,
            pageSize: 20,
            totalCount: 40,
            totalPages: 2,
            hasNextPage: true,
            hasPreviousPage: false,
          },
        ],
      },
      hasNextPage: true,
      fetchNextPage,
    });

    const { UNSAFE_getByType } = render(<WatchlistScreen />);
    UNSAFE_getByType(FlatList).props.onEndReached?.();
    expect(fetchNextPage).toHaveBeenCalled();
  });

  it('renders items error with retry', () => {
    const refetch = jest.fn();
    (useAuth as jest.Mock).mockReturnValue({ isAuthenticated: true });
    mockWatchlists({
      data: [
        {
          id: 'wl-1',
          name: 'Favorites',
          itemCount: 0,
          createdAt: '',
          updatedAt: '',
        },
      ],
    });
    mockItems({
      isError: true,
      error: new ApiError({ kind: 'server', status: 500, userMessage: 'Server error.' }),
      refetch,
    });

    render(<WatchlistScreen />);
    expect(screen.getByText('Unable to load watchlist items. Please try again.')).toBeTruthy();
    expect(screen.queryByText('Server error.')).toBeNull();
    fireEvent.press(screen.getByText('Try Again'));
    expect(refetch).toHaveBeenCalled();
  });
});
