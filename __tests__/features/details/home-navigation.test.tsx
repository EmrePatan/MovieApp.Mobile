import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { useHome } from '@/features/home/hooks/useHome';
import HomeScreen from '../../../app/(tabs)/home';

const mockReplace = jest.fn();
const mockPush = jest.fn();
const mockNavigate = jest.fn();
const mockDismissTo = jest.fn();
const mockRefetch = jest.fn();
const mockInvalidateQueries = jest.fn();
const mockPrefetchQuery = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
    navigate: mockNavigate,
    dismissTo: mockDismissTo,
  }),
  useFocusEffect: jest.fn(),
}));

jest.mock('@tanstack/react-query', () => ({
  useQueryClient: () => ({
    invalidateQueries: mockInvalidateQueries,
    prefetchQuery: mockPrefetchQuery,
  }),
}));

jest.mock('@/features/home/hooks/useHome', () => ({
  homeQueryKey: (type: string, sectionSize: number) => ['home', type, sectionSize],
  useHome: jest.fn(),
}));

jest.mock('@/features/favorites/components/FavoriteButton', () => ({
  FavoriteButton: () => null,
}));

jest.mock('@/features/home/components/HomeHeroCarousel', () => ({
  HomeHeroCarousel: () => null,
}));

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children }: { children: React.ReactNode }) => children,
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

const homeSectionItems = [
  {
    id: 'movie-a',
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
    id: 'movie-b',
    contentType: 'movie',
    title: 'Arrival',
    originalTitle: 'Arrival',
    posterUrl: null,
    backdropUrl: null,
    releaseDate: '2016-11-11',
    voteAverage: 7.9,
    voteCount: 80,
  },
  {
    id: 'movie-c',
    contentType: 'movie',
    title: 'Dune',
    originalTitle: 'Dune',
    posterUrl: null,
    backdropUrl: null,
    releaseDate: '2021-10-22',
    voteAverage: 8.0,
    voteCount: 90,
  },
];

function mockHomeData() {
  (useHome as jest.Mock).mockReturnValue({
    data: {
      sections: [
        {
          type: 'NewReleases',
          title: 'New Releases',
          displayOrder: 1,
          items: homeSectionItems,
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
}

describe('Home detail navigation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockHomeData();
  });

  it('replaces movie detail from home to avoid hidden tab stack buildup', () => {
    render(<HomeScreen />);
    fireEvent.press(screen.getByLabelText('Arrival, Movie · 2016 · ★ 7.9'));

    expect(mockReplace).toHaveBeenCalledWith('/movie/movie-b');
    expect(mockPush).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(mockDismissTo).not.toHaveBeenCalled();
  });

  it('replaces tv detail from home to avoid hidden tab stack buildup', () => {
    (useHome as jest.Mock).mockReturnValue({
      data: {
        sections: [
          {
            type: 'NewReleases',
            title: 'New Releases',
            displayOrder: 1,
            items: [
              {
                id: 'tv-a',
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
                id: 'tv-b',
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

    expect(mockReplace).toHaveBeenCalledWith('/tv/tv-b');
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('replaces each selected detail in order', () => {
    render(<HomeScreen />);

    fireEvent.press(screen.getByLabelText('Interstellar, Movie · ★ 8.4'));
    fireEvent.press(screen.getByLabelText('Arrival, Movie · 2016 · ★ 7.9'));
    fireEvent.press(screen.getByLabelText('Dune, Movie · 2021 · ★ 8.0'));

    expect(mockReplace).toHaveBeenNthCalledWith(1, '/movie/movie-a');
    expect(mockReplace).toHaveBeenNthCalledWith(2, '/movie/movie-b');
    expect(mockReplace).toHaveBeenNthCalledWith(3, '/movie/movie-c');
    expect(mockPush).not.toHaveBeenCalled();
  });
});
