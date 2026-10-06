import { act, renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import {
  postGenreCoverCandidatesBatch,
  postProviderPreviewsBatch,
} from '@/features/discovery/api/discovery-api';
import { GENRE_COVER_CANDIDATE_PAGE_SIZE } from '@/features/discovery/genre-cover-selection';
import { useGenreCoverSlots } from '@/features/discovery/hooks/useGenreCoverSlots';
import { genreCoverCandidatesBatchQueryKey } from '@/features/discovery/hooks/discovery-query-keys';
import { useStreamingProviderPreviews } from '@/features/discovery/hooks/useStreamingProviderPreviews';
import type { Genre } from '@/features/discovery/types';

jest.mock('@/features/discovery/api/discovery-api', () => ({
  postGenreCoverCandidatesBatch: jest.fn(),
  postProviderPreviewsBatch: jest.fn(),
  getBrowseDiscovery: jest.fn(),
  getAdvancedDiscover: jest.fn(),
}));

const mockedPostGenreCoverCandidatesBatch = jest.mocked(postGenreCoverCandidatesBatch);
const mockedPostProviderPreviewsBatch = jest.mocked(postProviderPreviewsBatch);

function createWrapper(queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
})) {
  return {
    queryClient,
    Wrapper({ children }: { children: ReactNode }) {
      return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
    },
  };
}

const genreBatchPayload = {
  items: [
    {
      genreId: 'g-action',
      status: 'ok' as const,
      candidates: [
        {
          id: 'movie-1',
          type: 'movie' as const,
          title: 'Action 1',
          originalTitle: 'Action 1',
          overview: '',
          posterUrl: '/action-rank-1.jpg',
          backdropUrl: null,
          releaseDate: null,
          voteAverage: 0,
          voteCount: 0,
          year: 2020,
        },
        {
          id: 'movie-2',
          type: 'movie' as const,
          title: 'Action Cover',
          originalTitle: 'Action Cover',
          overview: '',
          posterUrl: '/action.jpg',
          backdropUrl: null,
          releaseDate: null,
          voteAverage: 0,
          voteCount: 0,
          year: 2020,
        },
      ],
    },
    {
      genreId: 'g-drama',
      status: 'ok' as const,
      candidates: [
        {
          id: 'movie-3',
          type: 'movie' as const,
          title: 'Drama 1',
          originalTitle: 'Drama 1',
          overview: '',
          posterUrl: '/drama-rank-1.jpg',
          backdropUrl: null,
          releaseDate: null,
          voteAverage: 0,
          voteCount: 0,
          year: 2020,
        },
        {
          id: 'movie-4',
          type: 'movie' as const,
          title: 'Drama Cover',
          originalTitle: 'Drama Cover',
          overview: '',
          posterUrl: '/drama.jpg',
          backdropUrl: null,
          releaseDate: null,
          voteAverage: 0,
          voteCount: 0,
          year: 2020,
        },
      ],
    },
  ],
};

describe('discover batch requests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('loads genre covers with one batch request for multiple genres', async () => {
    mockedPostGenreCoverCandidatesBatch.mockResolvedValue(genreBatchPayload);

    const genres: Genre[] = [
      { id: 'g-action', name: 'Action' },
      { id: 'g-drama', name: 'Drama' },
    ];

    const { Wrapper } = createWrapper();
    const { result } = renderHook(() => useGenreCoverSlots(genres), {
      wrapper: Wrapper,
    });

    await waitFor(() => {
      expect(mockedPostGenreCoverCandidatesBatch).toHaveBeenCalledTimes(1);
    });

    expect(mockedPostGenreCoverCandidatesBatch).toHaveBeenCalledWith(
      expect.objectContaining({
        genreIds: ['g-action', 'g-drama'],
        mediaType: 'all',
        candidateCount: 20,
      }),
      expect.any(AbortSignal),
    );

    await waitFor(() => {
      expect(result.current.get('g-action')).toMatchObject({
        status: 'poster',
        title: 'Action Cover',
      });
    });
    expect(result.current.get('g-drama')).toMatchObject({
      status: 'poster',
      title: 'Drama Cover',
    });
  });

  it('keeps genre posters visible while the primary batch refetches', async () => {
    const genres: Genre[] = [
      { id: 'g-action', name: 'Action' },
      { id: 'g-drama', name: 'Drama' },
    ];
    const batchQueryKey = genreCoverCandidatesBatchQueryKey(
      ['g-action', 'g-drama'],
      GENRE_COVER_CANDIDATE_PAGE_SIZE,
    );
    const { queryClient, Wrapper } = createWrapper();

    queryClient.setQueryData(batchQueryKey, genreBatchPayload);

    let releaseRefetch: (() => void) | undefined;
    mockedPostGenreCoverCandidatesBatch.mockImplementation(
      () =>
        new Promise((resolve) => {
          releaseRefetch = () => resolve(genreBatchPayload);
        }),
    );

    const { result } = renderHook(() => useGenreCoverSlots(genres), {
      wrapper: Wrapper,
    });

    expect(result.current.get('g-action')).toMatchObject({
      status: 'poster',
      title: 'Action Cover',
    });

    act(() => {
      void queryClient.refetchQueries({ queryKey: batchQueryKey });
    });

    await waitFor(() => {
      expect(mockedPostGenreCoverCandidatesBatch).toHaveBeenCalledTimes(1);
    });

    expect(result.current.get('g-action')).toMatchObject({
      status: 'poster',
      title: 'Action Cover',
    });
    expect(result.current.get('g-drama')).toMatchObject({
      status: 'poster',
      title: 'Drama Cover',
    });

    await act(async () => {
      releaseRefetch?.();
    });
  });

  it('loads streaming provider spotlights with one batch request', async () => {
    mockedPostProviderPreviewsBatch.mockResolvedValue({
      items: [
        {
          providerId: 8,
          status: 'ok',
          items: [
            {
              id: 'movie-8',
              type: 'movie',
              title: 'Netflix Hit',
              originalTitle: 'Netflix Hit',
              overview: '',
              posterUrl: '/netflix.jpg',
              backdropUrl: null,
              releaseDate: null,
              voteAverage: 0,
              voteCount: 0,
              year: 2020,
            },
          ],
        },
        {
          providerId: 119,
          status: 'ok',
          items: [],
        },
      ],
    });

    const { Wrapper } = createWrapper();
    const { result } = renderHook(
      () =>
        useStreamingProviderPreviews(
          [
            { providerId: 8, name: 'Netflix', logoPath: null, displayPriority: 0 },
            { providerId: 119, name: 'Prime', logoPath: null, displayPriority: 1 },
          ],
          'US',
        ),
      { wrapper: Wrapper },
    );

    await waitFor(() => {
      expect(mockedPostProviderPreviewsBatch).toHaveBeenCalledTimes(1);
    });

    expect(mockedPostProviderPreviewsBatch).toHaveBeenCalledWith(
      expect.objectContaining({
        providerIds: [8, 119],
        mediaType: 'movie',
        watchRegion: 'US',
        pageSize: 1,
      }),
      expect.any(AbortSignal),
    );

    await waitFor(() => {
      expect(result.current.getSpotlightPosterPath(8)).toBe('/netflix.jpg');
    });
    expect(result.current.getSpotlightPosterPath(119)).toBeNull();
  });

  it('marks only transient provider retries as loading', async () => {
    mockedPostProviderPreviewsBatch
      .mockResolvedValueOnce({
        items: [
          {
            providerId: 8,
            status: 'ok',
            items: [
              {
                id: 'movie-8',
                type: 'movie',
                title: 'Netflix Hit',
                originalTitle: 'Netflix Hit',
                overview: '',
                posterUrl: '/netflix.jpg',
                backdropUrl: null,
                releaseDate: null,
                voteAverage: 0,
                voteCount: 0,
                year: 2020,
              },
            ],
          },
          {
            providerId: 119,
            status: 'transient_error',
            items: [],
          },
        ],
      })
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            setTimeout(() => {
              resolve({
                items: [
                  {
                    providerId: 119,
                    status: 'ok',
                    items: [],
                  },
                ],
              });
            }, 100);
          }),
      );

    const { Wrapper } = createWrapper();
    const { result } = renderHook(
      () =>
        useStreamingProviderPreviews(
          [
            { providerId: 8, name: 'Netflix', logoPath: null, displayPriority: 0 },
            { providerId: 119, name: 'Prime', logoPath: null, displayPriority: 1 },
          ],
          'US',
        ),
      { wrapper: Wrapper },
    );

    await waitFor(() => {
      expect(mockedPostProviderPreviewsBatch).toHaveBeenCalledTimes(2);
    });

    expect(result.current.getSpotlightPosterPath(8)).toBe('/netflix.jpg');
    expect(result.current.isSpotlightLoading(8)).toBe(false);
    expect(result.current.isSpotlightLoading(119)).toBe(true);
  });
});
