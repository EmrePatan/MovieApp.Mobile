import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { ApiError } from '@/api/errors';
import { useHome } from '@/features/home/hooks/useHome';
import HomeScreen from '../../../app/(tabs)/home';

const mockRefetch = jest.fn();
const mockInvalidateQueries = jest.fn();
const mockUseHome = useHome as jest.Mock;

jest.mock('@tanstack/react-query', () => ({
  useQueryClient: () => ({
    invalidateQueries: mockInvalidateQueries,
  }),
}));

jest.mock('@/features/home/hooks/useHome', () => ({
  homeQueryKey: (type: string, sectionSize: number) => ['home', type, sectionSize],
  useHome: jest.fn(),
}));

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

jest.mock('@/features/favorites/components/FavoriteButton', () => ({
  FavoriteButton: () => null,
}));

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children }: { children: React.ReactNode }) => children,
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

describe('HomeScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state', () => {
    mockUseHome.mockReturnValue({
      data: undefined,
      error: null,
      isLoading: true,
      isFetching: true,
      isError: false,
      refetch: mockRefetch,
    });

    render(<HomeScreen />);
    expect(screen.getByLabelText('Loading home')).toBeTruthy();
  });

  it('renders home sections on success', () => {
    mockUseHome.mockReturnValue({
      data: {
        sections: [
          {
            type: 'Popular',
            title: 'Popular',
            displayOrder: 1,
            items: [
              {
                id: 'abc',
                contentType: 'tv',
                title: 'Breaking Bad',
                originalTitle: 'Breaking Bad',
                posterUrl: null,
                backdropUrl: null,
                releaseDate: '2008-01-20',
                voteAverage: 8.9,
                voteCount: 100,
              },
              {
                id: 'def',
                contentType: 'tv',
                title: 'Better Call Saul',
                originalTitle: 'Better Call Saul',
                posterUrl: null,
                backdropUrl: null,
                releaseDate: '2015-02-08',
                voteAverage: 8.7,
                voteCount: 80,
              },
            ],
          },
        ],
        isPersonalized: false,
      },
      error: null,
      isLoading: false,
      isFetching: false,
      isError: false,
      refetch: mockRefetch,
    });

    render(<HomeScreen />);
    expect(screen.getByText('Popular')).toBeTruthy();
    expect(screen.getAllByText('Breaking Bad')).toHaveLength(1);
    expect(screen.getByText('Better Call Saul')).toBeTruthy();
    expect(screen.getByLabelText('More info about Breaking Bad')).toBeTruthy();
  });

  it('renders error state with retry', () => {
    mockUseHome.mockReturnValue({
      data: undefined,
      error: new ApiError({ kind: 'network' }),
      isLoading: false,
      isFetching: false,
      isError: true,
      refetch: mockRefetch,
    });

    render(<HomeScreen />);
    fireEvent.press(screen.getByText('Try Again'));
    expect(mockRefetch).toHaveBeenCalled();
  });

  it('renders the featured hero from the highest-priority section', () => {
    mockUseHome.mockReturnValue({
      data: {
        sections: [
          {
            type: 'Trending',
            title: 'Trending',
            displayOrder: 2,
            items: [
              {
                id: 'trending-id',
                contentType: 'movie',
                title: 'Trending Movie',
                originalTitle: null,
                posterUrl: null,
                backdropUrl: null,
                releaseDate: '2020-01-01',
                voteAverage: 7.0,
                voteCount: 50,
              },
            ],
          },
          {
            type: 'ContinueWatching',
            title: 'Continue Watching',
            displayOrder: 1,
            items: [
              {
                id: 'continue-id',
                contentType: 'tv',
                title: 'Featured Show',
                originalTitle: null,
                posterUrl: null,
                backdropUrl: null,
                releaseDate: '2010-01-01',
                voteAverage: 9.0,
                voteCount: 200,
              },
            ],
          },
        ],
        isPersonalized: true,
      },
      error: null,
      isLoading: false,
      isFetching: false,
      isError: false,
      refetch: mockRefetch,
    });

    render(<HomeScreen />);
    expect(screen.getByLabelText('More info about Featured Show')).toBeTruthy();
    expect(screen.getAllByText('Featured Show')).toHaveLength(1);
    expect(screen.getByText('Trending Movie')).toBeTruthy();
  });

  it('deduplicates the featured item from its source rail', () => {
    mockUseHome.mockReturnValue({
      data: {
        sections: [
          {
            type: 'Trending',
            title: 'Trending',
            displayOrder: 2,
            items: [
              {
                id: 'trending-id',
                contentType: 'movie',
                title: 'Trending Movie',
                originalTitle: null,
                posterUrl: null,
                backdropUrl: null,
                releaseDate: '2020-01-01',
                voteAverage: 7.0,
                voteCount: 50,
              },
            ],
          },
          {
            type: 'ContinueWatching',
            title: 'Continue Watching',
            displayOrder: 1,
            items: [
              {
                id: 'continue-id',
                contentType: 'tv',
                title: 'Featured Show',
                originalTitle: null,
                posterUrl: null,
                backdropUrl: null,
                releaseDate: '2010-01-01',
                voteAverage: 9.0,
                voteCount: 200,
              },
              {
                id: 'second-show',
                contentType: 'tv',
                title: 'Second Show',
                originalTitle: null,
                posterUrl: null,
                backdropUrl: null,
                releaseDate: '2011-01-01',
                voteAverage: 8.0,
                voteCount: 100,
              },
            ],
          },
        ],
        isPersonalized: true,
      },
      error: null,
      isLoading: false,
      isFetching: false,
      isError: false,
      refetch: mockRefetch,
    });

    render(<HomeScreen />);

    expect(screen.getAllByText('Featured Show')).toHaveLength(1);
    expect(screen.getByText('Second Show')).toBeTruthy();
    expect(screen.getByText('Continue Watching')).toBeTruthy();
  });

  it('requests a new type when filter changes', () => {
    mockUseHome.mockReturnValue({
      data: { sections: [], isPersonalized: false },
      error: null,
      isLoading: false,
      isFetching: false,
      isError: false,
      refetch: mockRefetch,
    });

    render(<HomeScreen />);
    fireEvent.press(screen.getByLabelText('Show TV Shows'));

    expect(mockUseHome).toHaveBeenLastCalledWith('tv', 10);
  });
});
