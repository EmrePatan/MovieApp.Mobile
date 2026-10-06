import {
  postGenreCoverCandidatesBatch,
  postProviderPreviewsBatch,
} from '@/features/discovery/api/discovery-api';
import type {
  GenreCoverCandidatesBatchRequest,
  GenreCoverCandidatesBatchResponse,
  ProviderPreviewsBatchRequest,
  ProviderPreviewsBatchResponse,
} from '@/features/discovery/discovery-batch-types';

/** Matches backend `DiscoveryBatchOrchestration.MaxProviderPreviewBatchSize`. */
export const PROVIDER_PREVIEWS_BATCH_CHUNK_SIZE = 64;

export const GENRE_COVER_BATCH_TRANSIENT_RETRY_COUNT = 2;
export const GENRE_COVER_BATCH_TRANSIENT_RETRY_DELAY_MS = 750;
export const PROVIDER_PREVIEW_BATCH_TRANSIENT_RETRY_COUNT = 2;
export const PROVIDER_PREVIEW_BATCH_TRANSIENT_RETRY_DELAY_MS = 750;

export function isTransientBatchItemStatus(status: string | undefined): boolean {
  return status === 'transient_error';
}

export function mergeGenreCoverBatchResponses(
  responses: readonly GenreCoverCandidatesBatchResponse[],
): GenreCoverCandidatesBatchResponse {
  const merged = new Map<string, GenreCoverCandidatesBatchResponse['items'][number]>();

  for (const response of responses) {
    for (const item of response.items) {
      const existing = merged.get(item.genreId);
      if (!existing || isTransientBatchItemStatus(existing.status)) {
        merged.set(item.genreId, item);
      }
    }
  }

  return { items: [...merged.values()] };
}

export function mergeProviderPreviewBatchResponses(
  responses: readonly ProviderPreviewsBatchResponse[],
): ProviderPreviewsBatchResponse {
  const merged = new Map<number, ProviderPreviewsBatchResponse['items'][number]>();

  for (const response of responses) {
    for (const item of response.items) {
      const existing = merged.get(item.providerId);
      if (!existing || isTransientBatchItemStatus(existing.status)) {
        merged.set(item.providerId, item);
      }
    }
  }

  return { items: [...merged.values()] };
}

export async function fetchGenreCoverCandidatesBatch(
  request: GenreCoverCandidatesBatchRequest,
  signal?: AbortSignal,
): Promise<GenreCoverCandidatesBatchResponse> {
  return postGenreCoverCandidatesBatch(request, signal);
}

export async function fetchProviderPreviewsBatchChunked(
  request: ProviderPreviewsBatchRequest,
  signal?: AbortSignal,
): Promise<ProviderPreviewsBatchResponse> {
  const providerIds = request.providerIds;
  if (providerIds.length <= PROVIDER_PREVIEWS_BATCH_CHUNK_SIZE) {
    return postProviderPreviewsBatch(request, signal);
  }

  const chunkResponses: ProviderPreviewsBatchResponse[] = [];
  for (let offset = 0; offset < providerIds.length; offset += PROVIDER_PREVIEWS_BATCH_CHUNK_SIZE) {
    const chunkIds = providerIds.slice(offset, offset + PROVIDER_PREVIEWS_BATCH_CHUNK_SIZE);
    chunkResponses.push(
      await postProviderPreviewsBatch(
        {
          ...request,
          providerIds: chunkIds,
        },
        signal,
      ),
    );
  }

  const merged = mergeProviderPreviewBatchResponses(chunkResponses);
  const order = new Map(providerIds.map((id, index) => [id, index]));
  merged.items.sort(
    (left, right) => (order.get(left.providerId) ?? 0) - (order.get(right.providerId) ?? 0),
  );

  return merged;
}
