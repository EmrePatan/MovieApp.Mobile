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
    fireEvent.press(screen.getByLabelText('Interstellar, Movie, rating 8.4'));
    expect(mockPush).toHaveBeenCalledWith('/movie/movie-id');
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
    fireEvent.press(screen.getByLabelText('Breaking Bad, TV, rating 8.9'));
    expect(mockPush).toHaveBeenCalledWith('/tv/tv-id');
  });
});
