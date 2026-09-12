import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { FlatList, RefreshControl } from 'react-native';
import { ApiError } from '@/api/errors';
import { useAuth } from '@/auth/useAuth';
import { useFavoritesItems } from '@/features/favorites/hooks/useFavoritesItems';
import { useRemoveFavoriteMutation } from '@/features/favorites/hooks/useFavoriteMutations';
import FavoritesScreen from '../../../app/favorites';

const mockPush = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush }),
}));

jest.mock('@/auth/useAuth', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@/features/favorites/hooks/useFavoritesItems', () => ({
  useFavoritesItems: jest.fn(),
}));

jest.mock('@/features/favorites/hooks/useFavoriteMutations', () => ({
  useRemoveFavoriteMutation: jest.fn(),
}));

function createPage(overrides: Record<string, unknown> = {}) {
  return {
    movies: [],
    tvShows: [],
    page: 1,
    pageSize: 20,
    totalCount: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
    ...overrides,
  };
}

describe('FavoritesScreen', () => {
  const removeMutate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRemoveFavoriteMutation as jest.Mock).mockReturnValue({
      mutate: removeMutate,
      isPending: false,
    });
  });

  it('renders logged-out state', () => {
    (useAuth as jest.Mock).mockReturnValue({ isAuthenticated: false });
    (useFavoritesItems as jest.Mock).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
      isRefetching: false,
      isFetchingNextPage: false,
      isFetchNextPageError: false,
      hasNextPage: false,
      fetchNextPage: jest.fn(),
    });

    render(<FavoritesScreen />);
    expect(screen.getByText('Sign in to view your favorites')).toBeTruthy();
    fireEvent.press(screen.getByText('Sign In'));
    expect(mockPush).toHaveBeenCalledWith('/(auth)/login');
  });

  it('renders movie favorite and navigates to movie detail', () => {
    (useAuth as jest.Mock).mockReturnValue({ isAuthenticated: true });
    (useFavoritesItems as jest.Mock).mockReturnValue({
      data: {
        pages: [
          createPage({
            movies: [
              {
                id: 'movie-id',
                title: 'Inception',
                posterPath: null,
                releaseDate: '2010-07-16',
                voteAverage: 8.8,
              },
            ],
            totalCount: 1,
            totalPages: 1,
          }),
        ],
      },
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
      isRefetching: false,
      isFetchingNextPage: false,
      isFetchNextPageError: false,
      hasNextPage: false,
      fetchNextPage: jest.fn(),
    });

    render(<FavoritesScreen />);
    fireEvent.press(screen.getByLabelText('Inception, Movie, 2010, rating 8.8'));
    expect(mockPush).toHaveBeenCalledWith('/movie/movie-id');
  });

  it('renders tv favorite and navigates to tv detail', () => {
    (useAuth as jest.Mock).mockReturnValue({ isAuthenticated: true });
    (useFavoritesItems as jest.Mock).mockReturnValue({
      data: {
        pages: [
          createPage({
            tvShows: [
              {
                id: 'tv-id',
                title: 'Breaking Bad',
                posterPath: null,
                firstAirDate: '2008-01-20',
                voteAverage: 8.9,
              },
            ],
            totalCount: 1,
            totalPages: 1,
          }),
        ],
      },
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
      isRefetching: false,
      isFetchingNextPage: false,
      isFetchNextPageError: false,
      hasNextPage: false,
      fetchNextPage: jest.fn(),
    });

    render(<FavoritesScreen />);
    fireEvent.press(screen.getByLabelText('Breaking Bad, TV, 2008, rating 8.9'));
    expect(mockPush).toHaveBeenCalledWith('/tv/tv-id');
  });

  it('renders mixed movie and tv favorites', () => {
    (useAuth as jest.Mock).mockReturnValue({ isAuthenticated: true });
    (useFavoritesItems as jest.Mock).mockReturnValue({
      data: {
        pages: [
          createPage({
            movies: [
              {
                id: 'movie-id',
                title: 'Inception',
                posterPath: null,
                releaseDate: '2010-07-16',
                voteAverage: 8.8,
              },
            ],
            tvShows: [
              {
                id: 'tv-id',
                title: 'Breaking Bad',
                posterPath: null,
                firstAirDate: '2008-01-20',
                voteAverage: 8.9,
              },
            ],
            totalCount: 2,
            totalPages: 1,
          }),
        ],
      },
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
      isRefetching: false,
      isFetchingNextPage: false,
      isFetchNextPageError: false,
      hasNextPage: false,
      fetchNextPage: jest.fn(),
    });

    render(<FavoritesScreen />);
    expect(screen.getByLabelText('Inception, Movie, 2010, rating 8.8')).toBeTruthy();
    expect(screen.getByLabelText('Breaking Bad, TV, 2008, rating 8.9')).toBeTruthy();
  });

  it('loads next page when more items are available', () => {
    const fetchNextPage = jest.fn();
    (useAuth as jest.Mock).mockReturnValue({ isAuthenticated: true });
    (useFavoritesItems as jest.Mock).mockReturnValue({
      data: {
        pages: [
          createPage({
            movies: [
              {
                id: 'movie-id',
                title: 'Inception',
                posterPath: null,
                releaseDate: '2010-07-16',
                voteAverage: 8.8,
              },
            ],
            totalCount: 40,
            totalPages: 2,
            hasNextPage: true,
          }),
        ],
      },
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
      isRefetching: false,
      isFetchingNextPage: false,
      isFetchNextPageError: false,
      hasNextPage: true,
      fetchNextPage,
    });

    const { UNSAFE_getByType } = render(<FavoritesScreen />);
    UNSAFE_getByType(FlatList).props.onEndReached?.();
    expect(fetchNextPage).toHaveBeenCalled();
  });

  it('does not load next page when hasNextPage is false', () => {
    const fetchNextPage = jest.fn();
    (useAuth as jest.Mock).mockReturnValue({ isAuthenticated: true });
    (useFavoritesItems as jest.Mock).mockReturnValue({
      data: {
        pages: [
          createPage({
            movies: [
              {
                id: 'movie-id',
                title: 'Inception',
                posterPath: null,
                releaseDate: '2010-07-16',
                voteAverage: 8.8,
              },
            ],
            totalCount: 1,
            totalPages: 1,
            hasNextPage: false,
          }),
        ],
      },
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
      isRefetching: false,
      isFetchingNextPage: false,
      isFetchNextPageError: false,
      hasNextPage: false,
      fetchNextPage,
    });

    const { UNSAFE_getByType } = render(<FavoritesScreen />);
    UNSAFE_getByType(FlatList).props.onEndReached?.();
    expect(fetchNextPage).not.toHaveBeenCalled();
  });

  it('shows pagination loading footer', () => {
    (useAuth as jest.Mock).mockReturnValue({ isAuthenticated: true });
    (useFavoritesItems as jest.Mock).mockReturnValue({
      data: {
        pages: [
          createPage({
            movies: [
              {
                id: 'movie-id',
                title: 'Inception',
                posterPath: null,
                releaseDate: '2010-07-16',
                voteAverage: 8.8,
              },
            ],
            totalCount: 40,
            totalPages: 2,
            hasNextPage: true,
          }),
        ],
      },
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
      isRefetching: false,
      isFetchingNextPage: true,
      isFetchNextPageError: false,
      hasNextPage: true,
      fetchNextPage: jest.fn(),
    });

    const { UNSAFE_getByType } = render(<FavoritesScreen />);
    expect(UNSAFE_getByType(FlatList).props.ListFooterComponent).toBeTruthy();
  });

  it('keeps loaded items and allows retry when pagination fails', () => {
    const fetchNextPage = jest.fn();
    (useAuth as jest.Mock).mockReturnValue({ isAuthenticated: true });
    (useFavoritesItems as jest.Mock).mockReturnValue({
      data: {
        pages: [
          createPage({
            movies: [
              {
                id: 'movie-id',
                title: 'Inception',
                posterPath: null,
                releaseDate: '2010-07-16',
                voteAverage: 8.8,
              },
            ],
            totalCount: 40,
            totalPages: 2,
            hasNextPage: true,
          }),
        ],
      },
      isLoading: false,
      isError: false,
      error: new ApiError({ kind: 'server', status: 500, userMessage: 'Server error.' }),
      refetch: jest.fn(),
      isRefetching: false,
      isFetchingNextPage: false,
      isFetchNextPageError: true,
      hasNextPage: true,
      fetchNextPage,
    });

    render(<FavoritesScreen />);
    expect(screen.getByLabelText('Inception, Movie, 2010, rating 8.8')).toBeTruthy();
    fireEvent.press(screen.getByText('Retry'));
    expect(fetchNextPage).toHaveBeenCalled();
  });

  it('removes movie and tv favorites', () => {
    (useAuth as jest.Mock).mockReturnValue({ isAuthenticated: true });
    (useFavoritesItems as jest.Mock).mockReturnValue({
      data: {
        pages: [
          createPage({
            movies: [
              {
                id: 'movie-id',
                title: 'Inception',
                posterPath: null,
                releaseDate: '2010-07-16',
                voteAverage: 8.8,
              },
            ],
            tvShows: [
              {
                id: 'tv-id',
                title: 'Breaking Bad',
                posterPath: null,
                firstAirDate: '2008-01-20',
                voteAverage: 8.9,
              },
            ],
            totalCount: 2,
            totalPages: 1,
          }),
        ],
      },
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
      isRefetching: false,
      isFetchingNextPage: false,
      isFetchNextPageError: false,
      hasNextPage: false,
      fetchNextPage: jest.fn(),
    });

    render(<FavoritesScreen />);

    fireEvent.press(screen.getByLabelText('Remove Inception from favorites'));
    expect(removeMutate).toHaveBeenCalledWith(
      { contentType: 'movie', contentId: 'movie-id' },
      expect.any(Object),
    );

    fireEvent.press(screen.getByLabelText('Remove Breaking Bad from favorites'));
    expect(removeMutate).toHaveBeenCalledWith(
      { contentType: 'tv', contentId: 'tv-id' },
      expect.any(Object),
    );
  });

  it('shows remove error feedback on mutation failure', () => {
    removeMutate.mockImplementation((_variables, options) => {
      options?.onError?.(new ApiError({ kind: 'server', status: 500, userMessage: 'Server error.' }));
      options?.onSettled?.();
    });

    (useAuth as jest.Mock).mockReturnValue({ isAuthenticated: true });
    (useFavoritesItems as jest.Mock).mockReturnValue({
      data: {
        pages: [
          createPage({
            movies: [
              {
                id: 'movie-id',
                title: 'Inception',
                posterPath: null,
                releaseDate: '2010-07-16',
                voteAverage: 8.8,
              },
            ],
            totalCount: 1,
            totalPages: 1,
          }),
        ],
      },
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
      isRefetching: false,
      isFetchingNextPage: false,
      isFetchNextPageError: false,
      hasNextPage: false,
      fetchNextPage: jest.fn(),
    });

    render(<FavoritesScreen />);
    fireEvent.press(screen.getByLabelText('Remove Inception from favorites'));
    expect(screen.getByText('Server error.')).toBeTruthy();
  });

  it('renders empty state with explore action', () => {
    (useAuth as jest.Mock).mockReturnValue({ isAuthenticated: true });
    (useFavoritesItems as jest.Mock).mockReturnValue({
      data: { pages: [createPage()] },
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
      isRefetching: false,
      isFetchingNextPage: false,
      isFetchNextPageError: false,
      hasNextPage: false,
      fetchNextPage: jest.fn(),
    });

    render(<FavoritesScreen />);
    expect(screen.getByText('No favorites yet')).toBeTruthy();
    fireEvent.press(screen.getByText('Explore'));
    expect(mockPush).toHaveBeenCalledWith('/discover');
  });

  it('renders initial error with retry', () => {
    const refetch = jest.fn();
    (useAuth as jest.Mock).mockReturnValue({ isAuthenticated: true });
    (useFavoritesItems as jest.Mock).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new ApiError({ kind: 'server', status: 500, userMessage: 'Server error.' }),
      refetch,
      isRefetching: false,
      isFetchingNextPage: false,
      isFetchNextPageError: false,
      hasNextPage: false,
      fetchNextPage: jest.fn(),
    });

    render(<FavoritesScreen />);
    expect(screen.getByText('Server error.')).toBeTruthy();
    fireEvent.press(screen.getByText('Retry'));
    expect(refetch).toHaveBeenCalled();
  });

  it('refreshes favorites on pull-to-refresh', () => {
    const refetch = jest.fn();
    (useAuth as jest.Mock).mockReturnValue({ isAuthenticated: true });
    (useFavoritesItems as jest.Mock).mockReturnValue({
      data: {
        pages: [
          createPage({
            movies: [
              {
                id: 'movie-id',
                title: 'Inception',
                posterPath: null,
                releaseDate: '2010-07-16',
                voteAverage: 8.8,
              },
            ],
            totalCount: 1,
            totalPages: 1,
          }),
        ],
      },
      isLoading: false,
      isError: false,
      refetch,
      isRefetching: true,
      isFetchingNextPage: false,
      isFetchNextPageError: false,
      hasNextPage: false,
      fetchNextPage: jest.fn(),
    });

    const { UNSAFE_getByType } = render(<FavoritesScreen />);
    const refreshControl = UNSAFE_getByType(FlatList).props.refreshControl as React.ReactElement<
      React.ComponentProps<typeof RefreshControl>
    >;
    refreshControl.props.onRefresh?.();
    expect(refetch).toHaveBeenCalled();
  });

  it('exposes accessible remove labels with content title and type', () => {
    (useAuth as jest.Mock).mockReturnValue({ isAuthenticated: true });
    (useFavoritesItems as jest.Mock).mockReturnValue({
      data: {
        pages: [
          createPage({
            tvShows: [
              {
                id: 'tv-id',
                title: 'Breaking Bad',
                posterPath: null,
                firstAirDate: '2008-01-20',
                voteAverage: 8.9,
              },
            ],
            totalCount: 1,
            totalPages: 1,
          }),
        ],
      },
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
      isRefetching: false,
      isFetchingNextPage: false,
      isFetchNextPageError: false,
      hasNextPage: false,
      fetchNextPage: jest.fn(),
    });

    render(<FavoritesScreen />);
    expect(screen.getByLabelText('Remove Breaking Bad from favorites')).toBeTruthy();
    expect(screen.getByLabelText('Breaking Bad, TV, 2008, rating 8.9')).toBeTruthy();
  });
});
