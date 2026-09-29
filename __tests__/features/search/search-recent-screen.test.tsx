import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import SearchScreen from '../../../app/(tabs)/(app-shell)/search';
import { useAutocomplete } from '@/features/search/hooks/useAutocomplete';
import { useSearchResults } from '@/features/search/hooks/useSearch';
import { useRecentSearches } from '@/features/search/hooks/useRecentSearches';
import { trackProductMetric } from '@/features/metrics/track-product-metric';

const mockPush = jest.fn();
const mockRecordQuery = jest.fn().mockResolvedValue([]);
const mockRecordEntity = jest.fn().mockResolvedValue([]);
const mockRemoveItem = jest.fn().mockResolvedValue([]);
const mockClearAll = jest.fn().mockResolvedValue([]);

jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: jest.fn(),
    dismissTo: jest.fn(),
    back: jest.fn(),
    canGoBack: jest.fn(() => false),
  }),
  useLocalSearchParams: jest.fn(() => ({})),
  useFocusEffect: (callback: () => void | (() => void)) => {
    const cleanup = callback();
    return cleanup;
  },
  useSegments: jest.fn(() => ['search']),
  usePathname: jest.fn(() => '/search'),
}));

jest.mock('@/auth/useAuth', () => ({
  useAuth: () => ({ isAuthenticated: false, user: null }),
}));

jest.mock('@/features/search/hooks/useSearch', () => ({
  useSearchResults: jest.fn(),
}));

jest.mock('@/features/search/hooks/useAutocomplete', () => ({
  useAutocomplete: jest.fn(),
}));

jest.mock('@/features/search/hooks/useRecentSearches', () => ({
  useRecentSearches: jest.fn(),
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

jest.mock('@/features/metrics/track-product-metric', () => ({
  trackProductMetric: jest.fn(),
}));

const recentEntity = {
  id: 'recent-entity-1',
  kind: 'entity' as const,
  entityType: 'movie' as const,
  catalogId: 'movie-id',
  title: 'Inception',
  posterUrl: null,
  accessedAt: Date.now(),
};

describe('SearchScreen recent searches', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    (useSearchResults as jest.Mock).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
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

    (useRecentSearches as jest.Mock).mockReturnValue({
      items: [],
      isLoading: false,
      recordQuery: mockRecordQuery,
      recordEntity: mockRecordEntity,
      removeItem: mockRemoveItem,
      clearAll: mockClearAll,
    });
  });

  it('shows recent searches for guests when items exist', () => {
    (useRecentSearches as jest.Mock).mockReturnValue({
      items: [
        {
          id: 'recent-query-1',
          kind: 'query',
          query: 'inception',
          accessedAt: Date.now(),
        },
      ],
      isLoading: false,
      recordQuery: mockRecordQuery,
      recordEntity: mockRecordEntity,
      removeItem: mockRemoveItem,
      clearAll: mockClearAll,
    });

    render(<SearchScreen />);

    expect(screen.getByText('Recent Searches')).toBeTruthy();
    expect(screen.getByText('inception')).toBeTruthy();
  });

  it('records query on submit only', () => {
    render(<SearchScreen />);

    fireEvent.changeText(screen.getByLabelText('Search movies, TV shows, and people'), 'inte');
    expect(mockRecordQuery).not.toHaveBeenCalled();

    fireEvent.changeText(screen.getByLabelText('Search movies, TV shows, and people'), 'inception');
    fireEvent(screen.getByLabelText('Search movies, TV shows, and people'), 'submitEditing');

    expect(mockRecordQuery).toHaveBeenCalledWith('inception');
    expect(trackProductMetric).toHaveBeenCalledWith('search_submitted');
  });

  it('records entity on result press before navigation', async () => {
    (useSearchResults as jest.Mock).mockReturnValue({
      data: {
        pages: [
          {
            items: [
              {
                id: 'movie-id',
                type: 'movie',
                title: 'Inception',
                originalTitle: 'Inception',
                overview: '',
                posterUrl: null,
                backdropUrl: null,
                releaseDate: '2010-07-16',
                voteAverage: 8,
                voteCount: 100,
                year: 2010,
              },
            ],
          },
        ],
      },
      isLoading: false,
      isError: false,
      isFetchingNextPage: false,
      isRefetching: false,
      hasNextPage: false,
      fetchNextPage: jest.fn(),
      refetch: jest.fn(),
    });

    render(<SearchScreen />);

    fireEvent.changeText(screen.getByLabelText('Search movies, TV shows, and people'), 'inception');
    fireEvent(screen.getByLabelText('Search movies, TV shows, and people'), 'submitEditing');

    fireEvent.press(screen.getByLabelText('Inception, Movie · 2010 · ★ 8.0'));

    await waitFor(() => {
      expect(mockRecordEntity).toHaveBeenCalledWith(
        expect.objectContaining({
          entityType: 'movie',
          catalogId: 'movie-id',
          title: 'Inception',
        }),
      );
    });

    expect(mockOpenCatalogDetailFromTab).toHaveBeenCalled();
  });

  it('navigates from recent entity rows', () => {
    (useRecentSearches as jest.Mock).mockReturnValue({
      items: [recentEntity],
      isLoading: false,
      recordQuery: mockRecordQuery,
      recordEntity: mockRecordEntity,
      removeItem: mockRemoveItem,
      clearAll: mockClearAll,
    });

    render(<SearchScreen />);

    fireEvent.press(screen.getByLabelText('Open Inception, Movie'));

    expect(mockRecordEntity).toHaveBeenCalled();
    expect(mockOpenCatalogDetailFromTab).toHaveBeenCalled();
  });

  it('clears and deletes recent items', () => {
    (useRecentSearches as jest.Mock).mockReturnValue({
      items: [
        {
          id: 'recent-query-1',
          kind: 'query',
          query: 'inception',
          accessedAt: Date.now(),
        },
      ],
      isLoading: false,
      recordQuery: mockRecordQuery,
      recordEntity: mockRecordEntity,
      removeItem: mockRemoveItem,
      clearAll: mockClearAll,
    });

    render(<SearchScreen />);

    fireEvent.press(screen.getByLabelText('Delete inception from history'));
    expect(mockRemoveItem).toHaveBeenCalledWith('recent-query-1');

    fireEvent.press(screen.getByLabelText('Clear all search history'));
    expect(mockClearAll).toHaveBeenCalled();
  });
});
