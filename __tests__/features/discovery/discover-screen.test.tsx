import React from 'react';
import { FlatList } from 'react-native';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { useDiscoveryBrowse } from '@/features/discovery/hooks/useDiscoveryBrowse';
import { useGenres } from '@/features/discovery/hooks/useGenres';
import DiscoverScreen from '../../../app/discover-browse';

const mockPush = jest.fn();
const mockReplace = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush, replace: mockReplace }),
  useLocalSearchParams: jest.fn(() => ({})),
  useSegments: jest.fn(() => ['discover-browse']),
  usePathname: jest.fn(() => '/discover-browse'),
}));

jest.mock('@/features/discovery/hooks/useDiscoveryBrowse', () => ({
  useDiscoveryBrowse: jest.fn(),
}));

jest.mock('@/features/discovery/hooks/useGenres', () => ({
  useGenres: jest.fn(),
}));

jest.mock('@/features/recommendations/hooks/useRecommendationHome', () => ({
  useRecommendationHome: jest.fn(),
}));

jest.mock('@/features/following/components/FollowingSection', () => ({
  FollowingSection: () => {
    const { Text } = require('react-native');
    return <Text>FollowingSection</Text>;
  },
}));

jest.mock('@/features/upcoming/components/UpcomingSection', () => ({
  UpcomingSection: () => {
    const { Text } = require('react-native');
    return <Text>UpcomingSection</Text>;
  },
}));

jest.mock('@/features/recommendations/components/RecommendationSection', () => ({
  RecommendationSection: () => {
    const { Text } = require('react-native');
    return <Text>RecommendationSection</Text>;
  },
}));

jest.mock('@/features/details/shared/navigation/prefetch-catalog-detail', () => ({
  prefetchCatalogDetail: jest.fn(),
}));

jest.mock('@tanstack/react-query', () => {
  const actual = jest.requireActual('@tanstack/react-query');

  return {
    ...actual,
    useQueryClient: () => ({
      prefetchQuery: jest.fn(),
      invalidateQueries: jest.fn(),
    }),
  };
});

const searchResult = {
  id: 'movie-1',
  type: 'movie' as const,
  title: 'Inception',
  originalTitle: 'Inception',
  overview: '',
  posterUrl: null,
  backdropUrl: null,
  releaseDate: '2010-07-16',
  voteAverage: 8.8,
  voteCount: 100,
  year: 2010,
};

function createBrowseQueryMock(overrides: Record<string, unknown> = {}) {
  return {
    data: {
      pages: [
        {
          items: [searchResult],
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
    refetch: jest.fn(),
    isRefetching: false,
    isFetchingNextPage: false,
    isFetching: false,
    hasNextPage: false,
    fetchNextPage: jest.fn(),
    ...overrides,
  };
}

describe('DiscoverScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    const useLocalSearchParams = jest.requireMock('expo-router').useLocalSearchParams as jest.Mock;
    useLocalSearchParams.mockReturnValue({});
    (useGenres as jest.Mock).mockReturnValue({
      data: [{ id: 'genre-1', name: 'Action' }],
      isLoading: false,
      isError: false,
    });
    (useDiscoveryBrowse as jest.Mock).mockReturnValue(createBrowseQueryMock());
  });

  it('mounts the browse FlatList when items are available', () => {
    render(<DiscoverScreen />);

    expect(screen.getByTestId('discover-browse-list')).toBeTruthy();
    expect(screen.getByText('Trending')).toBeTruthy();
    expect(screen.getByLabelText('Inception, Movie · 2010 · ★ 8.8')).toBeTruthy();
  });

  it('renders dynamic browse title and results without top-level mode/type controls', () => {
    render(<DiscoverScreen />);

    expect(screen.getByText('Trending')).toBeTruthy();
    expect(screen.queryByText('Discover')).toBeNull();
    expect(screen.queryByText('Browse movies and shows')).toBeNull();
    expect(screen.queryByLabelText('Top Rated')).toBeNull();
    expect(screen.queryByLabelText('Filter Movies')).toBeNull();
    expect(screen.getByLabelText('Inception, Movie · 2010 · ★ 8.8')).toBeTruthy();
  });

  it('renders top rated title from mode deep link', () => {
    const useLocalSearchParams = jest.requireMock('expo-router').useLocalSearchParams as jest.Mock;
    useLocalSearchParams.mockReturnValue({ mode: 'top_rated', type: 'all' });

    render(<DiscoverScreen />);

    expect(screen.getByText('Top Rated')).toBeTruthy();
  });

  it('renders new releases title from mode deep link', () => {
    const useLocalSearchParams = jest.requireMock('expo-router').useLocalSearchParams as jest.Mock;
    useLocalSearchParams.mockReturnValue({ mode: 'new_releases', type: 'all' });

    render(<DiscoverScreen />);

    expect(screen.getByText('New Releases')).toBeTruthy();
    expect(useDiscoveryBrowse).toHaveBeenCalledWith(
      'new_releases',
      'all',
      expect.objectContaining({ sort: 'release_desc' }),
    );
  });

  it('does not render following, upcoming, or recommendation sections', () => {
    render(<DiscoverScreen />);

    expect(screen.queryByText('FollowingSection')).toBeNull();
    expect(screen.queryByText('UpcomingSection')).toBeNull();
    expect(screen.queryByText('RecommendationSection')).toBeNull();
    expect(screen.queryByText('Sign in to see personalized recommendations.')).toBeNull();
    expect(screen.queryByText('Popular')).toBeNull();
  });

  it('uses a root FlatList with the browse header in ListHeaderComponent', () => {
    const { UNSAFE_getAllByType } = render(<DiscoverScreen />);

    expect(screen.getByTestId('discover-browse-list')).toBeTruthy();
    expect(UNSAFE_getAllByType(FlatList).length).toBeGreaterThan(0);
    expect(screen.getByText('Trending')).toBeTruthy();
  });

  it('opens filter sheet with content type and applies filters', () => {
    render(<DiscoverScreen />);

    fireEvent.press(screen.getByLabelText('Filters'));
    expect(screen.getByText('Content Type')).toBeTruthy();
    expect(screen.getByText('Show Results')).toBeTruthy();

    fireEvent.press(screen.getByLabelText('Genre Action'));
    fireEvent.press(screen.getByText('Show Results'));

    expect(mockReplace).toHaveBeenCalledWith(
      '/discover-browse?mode=trending&type=all&genres=genre-1',
    );
  });

  it('applies movie content type from filter sheet', () => {
    render(<DiscoverScreen />);

    fireEvent.press(screen.getByLabelText('Filters'));
    fireEvent.press(screen.getByLabelText('Content type Movies'));
    fireEvent.press(screen.getByText('Show Results'));

    expect(mockReplace).toHaveBeenCalledWith('/discover-browse?mode=trending&type=movie');
  });

  it('loads more results when pagination is available', () => {
    const fetchNextPage = jest.fn();
    (useDiscoveryBrowse as jest.Mock).mockReturnValue(
      createBrowseQueryMock({
        hasNextPage: true,
        fetchNextPage,
      }),
    );

    render(<DiscoverScreen />);
    const list = screen.getByTestId('discover-browse-list');

    list.props.onEndReached?.({ distanceFromEnd: 0 });

    expect(fetchNextPage).toHaveBeenCalled();
  });

  it('renders empty state with clear filters action', () => {
    (useDiscoveryBrowse as jest.Mock).mockReturnValue(
      createBrowseQueryMock({
        data: {
          pages: [
            {
              items: [],
              page: 1,
              pageSize: 20,
              totalCount: 0,
              totalPages: 0,
              hasNextPage: false,
              hasPreviousPage: false,
            },
          ],
        },
      }),
    );

    const useLocalSearchParams = jest.requireMock('expo-router').useLocalSearchParams as jest.Mock;
    useLocalSearchParams.mockReturnValue({
      mode: 'trending',
      type: 'all',
      genres: 'genre-1',
    });

    render(<DiscoverScreen />);

    expect(screen.getByText('No titles match your filters')).toBeTruthy();
    fireEvent.press(screen.getByText('Clear filters'));
    expect(mockReplace).toHaveBeenCalledWith('/discover-browse?mode=trending&type=all');
  });

  it('renders error state with retry', () => {
    const refetch = jest.fn();
    (useDiscoveryBrowse as jest.Mock).mockReturnValue(
      createBrowseQueryMock({
        data: undefined,
        isError: true,
        error: new Error('Network error'),
        refetch,
      }),
    );

    render(<DiscoverScreen />);

    fireEvent.press(screen.getByText('Try Again'));
    expect(refetch).toHaveBeenCalled();
  });

  it('navigates to catalog detail on result press', () => {
    render(<DiscoverScreen />);

    fireEvent.press(screen.getByLabelText('Inception, Movie · 2010 · ★ 8.8'));
    expect(mockPush).toHaveBeenCalledWith('/movie/movie-1');
  });
});
