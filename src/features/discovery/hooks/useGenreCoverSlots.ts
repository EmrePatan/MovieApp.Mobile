import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  fetchGenreCoverCandidatesBatch,
  GENRE_COVER_BATCH_TRANSIENT_RETRY_COUNT,
  GENRE_COVER_BATCH_TRANSIENT_RETRY_DELAY_MS,
  isTransientBatchItemStatus,
  mergeGenreCoverBatchResponses,
} from '@/features/discovery/discovery-batch-client';
import {
  GENRE_COVER_CANDIDATE_PAGE_SIZE,
  genreCoverCandidatesFromItems,
  resolveGenreCoverSlots,
  type GenreCoverSlot,
  type GenreCoverSource,
} from '@/features/discovery/genre-cover-selection';
import {
  genreCoverCandidatesBatchQueryKey,
  genreCoverCandidatesBatchRetryQueryKey,
} from '@/features/discovery/hooks/discovery-query-keys';
import type { Genre } from '@/features/discovery/types';

const GENRE_COVER_STALE_MS = 10 * 60 * 1000;

function normalizeOrderedGenreIds(genreIds: readonly string[]): string[] {
  const seen = new Set<string>();
  const ordered: string[] = [];

  for (const rawGenreId of genreIds) {
    const genreId = rawGenreId.trim();
    if (!genreId || seen.has(genreId)) {
      continue;
    }

    seen.add(genreId);
    ordered.push(genreId);
  }

  return ordered;
}

export function useGenreCoverSlots(genres: readonly Genre[]): Map<string, GenreCoverSlot> {
  const orderedGenreIds = useMemo(
    () => normalizeOrderedGenreIds(genres.map((genre) => genre.id)),
    [genres],
  );

  const batchRequest = useMemo(
    () => ({
      genreIds: orderedGenreIds,
      mediaType: 'all' as const,
      candidateCount: GENRE_COVER_CANDIDATE_PAGE_SIZE,
    }),
    [orderedGenreIds],
  );

  const primaryQuery = useQuery({
    queryKey: genreCoverCandidatesBatchQueryKey(
      orderedGenreIds,
      GENRE_COVER_CANDIDATE_PAGE_SIZE,
    ),
    enabled: orderedGenreIds.length > 0,
    staleTime: GENRE_COVER_STALE_MS,
    queryFn: ({ signal }) => fetchGenreCoverCandidatesBatch(batchRequest, signal),
  });

  const transientGenreIds = useMemo(() => {
    if (!primaryQuery.data) {
      return [];
    }

    return primaryQuery.data.items
      .filter((item) => isTransientBatchItemStatus(item.status))
      .map((item) => item.genreId);
  }, [primaryQuery.data]);

  const retryQuery = useQuery({
    queryKey: genreCoverCandidatesBatchRetryQueryKey(
      transientGenreIds,
      GENRE_COVER_CANDIDATE_PAGE_SIZE,
    ),
    enabled: primaryQuery.isSuccess && transientGenreIds.length > 0,
    staleTime: 0,
    gcTime: 60_000,
    retry: GENRE_COVER_BATCH_TRANSIENT_RETRY_COUNT,
    retryDelay: GENRE_COVER_BATCH_TRANSIENT_RETRY_DELAY_MS,
    queryFn: ({ signal }) =>
      fetchGenreCoverCandidatesBatch(
        {
          ...batchRequest,
          genreIds: transientGenreIds,
        },
        signal,
      ),
  });

  const mergedBatch = useMemo(() => {
    if (!primaryQuery.data) {
      return undefined;
    }

    if (!retryQuery.data) {
      return primaryQuery.data;
    }

    return mergeGenreCoverBatchResponses([primaryQuery.data, retryQuery.data]);
  }, [primaryQuery.data, retryQuery.data]);

  const sources = useMemo(() => {
    const itemByGenreId = new Map(
      (mergedBatch?.items ?? []).map((item) => [item.genreId, item]),
    );
    const map = new Map<string, GenreCoverSource>();
    const primaryInitialPending = primaryQuery.isLoading && primaryQuery.data === undefined;
    const retryPending =
      transientGenreIds.length > 0 && (retryQuery.isLoading || retryQuery.isFetching);

    for (const genre of genres) {
      const item = itemByGenreId.get(genre.id);
      const hasTransientStatus = isTransientBatchItemStatus(item?.status);
      const hasSettledOkItem = item != null && !hasTransientStatus;
      const retrySettled =
        transientGenreIds.includes(genre.id) &&
        !retryPending &&
        (retryQuery.isSuccess || retryQuery.isError);

      map.set(genre.id, {
        isLoading:
          (primaryInitialPending && !hasSettledOkItem) ||
          (hasTransientStatus && retryPending),
        transientError: hasTransientStatus && retrySettled,
        candidates:
          hasTransientStatus && !retrySettled
            ? []
            : genreCoverCandidatesFromItems(item?.candidates),
      });
    }

    return map;
  }, [
    genres,
    mergedBatch?.items,
    primaryQuery.data,
    primaryQuery.isLoading,
    retryQuery.isError,
    retryQuery.isFetching,
    retryQuery.isLoading,
    retryQuery.isSuccess,
    transientGenreIds,
  ]);

  return useMemo(() => resolveGenreCoverSlots(genres, sources), [genres, sources]);
}
