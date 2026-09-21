import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { useHomeFeed } from '@/features/home/hooks/useHomeFeed';
import HomeScreen from '../../../app/(tabs)/(app-shell)/home';

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

jest.mock('@/features/home/hooks/useHomeFeed', () => ({
  useHomeFeed: jest.fn(),
}));

jest.mock('@/auth/useAuth', () => ({
  useAuth: jest.fn(() => ({
    isAuthenticated: true,
    isLoading: false,
  })),
}));

jest.mock('@/features/favorites/components/FavoriteButton', () => ({
  FavoriteButton: () => null,
}));

jest.mock('@/features/notifications/hooks/useUnreadNotificationCount', () => ({
  useUnreadNotificationCount: jest.fn(() => ({
    data: { unreadCount: 0 },
  })),
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

function createTrendingFillers(count: number) {
  return Array.from({ length: count }, (_, index) => ({
    id: `trending-filler-${index}`,
    contentType: 'movie' as const,
    title: `Trending Filler ${index}`,
    originalTitle: `Trending Filler ${index}`,
    posterUrl: null,
    backdropUrl: null,
    releaseDate: '2020-01-01',
    voteAverage: 7.0,
    voteCount: 10,
  }));
}

function mockHomeData(
  sections = [
    {
      type: 'HotThisWeek',
      title: 'Hot This Week',
      displayOrder: 0,
      items: homeSectionItems,
    },
    {
      type: 'TopRated',
      title: 'Top Rated',
      displayOrder: 1,
      items: homeSectionItems,
    },
  ],
) {
  (useHomeFeed as jest.Mock).mockReturnValue({
    browse: {
      data: { sections },
      isLoading: false,
      isError: false,
      isFetching: false,
      refetch: mockRefetch,
    },
    personalized: {
      data: { sections: [], isPersonalized: false },
      isLoading: false,
      isError: false,
      isFetching: false,
      refetch: jest.fn(),
    },
    mergedSections: sections,
    personalization: 'not-personalized',
    isInitialBrowseLoading: false,
    isFetching: false,
    refetch: mockRefetch,
  });
}

describe('Home detail navigation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockHomeData();
  });

  it('pushes movie detail from home using the tab catalog navigation helper', () => {
    render(<HomeScreen />);
    fireEvent.press(screen.getByLabelText('Arrival, Movie · 2016 · ★ 7.9'));

    expect(mockPush).toHaveBeenCalledWith('/movie/movie-b');
    expect(mockReplace).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(mockDismissTo).not.toHaveBeenCalled();
  });

  it('pushes tv detail from home using the tab catalog navigation helper', () => {
    mockHomeData([
      {
        type: 'TopRated',
        title: 'Top Rated',
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
    ]);

    render(<HomeScreen />);
    fireEvent.press(screen.getByLabelText('Better Call Saul, TV · 2015 · ★ 8.7'));

    expect(mockPush).toHaveBeenCalledWith('/tv/tv-b');
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('pushes each selected detail in order', () => {
    render(<HomeScreen />);

    fireEvent.press(screen.getByLabelText('Interstellar, Movie · ★ 8.4'));
    fireEvent.press(screen.getByLabelText('Arrival, Movie · 2016 · ★ 7.9'));
    fireEvent.press(screen.getByLabelText('Dune, Movie · 2021 · ★ 8.0'));

    expect(mockPush).toHaveBeenNthCalledWith(1, '/movie/movie-a');
    expect(mockPush).toHaveBeenNthCalledWith(2, '/movie/movie-b');
    expect(mockPush).toHaveBeenNthCalledWith(3, '/movie/movie-c');
    expect(mockReplace).not.toHaveBeenCalled();
  });
});
