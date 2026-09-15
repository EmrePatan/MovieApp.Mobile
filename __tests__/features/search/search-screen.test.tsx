import { fireEvent, render, screen } from '@testing-library/react-native';
import SearchScreen from '../../../app/(tabs)/search';
import { useGenres } from '@/features/discovery/hooks/useGenres';
import { useAutocomplete } from '@/features/search/hooks/useAutocomplete';
import { useSearchResults } from '@/features/search/hooks/useSearch';
import {
  useClearSearchHistory,
  useDeleteSearchHistoryItem,
  useSearchHistory,
} from '@/features/search/hooks/useSearchHistory';

const mockPush = jest.fn();
const mockReplace = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush, replace: mockReplace }),
  useLocalSearchParams: jest.fn(() => ({})),
}));

jest.mock('@/auth/useAuth', () => ({
  useAuth: () => ({ isAuthenticated: true }),
}));

jest.mock('@/features/discovery/hooks/useGenres', () => ({
  useGenres: jest.fn(),
}));

jest.mock('@/features/search/hooks/useSearch', () => ({
  useSearchResults: jest.fn(),
}));

jest.mock('@/features/search/hooks/useAutocomplete', () => ({
  useAutocomplete: jest.fn(),
}));

jest.mock('@/features/search/hooks/useSearchHistory', () => ({
  useSearchHistory: jest.fn(),
  useDeleteSearchHistoryItem: jest.fn(),
  useClearSearchHistory: jest.fn(),
}));

jest.mock('@/hooks/useDebouncedValue', () => ({
  useDebouncedValue: (value: string) => value,
}));

const mockOpenCatalogDetailFromTab = jest.fn();
const mockOpenPersonDetail = jest.fn();

jest.mock('@/features/details/shared/navigation/open-catalog-detail-from-tab', () => ({
  openCatalogDetailFromTab: (...args: unknown[]) => mockOpenCatalogDetailFromTab(...args),
}));

jest.mock('@/features/details/shared/navigation/person-detail-navigation', () => ({
  openPersonDetail: (...args: unknown[]) => mockOpenPersonDetail(...args),
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

const mockSearchResult = {
  id: 'movie-id',
  type: 'movie' as const,
  title: 'Interstellar',
  originalTitle: 'Interstellar',
  overview: 'Space travel.',
  posterUrl: null,
  backdropUrl: null,
  releaseDate: '2014-11-07',
  voteAverage: 8.4,
  voteCount: 1000,
  year: 2014,
};

describe('SearchScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    (useGenres as jest.Mock).mockReturnValue({
      data: [{ id: 'genre-1', name: 'Action' }],
      isLoading: false,
      isError: false,
    });

    (useSearchResults as jest.Mock).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
      isFetching: false,
      isFetchingNextPage: false,
      isRefetching: false,
      hasNextPage: false,
      fetchNextPage: jest.fn(),
      refetch: jest.fn(),
    });

    (useAutocomplete as jest.Mock).mockReturnValue({
      data: { items: [] },
      isLoading: false,
    });

    (useSearchHistory as jest.Mock).mockReturnValue({
      data: { items: [] },
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
    });

    (useDeleteSearchHistoryItem as jest.Mock).mockReturnValue({
      mutate: jest.fn(),
      isPending: false,
    });

    (useClearSearchHistory as jest.Mock).mockReturnValue({
      mutate: jest.fn(),
      isPending: false,
    });
  });

  it('renders explore landing in idle state', () => {
    render(<SearchScreen />);

    expect(screen.queryByText('Trending Now')).toBeNull();
    expect(screen.queryByText('Top Rated')).toBeNull();
    expect(screen.queryByText('New Releases')).toBeNull();
    expect(screen.getByText('Explore by Genre')).toBeTruthy();
    expect(screen.queryByText('Discover trending & popular')).toBeNull();
  });

  it('navigates to discover from genre chip', () => {
    render(<SearchScreen />);
    fireEvent.press(screen.getByLabelText('Browse Action'));
    expect(mockPush).toHaveBeenCalledWith('/discover?mode=trending&type=all&genres=genre-1');
  });

  it('does not search for whitespace-only input', () => {
    render(<SearchScreen />);
    fireEvent.changeText(screen.getByLabelText('Search movies, TV shows, and people'), '   ');
    fireEvent(screen.getByLabelText('Search movies, TV shows, and people'), 'submitEditing');
    expect(useSearchResults).toHaveBeenLastCalledWith('', 'all');
  });

  it('renders autocomplete suggestions while typing', () => {
    (useAutocomplete as jest.Mock).mockReturnValue({
      data: {
        items: [{ id: '1', type: 'tv', title: 'Breaking Bad', posterUrl: null }],
      },
      isLoading: false,
    });

    render(<SearchScreen />);
    fireEvent.changeText(screen.getByLabelText('Search movies, TV shows, and people'), 'break');

    expect(screen.getByLabelText('Search for Breaking Bad, TV')).toBeTruthy();
    expect(screen.getByLabelText('TV show suggestion')).toBeTruthy();
  });

  it('hides explore content while autocomplete is active', () => {
    (useAutocomplete as jest.Mock).mockReturnValue({
      data: {
        items: [{ id: '1', type: 'movie', title: 'Interstellar', posterUrl: '/fake/interstellar-poster.jpg' }],
      },
      isLoading: false,
    });

    render(<SearchScreen />);
    fireEvent.changeText(screen.getByLabelText('Search movies, TV shows, and people'), 'inte');

    expect(screen.getByLabelText('Search for Interstellar, Movie')).toBeTruthy();
    expect(screen.queryByText('Trending Now')).toBeNull();
    expect(screen.queryByText('Explore by Genre')).toBeNull();
  });

  it('hides recent searches while autocomplete is active', () => {
    (useSearchHistory as jest.Mock).mockReturnValue({
      data: {
        items: [
          {
            id: 'history-1',
            query: 'inception',
            searchedAt: '2026-09-11T14:30:00Z',
          },
        ],
      },
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
    });

    (useAutocomplete as jest.Mock).mockReturnValue({
      data: {
        items: [{ id: '1', type: 'movie', title: 'Interstellar', posterUrl: '/fake/interstellar-poster.jpg' }],
      },
      isLoading: false,
    });

    render(<SearchScreen />);
    fireEvent.changeText(screen.getByLabelText('Search movies, TV shows, and people'), 'inte');

    expect(screen.queryByText('Recent Searches')).toBeNull();
    expect(screen.queryByText('inception')).toBeNull();
  });

  it('shows minimal autocomplete empty state instead of explore content', () => {
    (useAutocomplete as jest.Mock).mockReturnValue({
      data: { items: [] },
      isLoading: false,
    });

    render(<SearchScreen />);
    fireEvent.changeText(screen.getByLabelText('Search movies, TV shows, and people'), 'zzzz');

    expect(screen.getByLabelText('No suggestions')).toBeTruthy();
    expect(screen.queryByText('Trending Now')).toBeNull();
  });

  it('restores explore after clearing an autocomplete query', () => {
    (useAutocomplete as jest.Mock).mockReturnValue({
      data: {
        items: [{ id: '1', type: 'movie', title: 'Interstellar', posterUrl: '/fake/interstellar-poster.jpg' }],
      },
      isLoading: false,
    });

    render(<SearchScreen />);
    fireEvent.changeText(screen.getByLabelText('Search movies, TV shows, and people'), 'inte');
    fireEvent.press(screen.getByLabelText('Clear search'));

    expect(screen.getByText('Explore by Genre')).toBeTruthy();
    expect(screen.queryByLabelText('Search for Interstellar, Movie')).toBeNull();
  });

  it('submits a query from autocomplete', () => {
    (useAutocomplete as jest.Mock).mockReturnValue({
      data: {
        items: [{ id: '1', type: 'movie', title: 'Interstellar', posterUrl: '/fake/interstellar-poster.jpg' }],
      },
      isLoading: false,
    });

    render(<SearchScreen />);
    fireEvent.changeText(screen.getByLabelText('Search movies, TV shows, and people'), 'inte');
    fireEvent.press(screen.getByLabelText('Search for Interstellar, Movie'));

    expect(useSearchResults).toHaveBeenLastCalledWith('Interstellar', 'all');
  });

  it('keeps the search input mounted while submitted search is loading', () => {
    (useSearchResults as jest.Mock).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      isFetching: true,
      isFetchingNextPage: false,
      isRefetching: false,
      hasNextPage: false,
      fetchNextPage: jest.fn(),
      refetch: jest.fn(),
    });

    render(<SearchScreen />);
    fireEvent.changeText(screen.getByLabelText('Search movies, TV shows, and people'), 'dune');
    fireEvent(screen.getByLabelText('Search movies, TV shows, and people'), 'submitEditing');

    expect(screen.getByDisplayValue('dune')).toBeTruthy();
    expect(screen.getByLabelText('Loading search results')).toBeTruthy();
  });

  it('shows loading state for submitted search', () => {
    (useSearchResults as jest.Mock).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      isFetching: true,
      isFetchingNextPage: false,
      isRefetching: false,
      hasNextPage: false,
      fetchNextPage: jest.fn(),
      refetch: jest.fn(),
    });

    render(<SearchScreen />);
    fireEvent.changeText(screen.getByLabelText('Search movies, TV shows, and people'), 'interstellar');
    fireEvent(screen.getByLabelText('Search movies, TV shows, and people'), 'submitEditing');

    expect(screen.getByLabelText('Loading search results')).toBeTruthy();
  });

  it('shows API error state for submitted search', () => {
    const { ApiError } = require('@/api/errors');

    (useSearchResults as jest.Mock).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new ApiError({ kind: 'network' }),
      isFetching: false,
      isFetchingNextPage: false,
      isRefetching: false,
      hasNextPage: false,
      fetchNextPage: jest.fn(),
      refetch: jest.fn(),
    });

    render(<SearchScreen />);
    fireEvent.changeText(screen.getByLabelText('Search movies, TV shows, and people'), 'interstellar');
    fireEvent(screen.getByLabelText('Search movies, TV shows, and people'), 'submitEditing');

    expect(screen.getByText('Try Again')).toBeTruthy();
  });

  it('shows zero-results state distinct from API failure', () => {
    (useSearchResults as jest.Mock).mockReturnValue({
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
      isLoading: false,
      isError: false,
      isFetching: false,
      isFetchingNextPage: false,
      isRefetching: false,
      hasNextPage: false,
      fetchNextPage: jest.fn(),
      refetch: jest.fn(),
    });

    render(<SearchScreen />);
    fireEvent.changeText(screen.getByLabelText('Search movies, TV shows, and people'), 'zzzz');
    fireEvent(screen.getByLabelText('Search movies, TV shows, and people'), 'submitEditing');

    expect(screen.getByText('No results for “zzzz”')).toBeTruthy();
    expect(screen.queryByText('Try Again')).toBeNull();
  });

  it('navigates to movie detail from result card', () => {
    (useSearchResults as jest.Mock).mockReturnValue({
      data: {
        pages: [
          {
            items: [mockSearchResult],
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
      isFetching: false,
      isFetchingNextPage: false,
      isRefetching: false,
      hasNextPage: false,
      fetchNextPage: jest.fn(),
      refetch: jest.fn(),
    });

    render(<SearchScreen />);

    fireEvent.changeText(screen.getByLabelText('Search movies, TV shows, and people'), 'interstellar');
    fireEvent(screen.getByLabelText('Search movies, TV shows, and people'), 'submitEditing');

    fireEvent.press(screen.getByLabelText('Interstellar, Movie · 2014 · ★ 8.4'));
    expect(mockOpenCatalogDetailFromTab).toHaveBeenCalledWith(
      expect.objectContaining({ push: mockPush }),
      'movie-id',
      'movie',
      'search',
      expect.objectContaining({ queryClient: expect.any(Object) }),
    );
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('renders person autocomplete suggestions with department', () => {
    (useAutocomplete as jest.Mock).mockReturnValue({
      data: {
        items: [
          {
            id: '1',
            type: 'person',
            title: 'Leonardo DiCaprio',
            posterUrl: null,
            knownForDepartment: 'Acting',
          },
        ],
      },
      isLoading: false,
    });

    render(<SearchScreen />);
    fireEvent.changeText(screen.getByLabelText('Search movies, TV shows, and people'), 'leo');

    expect(screen.getByLabelText('Search for Leonardo DiCaprio, Person · Acting')).toBeTruthy();
    expect(screen.getByLabelText('Person suggestion')).toBeTruthy();
  });

  it('navigates to tv detail from result card', () => {
    (useSearchResults as jest.Mock).mockReturnValue({
      data: {
        pages: [
          {
            items: [
              {
                ...mockSearchResult,
                id: 'tv-id',
                type: 'tv',
                title: 'Breaking Bad',
                releaseDate: '2008-01-20',
                year: 2008,
                voteAverage: 8.9,
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
      isLoading: false,
      isError: false,
      isFetching: false,
      isFetchingNextPage: false,
      isRefetching: false,
      hasNextPage: false,
      fetchNextPage: jest.fn(),
      refetch: jest.fn(),
    });

    render(<SearchScreen />);

    fireEvent.changeText(screen.getByLabelText('Search movies, TV shows, and people'), 'breaking');
    fireEvent(screen.getByLabelText('Search movies, TV shows, and people'), 'submitEditing');

    fireEvent.press(screen.getByLabelText('Breaking Bad, TV · 2008 · ★ 8.9'));
    expect(mockOpenCatalogDetailFromTab).toHaveBeenCalledWith(
      expect.objectContaining({ push: mockPush }),
      'tv-id',
      'tv',
      'search',
      expect.objectContaining({ queryClient: expect.any(Object) }),
    );
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('navigates to person detail from result card', () => {
    (useSearchResults as jest.Mock).mockReturnValue({
      data: {
        pages: [
          {
            items: [
              {
                id: 'person-id',
                type: 'person',
                title: 'Leonardo DiCaprio',
                tmdbId: 6193,
                knownForDepartment: 'Acting',
                posterUrl: null,
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
      isLoading: false,
      isError: false,
      isFetching: false,
      isFetchingNextPage: false,
      isRefetching: false,
      hasNextPage: false,
      fetchNextPage: jest.fn(),
      refetch: jest.fn(),
    });

    render(<SearchScreen />);

    fireEvent.changeText(screen.getByLabelText('Search movies, TV shows, and people'), 'leo');
    fireEvent(screen.getByLabelText('Search movies, TV shows, and people'), 'submitEditing');

    fireEvent.press(screen.getByLabelText('Leonardo DiCaprio, Person · Acting'));
    expect(mockOpenPersonDetail).toHaveBeenCalledWith(
      expect.objectContaining({ push: mockPush }),
      6193,
      '/(tabs)/search',
    );
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('renders recent searches when history exists', () => {
    (useSearchHistory as jest.Mock).mockReturnValue({
      data: {
        items: [
          {
            id: 'history-1',
            query: 'inception',
            searchedAt: '2026-09-11T14:30:00Z',
          },
        ],
      },
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
    });

    render(<SearchScreen />);

    expect(screen.getByText('Recent Searches')).toBeTruthy();
    expect(screen.getByText('inception')).toBeTruthy();
    expect(screen.queryByText('Trending Now')).toBeNull();
  });

  it('clears the query from the clear button', () => {
    render(<SearchScreen />);

    fireEvent.changeText(screen.getByLabelText('Search movies, TV shows, and people'), 'inter');
    fireEvent.press(screen.getByLabelText('Clear search'));

    expect(screen.getByDisplayValue('')).toBeTruthy();
    expect(useSearchResults).toHaveBeenLastCalledWith('', 'all');
  });

  it('changes search type filter after submitting', () => {
    render(<SearchScreen />);

    fireEvent.changeText(screen.getByLabelText('Search movies, TV shows, and people'), 'star');
    fireEvent(screen.getByLabelText('Search movies, TV shows, and people'), 'submitEditing');
    fireEvent.press(screen.getByLabelText('Filter TV Shows'));

    expect(useSearchResults).toHaveBeenLastCalledWith('star', 'tv');
    fireEvent.press(screen.getByLabelText('Filter People'));
    expect(useSearchResults).toHaveBeenLastCalledWith('star', 'person');
  });

  it('keeps search usable when genre loading fails', () => {
    (useGenres as jest.Mock).mockReturnValue({
      data: [{ id: 'genre-1', name: 'Action' }],
      isLoading: false,
      isError: true,
    });

    render(<SearchScreen />);

    expect(screen.getByLabelText('Search movies, TV shows, and people')).toBeTruthy();
    expect(screen.getByText('Explore by Genre')).toBeTruthy();
  });

  it('clears search state when explore param is present', () => {
    const useLocalSearchParams = jest.requireMock('expo-router').useLocalSearchParams as jest.Mock;
    useLocalSearchParams.mockReturnValue({ explore: '1' });

    render(<SearchScreen />);

    expect(mockReplace).toHaveBeenCalledWith('/(tabs)/search');
    expect(useSearchResults).toHaveBeenLastCalledWith('', 'all');
  });
});
