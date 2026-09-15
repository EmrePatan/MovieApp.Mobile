import { useQuery } from '@tanstack/react-query';
import { getDiscoveryWatchProviders } from '../api/discovery-api';
import type { AdvancedDiscoverMediaType } from '../advanced-discover-types';
import { discoveryWatchProvidersQueryKey } from './discovery-query-keys';

export function useDiscoveryWatchProviders(
  mediaType: AdvancedDiscoverMediaType,
  watchRegion: string,
) {
  return useQuery({
    queryKey: discoveryWatchProvidersQueryKey(mediaType, watchRegion),
    queryFn: ({ signal }) => getDiscoveryWatchProviders(mediaType, watchRegion, signal),
    staleTime: 300_000,
  });
}
