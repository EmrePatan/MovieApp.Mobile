import { useCallback, useEffect, useMemo } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StreamingPlatformScreen } from '@/features/discovery/components/StreamingPlatformScreen';
import { useDiscoveryWatchProviders } from '@/features/discovery/hooks/useDiscoveryWatchProviders';
import { PRODUCT_METRICS } from '@/features/metrics/product-metric-types';
import { useTrackProductMetricOnFocus } from '@/features/metrics/use-track-product-metric-on-focus';
import { useRegionalPreference } from '@/features/regions/hooks/useRegionalPreference';
import {
  parseStreamingDiscoverParams,
  serializeStreamingDiscoverParams,
} from '@/features/discovery/utils/streaming-discover-params';
import type { StreamingDiscoverState } from '@/features/discovery/streaming-discover-types';
import {
  setDiscoveryRouteParams,
  STREAMING_DISCOVER_PARAM_KEYS,
} from '@/features/navigation/discovery-route-params';
import { reconcileWatchProviderSelection } from '@/features/discovery/watch-provider-types';

export default function StreamingDiscoverScreen() {
  const router = useRouter();
  const rawParams = useLocalSearchParams();
  const { region: userRegion, isHydrated } = useRegionalPreference();
  useTrackProductMetricOnFocus(PRODUCT_METRICS.streamingServicesOpened, isHydrated);

  const discoverState = useMemo(
    () => parseStreamingDiscoverParams(rawParams, userRegion),
    [rawParams, userRegion],
  );

  const providersQuery = useDiscoveryWatchProviders(
    discoverState.mediaType,
    discoverState.watchRegion,
    isHydrated,
  );

  useEffect(() => {
    if (!providersQuery.data?.providers || discoverState.watchProviderIds.length === 0) {
      return;
    }

    const reconciled = reconcileWatchProviderSelection(
      discoverState.watchProviderIds,
      providersQuery.data.providers,
    );

    if (reconciled.length !== discoverState.watchProviderIds.length) {
      setDiscoveryRouteParams(
        router,
        serializeStreamingDiscoverParams({
          ...discoverState,
          watchProviderIds: reconciled,
        }),
        STREAMING_DISCOVER_PARAM_KEYS,
      );
    }
  }, [discoverState, providersQuery.data?.providers, router]);

  const replaceState = useCallback(
    (next: StreamingDiscoverState) => {
      setDiscoveryRouteParams(
        router,
        serializeStreamingDiscoverParams(next),
        STREAMING_DISCOVER_PARAM_KEYS,
      );
    },
    [router],
  );

  return (
    <StreamingPlatformScreen
      discoverState={discoverState}
      onReplaceState={replaceState}
      isRegionHydrated={isHydrated}
    />
  );
}
