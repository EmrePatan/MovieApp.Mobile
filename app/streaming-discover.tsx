import { useCallback, useEffect, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { isApiError } from '@/api/errors';
import { AppText } from '@/components/common/AppText';
import { ErrorView } from '@/components/common/ErrorView';
import { DetailBackButton } from '@/features/details/shared/components/DetailScreenScaffold';
import { openCatalogDetailFromLibraryStack } from '@/features/details/shared/navigation/catalog-detail-navigation';
import { prefetchCatalogDetail } from '@/features/details/shared/navigation/prefetch-catalog-detail';
import { ADVANCED_DISCOVER_MEDIA_OPTIONS } from '@/features/discovery/advanced-discover-types';
import { JustWatchAttribution } from '@/features/discovery/components/JustWatchAttribution';
import { WatchMonetizationSelector } from '@/features/discovery/components/WatchMonetizationSelector';
import { WatchProviderSelector } from '@/features/discovery/components/WatchProviderSelector';
import { useDiscoveryWatchProviders } from '@/features/discovery/hooks/useDiscoveryWatchProviders';
import { useStreamingDiscover } from '@/features/discovery/hooks/useStreamingDiscover';
import {
  parseStreamingDiscoverParams,
  serializeStreamingDiscoverParams,
  serializeStreamingDiscoverRoute,
} from '@/features/discovery/utils/streaming-discover-params';
import {
  setDiscoveryRouteParams,
  STREAMING_DISCOVER_PARAM_KEYS,
} from '@/features/navigation/discovery-route-params';
import { reconcileWatchProviderSelection } from '@/features/discovery/watch-provider-types';
import type { StreamingDiscoverState } from '@/features/discovery/streaming-discover-types';
import { PRODUCT_METRICS } from '@/features/metrics/product-metric-types';
import { useTrackProductMetricOnFocus } from '@/features/metrics/use-track-product-metric-on-focus';
import { useRegionalPreference } from '@/features/regions/hooks/useRegionalPreference';
import { SearchEmptyState } from '@/features/search/components/SearchEmptyState';
import { SearchLoadingState } from '@/features/search/components/SearchLoadingState';
import { SearchResultCard } from '@/features/search/components/SearchResultCard';
import { searchResultKeyExtractor } from '@/features/search/utils/search-list-keys';
import type { SearchResultItem } from '@/features/search/types';
import { colors } from '@/theme/colors';
import { layout } from '@/theme/layout';
import { spacing } from '@/theme/spacing';

export default function StreamingDiscoverScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
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

  const resultsQuery = useStreamingDiscover(discoverState, undefined, isHydrated);

  const items = useMemo(
    () => resultsQuery.data?.pages.flatMap((page) => page.items) ?? [],
    [resultsQuery.data?.pages],
  );

  const currentRoute = useMemo(
    () => serializeStreamingDiscoverRoute(discoverState),
    [discoverState],
  );

  useEffect(() => {
    if (!providersQuery.data?.providers) {
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

  const toggleProvider = useCallback(
    (providerId: number) => {
      const nextProviderIds = discoverState.watchProviderIds.includes(providerId)
        ? discoverState.watchProviderIds.filter((id) => id !== providerId)
        : [...discoverState.watchProviderIds, providerId];

      replaceState({
        ...discoverState,
        watchProviderIds: nextProviderIds,
      });
    },
    [discoverState, replaceState],
  );

  const toggleMonetization = useCallback(
    (type: StreamingDiscoverState['watchMonetizationTypes'][number]) => {
      const nextTypes = discoverState.watchMonetizationTypes.includes(type)
        ? discoverState.watchMonetizationTypes.filter((entry) => entry !== type)
        : [...discoverState.watchMonetizationTypes, type];

      replaceState({
        ...discoverState,
        watchMonetizationTypes: nextTypes,
      });
    },
    [discoverState, replaceState],
  );

  const handleResultPress = useCallback(
    (item: SearchResultItem) => {
      if (item.type === 'person') {
        return;
      }

      prefetchCatalogDetail(queryClient, item.id, item.type);
      openCatalogDetailFromLibraryStack(router, item.id, item.type, 'discover', {
        libraryReturnHref: currentRoute,
        watchRegion: discoverState.watchRegion,
      });
    },
    [currentRoute, discoverState.watchRegion, queryClient, router],
  );

  const listHeader = useMemo(
    () => (
      <View style={styles.headerContent}>
        <AppText variant="title" accessibilityRole="header">
          Streaming Services
        </AppText>

        <View style={styles.section}>
          <AppText variant="subtitle">Where do you watch?</AppText>
          <WatchProviderSelector
            providers={providersQuery.data?.providers ?? []}
            selectedProviderIds={discoverState.watchProviderIds}
            isLoading={providersQuery.isLoading}
            isError={providersQuery.isError}
            onRetry={() => void providersQuery.refetch()}
            onToggle={toggleProvider}
          />
        </View>

        <View style={styles.section}>
          <AppText variant="bodySmall" muted>Content</AppText>
          <View style={styles.mediaRow}>
            {ADVANCED_DISCOVER_MEDIA_OPTIONS.map((option) => {
              const selected = discoverState.mediaType === option.value;

              return (
                <Pressable
                  key={option.value}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  accessibilityLabel={option.label}
                  onPress={() =>
                    replaceState({
                      ...discoverState,
                      mediaType: option.value,
                      watchProviderIds: [],
                    })
                  }
                  style={[styles.mediaChip, selected && styles.mediaChipSelected]}
                >
                  <AppText variant="bodySmall" style={selected ? styles.mediaChipSelectedText : undefined}>
                    {option.label}
                  </AppText>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <AppText variant="bodySmall" muted>Availability</AppText>
          <WatchMonetizationSelector
            selectedTypes={discoverState.watchMonetizationTypes}
            onToggle={toggleMonetization}
          />
        </View>

        <JustWatchAttribution />
      </View>
    ),
    [
      discoverState,
      providersQuery.data?.providers,
      providersQuery.isError,
      providersQuery.isLoading,
      replaceState,
      toggleMonetization,
      toggleProvider,
    ],
  );

  const listEmpty = useMemo(() => {
    if (discoverState.watchProviderIds.length === 0) {
      return (
        <SearchEmptyState
          title="Choose a streaming service"
          message="Select one or more providers to see what you can watch."
        />
      );
    }

    if (resultsQuery.isLoading) {
      return <SearchLoadingState />;
    }

    if (resultsQuery.isError) {
      const message = isApiError(resultsQuery.error)
        ? resultsQuery.error.userMessage
        : 'Unable to load streaming results right now.';

      return (
        <View style={styles.errorContainer}>
          <ErrorView message={message} onRetry={() => void resultsQuery.refetch()} retryLabel="Try Again" />
        </View>
      );
    }

    if (items.length === 0) {
      return (
        <SearchEmptyState
          title="No matches found"
          message="Try another provider or availability type."
        />
      );
    }

    return null;
  }, [
    discoverState.watchProviderIds.length,
    items.length,
    resultsQuery,
  ]);

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <View style={styles.topBar}>
        <DetailBackButton />
      </View>
      <FlatList
        data={discoverState.watchProviderIds.length > 0 ? items : []}
        keyExtractor={searchResultKeyExtractor}
        renderItem={({ item }) => (
          <SearchResultCard item={item} onPress={handleResultPress} />
        )}
        ListHeaderComponent={listHeader}
        ListEmptyComponent={listEmpty}
        ListFooterComponent={
          resultsQuery.isFetchingNextPage ? (
            <View style={styles.footerLoading}>
              <ActivityIndicator color={colors.accent} />
            </View>
          ) : null
        }
        refreshControl={
          <RefreshControl
            refreshing={resultsQuery.isRefetching && !resultsQuery.isFetchingNextPage}
            onRefresh={() => void resultsQuery.refetch()}
            tintColor={colors.accent}
          />
        }
        contentContainerStyle={styles.listContent}
        onEndReached={() => {
          if (resultsQuery.hasNextPage && !resultsQuery.isFetchingNextPage) {
            void resultsQuery.fetchNextPage();
          }
        }}
        onEndReachedThreshold={0.4}
        initialNumToRender={layout.verticalList.initialNumToRender}
        maxToRenderPerBatch={layout.verticalList.maxToRenderPerBatch}
        windowSize={layout.verticalList.windowSize}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topBar: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xs,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
    flexGrow: 1,
  },
  headerContent: {
    gap: spacing.lg,
    paddingBottom: spacing.lg,
  },
  section: {
    gap: spacing.sm,
  },
  mediaRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  mediaChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  mediaChipSelected: {
    borderColor: colors.borderAccent,
    backgroundColor: colors.accentTint12,
  },
  mediaChipSelectedText: {
    color: colors.accent,
    fontWeight: '600',
  },
  errorContainer: {
    paddingVertical: spacing.xl,
  },
  footerLoading: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
});
