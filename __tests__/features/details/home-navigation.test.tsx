import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { useHome } from '@/features/home/hooks/useHome';
import HomeScreen from '../../../app/(tabs)/home';

const mockPush = jest.fn();
const mockRefetch = jest.fn();
const mockInvalidateQueries = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush }),
}));

jest.mock('@tanstack/react-query', () => ({
  useQueryClient: () => ({
    invalidateQueries: mockInvalidateQueries,
  }),
}));

jest.mock('@/features/home/hooks/useHome', () => ({
  homeQueryKey: (type: string, sectionSize: number) => ['home', type, sectionSize],
  useHome: jest.fn(),
}));

jest.mock('@/features/favorites/components/FavoriteButton', () => ({
  FavoriteButton: () => null,
}));

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children }: { children: React.ReactNode }) => children,
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

describe('Home detail navigation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('navigates to movie detail from home card', () => {
    (useHome as jest.Mock).mockReturnValue({
      data: {
        sections: [
          {
            type: 'Popular',
            title: 'Popular',
            displayOrder: 1,
            items: [
              {
                id: 'movie-id',
                contentType: 'movie',
                title: 'Interstellar',
                originalTitle: 'Interstellar',
                posterUrl: null,
                backdropUrl: null,
                releaseDate: null,
                voteAverage: 8.4,
                voteCount: 100,
              },
              {
                id: 'second-movie-id',
                contentType: 'movie',
                title: 'Arrival',
                originalTitle: 'Arrival',
                posterUrl: null,
                backdropUrl: null,
                releaseDate: '2016-11-11',
                voteAverage: 7.9,
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
    fireEvent.press(screen.getByLabelText('Arrival, Movie · 2016 · ★ 7.9'));
    expect(mockPush).toHaveBeenCalledWith('/movie/second-movie-id');
  });

  it('navigates to tv detail from home card', () => {
    (useHome as jest.Mock).mockReturnValue({
      data: {
        sections: [
          {
            type: 'Trending',
            title: 'Trending',
            displayOrder: 1,
            items: [
              {
                id: 'tv-id',
                contentType: 'tv',
                title: 'Breaking Bad',
                originalTitle: 'Breaking Bad',
                posterUrl: null,
                backdropUrl: null,
                releaseDate: null,
                voteAverage: 8.9,
                voteCount: 100,
              },
              {
                id: 'second-tv-id',
                contentType: 'tv',
                title: 'Better Call Saul',
                originalTitle: 'Better Call Saul',
                posterUrl: null,
                backdropUrl: null,
                releaseDate: '2015-02-08',
                voteAverage: 8.7,
                voteCount: 90,
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
    fireEvent.press(screen.getByLabelText('Better Call Saul, TV · 2015 · ★ 8.7'));
    expect(mockPush).toHaveBeenCalledWith('/tv/second-tv-id');
  });
});
