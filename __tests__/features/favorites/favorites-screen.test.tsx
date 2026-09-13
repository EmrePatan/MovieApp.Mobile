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

function mockAuthenticatedQuery(overrides: Record<string, unknown> = {}) {
  (useAuth as jest.Mock).mockReturnValue({ isAuthenticated: true });
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
    ...overrides,
  });
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

  it('renders loading skeleton', () => {
    mockAuthenticatedQuery({ isLoading: true });

    render(<FavoritesScreen />);
    expect(screen.getByLabelText('Loading favorites')).toBeTruthy();
  });

  it('renders movie favorite and navigates to movie detail', () => {
    mockAuthenticatedQuery({
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
    });

    render(<FavoritesScreen />);
    fireEvent.press(screen.getByLabelText('Inception, Movie, 2010, rating 8.8'));
    expect(mockPush).toHaveBeenCalledWith('/movie/movie-id');
  });

  it('renders tv favorite and navigates to tv detail', () => {
    mockAuthenticatedQuery({
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
    });

    render(<FavoritesScreen />);
    fireEvent.press(screen.getByLabelText('Breaking Bad, TV, 2008, rating 8.9'));
    expect(mockPush).toHaveBeenCalledWith('/tv/tv-id');
  });

  it('filters to movies only', () => {
    mockAuthenticatedQuery({
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
    });

    render(<FavoritesScreen />);
    fireEvent.press(screen.getByLabelText('Filter Movies'));
    expect(screen.getByLabelText('Inception, Movie, 2010, rating 8.8')).toBeTruthy();
    expect(screen.queryByLabelText('Breaking Bad, TV, 2008, rating 8.9')).toBeNull();
  });

  it('filters to tv only', () => {
    mockAuthenticatedQuery({
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
    });

    render(<FavoritesScreen />);
    fireEvent.press(screen.getByLabelText('Filter TV Shows'));
    expect(screen.getByLabelText('Breaking Bad, TV, 2008, rating 8.9')).toBeTruthy();
    expect(screen.queryByLabelText('Inception, Movie, 2010, rating 8.8')).toBeNull();
  });

  it('loads next page when more items are available', () => {
    const fetchNextPage = jest.fn();
    mockAuthenticatedQuery({
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
      hasNextPage: true,
      fetchNextPage,
    });

    const { UNSAFE_getByType } = render(<FavoritesScreen />);
    UNSAFE_getByType(FlatList).props.onEndReached?.();
    expect(fetchNextPage).toHaveBeenCalled();
  });

  it('keeps loaded items and allows retry when pagination fails', () => {
    const fetchNextPage = jest.fn();
    mockAuthenticatedQuery({
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
      error: new ApiError({ kind: 'server', status: 500, userMessage: 'Server error.' }),
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
    mockAuthenticatedQuery({
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

    mockAuthenticatedQuery({
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
    });

    render(<FavoritesScreen />);
    fireEvent.press(screen.getByLabelText('Remove Inception from favorites'));
    expect(screen.getByText('Could not remove this favorite. Please try again.')).toBeTruthy();
  });

  it('renders empty state with browse action', () => {
    mockAuthenticatedQuery({
      data: { pages: [createPage()] },
    });

    render(<FavoritesScreen />);
    expect(screen.getByText("You haven't added any favorites yet")).toBeTruthy();
    fireEvent.press(screen.getByText('Browse'));
    expect(mockPush).toHaveBeenCalledWith('/(tabs)/search');
  });

  it('renders initial error with retry', () => {
    const refetch = jest.fn();
    mockAuthenticatedQuery({
      isError: true,
      error: new ApiError({ kind: 'server', status: 500, userMessage: 'Server error.' }),
      refetch,
    });

    render(<FavoritesScreen />);
    expect(screen.getByText('Unable to load favorites. Please try again.')).toBeTruthy();
    expect(screen.queryByText('Server error.')).toBeNull();
    fireEvent.press(screen.getByText('Retry'));
    expect(refetch).toHaveBeenCalled();
  });

  it('refreshes favorites on pull-to-refresh', () => {
    const refetch = jest.fn();
    mockAuthenticatedQuery({
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
      refetch,
      isRefetching: true,
    });

    const { UNSAFE_getByType } = render(<FavoritesScreen />);
    const refreshControl = UNSAFE_getByType(FlatList).props.refreshControl as React.ReactElement<
      React.ComponentProps<typeof RefreshControl>
    >;
    refreshControl.props.onRefresh?.();
    expect(refetch).toHaveBeenCalled();
  });
});
