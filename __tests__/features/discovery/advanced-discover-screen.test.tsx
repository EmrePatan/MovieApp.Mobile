import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { ApiError } from '@/api/errors';
import { useAdvancedDiscover } from '@/features/discovery/hooks/useAdvancedDiscover';
import { useGenres } from '@/features/discovery/hooks/useGenres';
import AdvancedDiscoverScreen from '../../../app/(tabs)/(app-shell)/advanced-discover';

const mockPush = jest.fn();
const mockReplace = jest.fn();
const mockSetParams = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush, replace: mockReplace, setParams: mockSetParams }),
  useLocalSearchParams: jest.fn(() => ({})),
  useSegments: jest.fn(() => ['advanced-discover']),
  usePathname: jest.fn(() => '/advanced-discover'),
}));

jest.mock('@/features/discovery/hooks/useAdvancedDiscover', () => ({
  useAdvancedDiscover: jest.fn(),
}));

jest.mock('@/features/discovery/hooks/useGenres', () => ({
  useGenres: jest.fn(),
}));

jest.mock('@/features/regions/hooks/useRegionalPreference', () => ({
  useRegionalPreference: jest.fn(() => ({
    region: 'TR',
    source: 'fallback',
    isHydrated: true,
    setRegion: jest.fn(),
    resetToDeviceDefault: jest.fn(),
  })),
}));

jest.mock('@/features/discovery/hooks/useDiscoveryWatchProviders', () => ({
  useDiscoveryWatchProviders: jest.fn(() => ({
    data: { watchRegion: 'TR', mediaType: 'movie', providers: [] },
    isLoading: false,
    isError: false,
    refetch: jest.fn(),
  })),
}));

jest.mock('@/features/details/shared/navigation/prefetch-catalog-detail', () => ({
  prefetchCatalogDetail: jest.fn(),
}));

const mockOpenCatalogDetail = jest.fn();

jest.mock('@/features/details/shared/navigation/catalog-detail-navigation', () => ({
  openCatalogDetailFromLibraryStack: (...args: unknown[]) => mockOpenCatalogDetail(...args),
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

const movieResult = {
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

const tvResult = {
  id: 'tv-1',
  type: 'tv' as const,
  title: 'Breaking Bad',
  originalTitle: 'Breaking Bad',
  overview: '',
  posterUrl: null,
  backdropUrl: null,
  releaseDate: '2008-01-20',
  voteAverage: 9.5,
  voteCount: 200,
  year: 2008,
};

function createDiscoverQueryMock(overrides: Record<string, unknown> = {}) {
  return {
    data: {
      pages: [
        {
          items: [movieResult],
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

describe('AdvancedDiscoverScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    const { useLocalSearchParams } = jest.requireMock('expo-router');
    useLocalSearchParams.mockReturnValue({});
    (useGenres as jest.Mock).mockReturnValue({
      data: [{ id: 'genre-1', name: 'Action' }],
      isLoading: false,
    });
    (useAdvancedDiscover as jest.Mock).mockReturnValue(createDiscoverQueryMock());
  });

  it('opens the filter sheet on first visit without prefetching results', () => {
    render(<AdvancedDiscoverScreen />);

    expect(screen.getAllByText('Advanced Discover').length).toBeGreaterThan(0);
    expect(screen.getByText('Media Type')).toBeTruthy();
    expect(screen.queryByText('Inception')).toBeNull();
    expect(useAdvancedDiscover).toHaveBeenCalledWith(
      'movie',
      expect.any(Object),
      undefined,
      false,
    );
  });

  it('renders results after filters are applied', () => {
    render(<AdvancedDiscoverScreen />);

    fireEvent.press(screen.getByText('Show Results'));

    expect(screen.getByText('Inception')).toBeTruthy();
    expect(useAdvancedDiscover).toHaveBeenLastCalledWith(
      'movie',
      expect.any(Object),
      undefined,
      true,
    );
  });

  it('opens filter sheet from filters button', () => {
    render(<AdvancedDiscoverScreen />);

    fireEvent.press(screen.getByLabelText('Close'));
    fireEvent.press(screen.getByLabelText('Filters'));

    expect(screen.getByText('Media Type')).toBeTruthy();
    expect(screen.getByLabelText('Media type TV Shows')).toBeTruthy();
    expect(screen.queryByTestId('watch-region-selector')).toBeNull();
    expect(screen.queryByText('Where to watch (availability region)')).toBeNull();
  });

  it('applies movie to tv toggle through setParams without pushing history', () => {
    render(<AdvancedDiscoverScreen />);

    fireEvent.press(screen.getByLabelText('Media type TV Shows'));
    fireEvent.press(screen.getByText('Show Results'));

    expect(mockSetParams).toHaveBeenCalledWith(expect.objectContaining({ mediaType: 'tv' }));
    expect(mockReplace).not.toHaveBeenCalled();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('resets filters to defaults via setParams', () => {
    render(<AdvancedDiscoverScreen />);

    fireEvent.press(screen.getByText('Reset'));

    expect(mockSetParams).toHaveBeenCalledWith(
      expect.objectContaining({
        mediaType: 'movie',
        genres: undefined,
        minRating: undefined,
      }),
    );
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('shows empty state with clear action when filtered results are empty', () => {
    (useAdvancedDiscover as jest.Mock).mockReturnValue(
      createDiscoverQueryMock({
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

    const { useLocalSearchParams } = jest.requireMock('expo-router');
    useLocalSearchParams.mockReturnValue({
      mediaType: 'movie',
      minRating: '8',
    });

    render(<AdvancedDiscoverScreen />);

    expect(screen.getByText('No titles match your filters')).toBeTruthy();
    fireEvent.press(screen.getByText('Clear filters'));
    expect(mockSetParams).toHaveBeenCalled();
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('shows error retry state', () => {
    const refetch = jest.fn();
    (useAdvancedDiscover as jest.Mock).mockReturnValue(
      createDiscoverQueryMock({
        data: undefined,
        isError: true,
        error: new ApiError({ kind: 'server', status: 503, userMessage: 'Provider unavailable' }),
        refetch,
      }),
    );

    const { useLocalSearchParams } = jest.requireMock('expo-router');
    useLocalSearchParams.mockReturnValue({ minRating: '8' });

    render(<AdvancedDiscoverScreen />);

    expect(screen.getByText('Provider unavailable')).toBeTruthy();
    fireEvent.press(screen.getByText('Try Again'));
    expect(refetch).toHaveBeenCalled();
  });

  it('navigates to movie detail on result press', () => {
    render(<AdvancedDiscoverScreen />);
    fireEvent.press(screen.getByText('Show Results'));
    fireEvent.press(screen.getByText('Inception'));

    expect(mockOpenCatalogDetail).toHaveBeenCalledWith(
      expect.anything(),
      'movie-1',
      'movie',
      'discover',
      expect.objectContaining({ libraryReturnHref: expect.stringContaining('/advanced-discover') }),
    );
  });

  it('navigates to tv detail when tv results are shown', () => {
    (useAdvancedDiscover as jest.Mock).mockReturnValue(
      createDiscoverQueryMock({
        data: {
          pages: [
            {
              items: [tvResult],
              page: 1,
              pageSize: 20,
              totalCount: 1,
              totalPages: 1,
              hasNextPage: false,
              hasPreviousPage: false,
            },
          ],
        },
      }),
    );

    render(<AdvancedDiscoverScreen />);
    fireEvent.press(screen.getByText('Show Results'));
    fireEvent.press(screen.getByText('Breaking Bad'));
    expect(mockOpenCatalogDetail).toHaveBeenCalledWith(
      expect.anything(),
      'tv-1',
      'tv',
      'discover',
      expect.objectContaining({ libraryReturnHref: expect.stringContaining('/advanced-discover') }),
    );
  });
});
