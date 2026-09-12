import { fireEvent, render, screen } from '@testing-library/react-native';
import SearchScreen from '../../../app/(tabs)/search';
import { useAutocomplete } from '@/features/search/hooks/useAutocomplete';
import { useSearchResults } from '@/features/search/hooks/useSearch';
import {
  useClearSearchHistory,
  useDeleteSearchHistoryItem,
  useSearchHistory,
} from '@/features/search/hooks/useSearchHistory';

const mockPush = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush }),
}));

jest.mock('@/auth/useAuth', () => ({
  useAuth: () => ({ isAuthenticated: true }),
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

  it('renders initial empty state', () => {
    render(<SearchScreen />);
    expect(screen.getByText('Search for a movie or TV show')).toBeTruthy();
    expect(screen.getByText('Discover trending & popular')).toBeTruthy();
  });

  it('navigates to discover screen', () => {
    render(<SearchScreen />);
    fireEvent.press(screen.getByText('Discover trending & popular'));
    expect(mockPush).toHaveBeenCalledWith('/discover');
  });

  it('does not search for whitespace-only input', () => {
    render(<SearchScreen />);
    fireEvent.changeText(screen.getByLabelText('Search movies and TV shows'), '   ');
    fireEvent(screen.getByLabelText('Search movies and TV shows'), 'submitEditing');
    expect(useSearchResults).toHaveBeenLastCalledWith('', 'all');
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

    fireEvent.changeText(screen.getByLabelText('Search movies and TV shows'), 'interstellar');
    fireEvent(screen.getByLabelText('Search movies and TV shows'), 'submitEditing');

    fireEvent.press(screen.getByLabelText('Interstellar, Movie, 2014, rating 8.4'));
    expect(mockPush).toHaveBeenCalledWith('/movie/movie-id');
  });
});
