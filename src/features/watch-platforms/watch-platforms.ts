import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/client';
import { useAuth } from '@/auth/useAuth';
import type { DiscoveryWatchProvider } from '@/features/discovery/watch-provider-types';

export interface WatchPlatforms {
  providerIds: number[];
}

const PATH = '/api/watch-platforms';
const QUERY_KEY = ['watch-platforms'] as const;

/** Server limit, equal to the discover filter limit. */
export const MAX_WATCH_PLATFORMS = 20;

/**
 * Platforms whose catalog data is nearly empty in a region (checked for TR on 2026-11-26:
 * Exxen, tabii, puhutv, Tivibu, D-Smart Go). Picking one would only give empty results.
 */
const SPARSE_PROVIDER_IDS_BY_REGION: Record<string, readonly number[]> = {
  TR: [1791, 2235, 342, 1833, 1905],
};

/**
 * Well-known services listed first, in this order: Netflix, Prime Video, Disney+, HBO Max,
 * Apple TV+, TV+, TOD, MUBI, Crunchyroll. Catalog priority puts niche services above some.
 */
const LEADING_PROVIDER_IDS: readonly number[] = [8, 119, 337, 1899, 350, 1904, 1826, 11, 283];

function leadingRank(providerId: number): number {
  const index = LEADING_PROVIDER_IDS.indexOf(providerId);
  return index === -1 ? LEADING_PROVIDER_IDS.length : index;
}

/** Movie and TV catalogs merged for the picker. A saved platform is never hidden. */
export function buildPlatformOptions(
  catalogs: DiscoveryWatchProvider[][],
  region: string,
  selectedIds: number[],
): DiscoveryWatchProvider[] {
  const sparse = SPARSE_PROVIDER_IDS_BY_REGION[region] ?? [];
  const byId = new Map<number, DiscoveryWatchProvider>();

  for (const provider of catalogs.flat()) {
    const hidden =
      sparse.includes(provider.providerId) && !selectedIds.includes(provider.providerId);
    if (!hidden && !byId.has(provider.providerId)) {
      byId.set(provider.providerId, provider);
    }
  }

  return [...byId.values()].sort(
    (left, right) =>
      leadingRank(left.providerId) - leadingRank(right.providerId) ||
      left.displayPriority - right.displayPriority ||
      left.name.localeCompare(right.name),
  );
}

export function useWatchPlatforms() {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: QUERY_KEY,
    enabled: isAuthenticated,
    queryFn: ({ signal }) => api.get<WatchPlatforms>(PATH, { signal }),
    staleTime: 30_000,
  });
}

/** Optimistic. Saves run one at a time so quick taps reach the server in order. */
export function useUpdateWatchPlatforms() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: QUERY_KEY,
    scope: { id: 'watch-platforms' },
    mutationFn: (next: WatchPlatforms) => api.put<WatchPlatforms>(PATH, next),
    onMutate: async (next) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEY });
      const previous = queryClient.getQueryData<WatchPlatforms>(QUERY_KEY);
      queryClient.setQueryData(QUERY_KEY, next);
      return { previous };
    },
    onError: (_error, _next, context) => {
      if (context?.previous) {
        queryClient.setQueryData(QUERY_KEY, context.previous);
      }
    },
    onSettled: () => {
      // A refetch while later saves are queued would bring back an older selection.
      if (queryClient.isMutating({ mutationKey: QUERY_KEY }) === 1) {
        void queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      }
    },
  });
}
