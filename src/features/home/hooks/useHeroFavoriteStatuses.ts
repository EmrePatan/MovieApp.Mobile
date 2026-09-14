import { useEffect, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/auth/useAuth';
import { getBatchFavoriteStatus } from '@/features/favorites/api/favorites-api';
import { favoriteStatusQueryKey } from '@/features/favorites/hooks/favorite-query-keys';
import type { FavoriteContentType } from '@/features/favorites/types';
import type { HomeItem } from '../types';
import { createHomeContentKey } from '../utils/selectHeroCandidates';

export interface HeroFavoriteStatusState {
  isFavorited: boolean;
  resolved: boolean;
}

export interface HeroFavoriteStatusesResult {
  statuses: Record<string, HeroFavoriteStatusState>;
  isLoading: boolean;
}

function toFavoriteContentType(contentType: HomeItem['contentType']): FavoriteContentType {
  return contentType;
}

export function heroFavoriteStatusesQueryKey(items: HomeItem[]) {
  return [
    'favorites',
    'hero-batch',
    items.map((item) => createHomeContentKey(item)).join('|'),
  ] as const;
}

export function useHeroFavoriteStatuses(items: HomeItem[]): HeroFavoriteStatusesResult {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const queryKey = heroFavoriteStatusesQueryKey(items);

  const { data, isLoading } = useQuery({
    queryKey,
    queryFn: async ({ signal }) => {
      if (items.length === 0) {
        return {} as Record<string, boolean>;
      }

      const response = await getBatchFavoriteStatus(
        items.map((item) => ({
          contentType: toFavoriteContentType(item.contentType),
          id: item.id,
        })),
        signal,
      );

      const statuses: Record<string, boolean> = {};
      for (const item of response.items) {
        const key = `${item.contentType}:${item.id}`;
        statuses[key] = item.isFavorited;
      }

      return statuses;
    },
    enabled: isAuthenticated && items.length > 0,
    staleTime: 30_000,
  });

  useEffect(() => {
    if (!data) {
      return;
    }

    for (const item of items) {
      const key = createHomeContentKey(item);
      const isFavorited = data[key] ?? false;
      queryClient.setQueryData(
        favoriteStatusQueryKey(toFavoriteContentType(item.contentType), item.id),
        isFavorited,
      );
    }
  }, [data, items, queryClient]);

  const statuses = useMemo(() => {
    const nextStatuses: Record<string, HeroFavoriteStatusState> = {};

    for (const item of items) {
      const key = createHomeContentKey(item);

      if (!isAuthenticated) {
        nextStatuses[key] = { isFavorited: false, resolved: true };
        continue;
      }

      if (data) {
        nextStatuses[key] = {
          isFavorited: data[key] ?? false,
          resolved: true,
        };
        continue;
      }

      nextStatuses[key] = {
        isFavorited: false,
        resolved: false,
      };
    }

    return nextStatuses;
  }, [data, isAuthenticated, items]);

  return {
    statuses,
    isLoading: isAuthenticated && isLoading,
  };
}
