import {
  fetchProviderPreviewsBatchChunked,
  isTransientBatchItemStatus,
  mergeGenreCoverBatchResponses,
  mergeProviderPreviewBatchResponses,
  PROVIDER_PREVIEWS_BATCH_CHUNK_SIZE,
} from '@/features/discovery/discovery-batch-client';
import { postProviderPreviewsBatch } from '@/features/discovery/api/discovery-api';

jest.mock('@/features/discovery/api/discovery-api', () => ({
  postProviderPreviewsBatch: jest.fn(),
  postGenreCoverCandidatesBatch: jest.fn(),
}));

const mockedPostProviderPreviewsBatch = jest.mocked(postProviderPreviewsBatch);

describe('discovery batch client', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('merges retry successes over transient failures', () => {
    const merged = mergeGenreCoverBatchResponses([
      {
        items: [
          { genreId: 'g-action', status: 'transient_error', candidates: [] },
          { genreId: 'g-drama', status: 'ok', candidates: [] },
        ],
      },
      {
        items: [
          {
            genreId: 'g-action',
            status: 'ok',
            candidates: [
              {
                id: 'movie-1',
                type: 'movie',
                title: 'Recovered',
                originalTitle: 'Recovered',
                overview: '',
                posterUrl: '/ok.jpg',
                backdropUrl: null,
                releaseDate: null,
                voteAverage: 0,
                voteCount: 0,
                year: 2020,
              },
            ],
          },
        ],
      },
    ]);

    expect(merged.items.find((item) => item.genreId === 'g-action')?.status).toBe('ok');
    expect(isTransientBatchItemStatus(merged.items[0].status)).toBe(false);
  });

  it('chunks provider preview requests above the backend limit', async () => {
    const providerIds = Array.from({ length: PROVIDER_PREVIEWS_BATCH_CHUNK_SIZE + 5 }, (_, index) => index + 1);
    mockedPostProviderPreviewsBatch.mockImplementation(async (request) => ({
      items: request.providerIds.map((providerId) => ({
        providerId,
        status: 'ok' as const,
        items: [],
      })),
    }));

    const response = await fetchProviderPreviewsBatchChunked({
      providerIds,
      mediaType: 'movie',
      watchRegion: 'US',
      pageSize: 1,
    });

    expect(mockedPostProviderPreviewsBatch).toHaveBeenCalledTimes(2);
    expect(response.items).toHaveLength(providerIds.length);
    expect(response.items[0].providerId).toBe(1);
    expect(response.items.at(-1)?.providerId).toBe(providerIds.length);
  });

  it('preserves provider order when merging chunked responses', () => {
    const merged = mergeProviderPreviewBatchResponses([
      {
        items: [
          { providerId: 3, status: 'ok', items: [] },
          { providerId: 1, status: 'ok', items: [] },
        ],
      },
      {
        items: [{ providerId: 2, status: 'ok', items: [] }],
      },
    ]);

    expect(merged.items.map((item) => item.providerId)).toEqual([3, 1, 2]);
  });
});
