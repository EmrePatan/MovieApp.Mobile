import { useEffect, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/auth/useAuth';
import { getLibraryActionStatus } from '../api/library-actions-api';
import type { LibraryActionMediaType } from '../types';
import { libraryActionStatusQueryKey } from './library-actions-query-keys';
import { seedDetailActionCachesFromLibraryActions } from '../utils/seed-detail-action-caches';

const LIBRARY_ACTIONS_STALE_TIME_MS = 30_000;

export interface CatalogDetailLibraryActionsState {
  batchPending: boolean;
  batchFailed: boolean;
  batchHydrated: boolean;
  /** When true, detail action buttons should defer their per-resource status queries. */
  deferIndividualStatusQueries: boolean;
}

export function useCatalogDetailLibraryActions(
  mediaType: LibraryActionMediaType,
  contentId: string,
): CatalogDetailLibraryActionsState {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();
  const fetchStartedAtRef = useRef(0);

  const query = useQuery({
    queryKey: libraryActionStatusQueryKey(mediaType, contentId),
    queryFn: async ({ signal }) => {
      fetchStartedAtRef.current = Date.now();
      return getLibraryActionStatus(mediaType, contentId, signal);
    },
    enabled: isAuthenticated && contentId.length > 0,
    staleTime: LIBRARY_ACTIONS_STALE_TIME_MS,
    retry: 1,
  });

  useEffect(() => {
    if (!query.data) {
      return;
    }

    seedDetailActionCachesFromLibraryActions(
      queryClient,
      mediaType,
      contentId,
      query.data,
      fetchStartedAtRef.current,
    );
  }, [query.data, queryClient, mediaType, contentId]);

  const batchPending = isAuthenticated && query.isPending;
  const batchFailed = isAuthenticated && query.isError;
  const batchHydrated = isAuthenticated && query.isSuccess;

  return {
    batchPending,
    batchFailed,
    batchHydrated,
    deferIndividualStatusQueries: batchPending,
  };
}
