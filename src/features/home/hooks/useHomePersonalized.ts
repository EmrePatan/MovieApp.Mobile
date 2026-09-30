import { useEffect, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/auth/useAuth';
import { useRegionalPreference } from '@/features/regions/hooks/useRegionalPreference';
import { getHomePersonalized } from '../api/home-api';
import {
  readHomePersonalizedCache,
  writeHomePersonalizedCache,
} from '../storage/home-personalized-cache';
import type { HomeTypeFilter } from '../types';
import { DEFAULT_HOME_SECTION_SIZE } from '../types';
import { HOME_QUERY_KEY_ROOT } from './home-query-keys';

export function homePersonalizedQueryKey(
  userId: string,
  type: HomeTypeFilter,
  sectionSize: number,
  releaseRegion: string,
) {
  return [...HOME_QUERY_KEY_ROOT, 'personalized', userId, type, sectionSize, releaseRegion] as const;
}

export interface UseHomePersonalizedOptions {
  /** When false, in-flight personalized requests are aborted (e.g. user left Home). */
  screenActive?: boolean;
}

export function useHomePersonalized(
  type: HomeTypeFilter,
  sectionSize = DEFAULT_HOME_SECTION_SIZE,
  options?: UseHomePersonalizedOptions,
) {
  const queryClient = useQueryClient();
  const { isAuthenticated, isSessionRestored, user } = useAuth();
  const { region, isHydrated } = useRegionalPreference();
  const screenActive = options?.screenActive ?? true;
  const userId = user?.id;
  const queryEnabled =
    screenActive && isSessionRestored && isAuthenticated && isHydrated && Boolean(userId);

  const queryKey = useMemo(
    () =>
      userId != null
        ? homePersonalizedQueryKey(userId, type, sectionSize, region)
        : ([...HOME_QUERY_KEY_ROOT, 'personalized', 'pending'] as const),
    [region, sectionSize, type, userId],
  );

  useEffect(() => {
    if (!queryEnabled || userId == null) {
      return;
    }

    let cancelled = false;

    void readHomePersonalizedCache(userId, type, sectionSize, region).then((cached) => {
      if (cancelled || cached == null) {
        return;
      }

      const existing = queryClient.getQueryData(queryKey);
      if (existing === undefined) {
        queryClient.setQueryData(queryKey, cached);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [queryClient, queryEnabled, queryKey, region, sectionSize, type, userId]);

  return useQuery({
    queryKey,
    queryFn: async ({ signal }) => {
      const response = await getHomePersonalized(
        { type, sectionSize, releaseRegion: region },
        signal,
      );

      if (userId != null) {
        void writeHomePersonalizedCache(userId, type, sectionSize, region, response);
      }

      return response;
    },
    staleTime: 60_000,
    refetchOnMount: 'always',
    enabled: queryEnabled,
  });
}
