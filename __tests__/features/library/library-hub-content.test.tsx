import { fireEvent, render, screen } from '@testing-library/react-native';
import { LibraryHubContent } from '@/features/library/components/LibraryHubContent';
import { trackProductMetric } from '@/features/metrics/track-product-metric';

const mockPush = jest.fn();
const mockOpenCatalogDetailFromTab = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush }),
}));

jest.mock('@tanstack/react-query', () => ({
  useQueryClient: jest.fn(() => ({})),
}));

jest.mock('@/auth/useAuth', () => ({
  useAuth: jest.fn(() => ({ isAuthenticated: true })),
}));

jest.mock('@/features/details/shared/navigation/open-catalog-detail-from-tab', () => ({
  openCatalogDetailFromTab: (...args: unknown[]) => mockOpenCatalogDetailFromTab(...args),
}));

jest.mock('@/features/metrics/track-product-metric', () => ({
  trackProductMetric: jest.fn(),
}));

const mockRefetch = jest.fn();
const mockFetchNextPage = jest.fn();

jest.mock('@/features/library/hooks/useLibrary', () => ({
  useLibrary: jest.fn(() => ({
    data: {
      pages: [
        {
          items: [
            {
              id: 'tv-1',
              type: 'tv',
              title: 'In Progress Show',
              originalTitle: null,
              posterUrl: '/poster.jpg',
              backdropUrl: null,
              year: 2020,
              voteAverage: 8.2,
              addedAt: null,
              watchedAt: null,
              lastActivityAt: '2026-01-01T00:00:00Z',
              progressPercentage: 40,
              nextEpisode: {
                episodeId: 'ep-2',
                seasonNumber: 2,
                episodeNumber: 4,
                title: 'Episode Four',
              },
              collectionStatus: 'watching',
            },
          ],
          page: 1,
          pageSize: 24,
          totalCount: 1,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      ],
    },
    isLoading: false,
    isError: false,
    isRefetching: false,
    isFetching: false,
    isFetchingNextPage: false,
    isFetchNextPageError: false,
    hasNextPage: false,
    refetch: mockRefetch,
    fetchNextPage: mockFetchNextPage,
  })),
}));

const { useLibrary } = jest.requireMock('@/features/library/hooks/useLibrary') as {
  useLibrary: jest.Mock;
};

describe('LibraryHubContent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useLibrary.mockImplementation(() => ({
      data: {
        pages: [
          {
            items: [
              {
                id: 'tv-1',
                type: 'tv',
                title: 'In Progress Show',
                originalTitle: null,
                posterUrl: '/poster.jpg',
                backdropUrl: null,
                year: 2020,
                voteAverage: 8.2,
                addedAt: null,
                watchedAt: null,
                lastActivityAt: '2026-01-01T00:00:00Z',
                progressPercentage: 40,
                nextEpisode: {
                  episodeId: 'ep-2',
                  seasonNumber: 2,
                  episodeNumber: 4,
                  title: 'Episode Four',
                },
                collectionStatus: 'watching',
              },
            ],
            page: 1,
            pageSize: 24,
            totalCount: 1,
            totalPages: 1,
            hasNextPage: false,
            hasPreviousPage: false,
          },
        ],
      },
      isLoading: false,
      isError: false,
      isRefetching: false,
      isFetching: false,
      isFetchingNextPage: false,
      isFetchNextPageError: false,
      hasNextPage: false,
      refetch: mockRefetch,
      fetchNextPage: mockFetchNextPage,
    }));
  });

  it('defaults to Watching category and renders the grid item', () => {
    render(<LibraryHubContent />);

    expect(screen.getByText('My Library')).toBeTruthy();
    expect(screen.getByLabelText('Watching category')).toBeTruthy();
    expect(
      screen.getByLabelText('In Progress Show, S2 · E4 · Episode Four, 40% watched'),
    ).toBeTruthy();
    expect(screen.getByText('S2 · E4 · Episode Four')).toBeTruthy();
    expect(screen.getAllByText('Watching')).toHaveLength(1);
    expect(useLibrary).toHaveBeenCalledWith('watching', 'all');
  });

  it('tracks filter metric when category changes', () => {
    render(<LibraryHubContent />);

    fireEvent.press(screen.getByLabelText('Liked category'));

    expect(trackProductMetric).toHaveBeenCalledWith('library_filter_selected');
    expect(useLibrary).toHaveBeenLastCalledWith('liked', 'all');
  });

  it('tracks filter metric when media type changes', () => {
    render(<LibraryHubContent />);

    fireEvent.press(screen.getByLabelText('Filter Movies'));

    expect(trackProductMetric).toHaveBeenCalledWith('library_filter_selected');
    expect(useLibrary).toHaveBeenLastCalledWith('watching', 'movie');
  });

  it('navigates to catalog detail from grid item', () => {
    render(<LibraryHubContent />);

    fireEvent.press(
      screen.getByLabelText('In Progress Show, S2 · E4 · Episode Four, 40% watched'),
    );

    expect(mockOpenCatalogDetailFromTab).toHaveBeenCalledWith(
      expect.anything(),
      'tv-1',
      'tv',
      'library',
      expect.objectContaining({ queryClient: expect.anything() }),
    );
  });

  it('shows category empty state with Browse Discover CTA', () => {
    useLibrary.mockImplementation(() => ({
      data: { pages: [{ items: [], page: 1, pageSize: 24, totalCount: 0, totalPages: 0, hasNextPage: false, hasPreviousPage: false }] },
      isLoading: false,
      isError: false,
      isRefetching: false,
      isFetching: false,
      isFetchingNextPage: false,
      isFetchNextPageError: false,
      hasNextPage: false,
      refetch: mockRefetch,
      fetchNextPage: mockFetchNextPage,
    }));

    render(<LibraryHubContent />);

    expect(screen.getByText('Nothing in progress')).toBeTruthy();
    fireEvent.press(screen.getByText('Browse Discover'));
    expect(mockPush).toHaveBeenCalledWith('/(tabs)/discover');
  });
});
