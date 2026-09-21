import { useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { translateAdvancedDiscoverMediaType } from '@/i18n/catalog-labels';
import { useQueryClient } from '@tanstack/react-query';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PlatformRefreshFlatList } from '@/components/refresh/PlatformRefreshFlatList';
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
import { spacing } from '@/theme/spacing';
import { layout } from '@/theme/layout';
import { commonStyles } from '@/theme/theme';

export default function StreamingDiscoverScreen() {
  const { t } = useTranslation();
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

  const hasSelectedProviders = discoverState.watchProviderIds.length > 0;
  const resultsData = hasSelectedProviders ? items : [];

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

  const providerHeader = useMemo(
    () => (
      <View testID="streaming-discover-provider-header">
        <SafeAreaView edges={['top']} style={styles.headerSafeArea}>
          <DetailBackButton contentInset={false} />
          <View style={styles.headerContent}>
            <AppText variant="title" accessibilityRole="header">
              {t('discovery.streamingDiscover.title')}
            </AppText>

            <View style={styles.section}>
              <AppText variant="bodySmall" muted style={styles.sectionLabel}>
                {t('discovery.streamingDiscover.whereDoYouWatch')}
              </AppText>
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
              <AppText variant="bodySmall" muted style={styles.sectionLabel}>
                {t('discovery.streamingDiscover.contentSection')}
              </AppText>
              <View style={styles.mediaRow}>
                {ADVANCED_DISCOVER_MEDIA_OPTIONS.map((mediaType) => {
                  const selected = discoverState.mediaType === mediaType;
                  const label = translateAdvancedDiscoverMediaType(mediaType);

                  return (
                    <Pressable
                      key={mediaType}
                      accessibilityRole="button"
                      accessibilityState={{ selected }}
                      accessibilityLabel={label}
                      onPress={() =>
                        replaceState({
                          ...discoverState,
                          mediaType,
                          watchProviderIds: [],
                        })
                      }
                      style={[styles.mediaChip, selected && styles.mediaChipSelected]}
                    >
                      <AppText variant="bodySmall" style={selected ? styles.mediaChipSelectedText : undefined}>
                        {label}
                      </AppText>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <View style={styles.section}>
              <AppText variant="bodySmall" muted style={styles.sectionLabel}>
                {t('discovery.streamingDiscover.availabilitySection')}
              </AppText>
              <WatchMonetizationSelector
                selectedTypes={discoverState.watchMonetizationTypes}
                onToggle={toggleMonetization}
              />
            </View>

            <JustWatchAttribution />
          </View>
        </SafeAreaView>
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
      t,
    ],
  );

  const listEmptyComponent = useMemo(() => {
    if (!hasSelectedProviders) {
      return null;
    }

    if (resultsQuery.isLoading && items.length === 0) {
      return <SearchLoadingState />;
    }

    if (resultsQuery.isError && items.length === 0) {
      const message = isApiError(resultsQuery.error)
        ? resultsQuery.error.userMessage
        : t('discovery.streamingDiscover.resultsLoadError');

      return (
        <View style={styles.errorContainer}>
          <ErrorView message={message} onRetry={() => void resultsQuery.refetch()} retryLabel={t('common.tryAgain')} />
        </View>
      );
    }

    if (items.length === 0) {
      return (
        <SearchEmptyState
          title={t('discovery.streamingDiscover.noMatchesTitle')}
          message={t('discovery.streamingDiscover.noMatchesMessage')}
        />
      );
    }

    return null;
  }, [hasSelectedProviders, items.length, resultsQuery, t]);

  const listFooter = resultsQuery.isFetchingNextPage ? (
    <View style={styles.footerLoading}>
      <ActivityIndicator color={colors.accent} />
    </View>
  ) : null;

  const renderItem = useCallback(
    ({ item }: { item: SearchResultItem }) => (
      <SearchResultCard item={item} onPress={handleResultPress} />
    ),
    [handleResultPress],
  );

  const handleLoadMore = useCallback(() => {
    if (resultsQuery.hasNextPage && !resultsQuery.isFetchingNextPage) {
      void resultsQuery.fetchNextPage();
    }
  }, [resultsQuery]);

  if (!hasSelectedProviders) {
    return (
      <View style={commonStyles.screen} testID="streaming-discover-screen">
        {providerHeader}
      </View>
    );
  }

  return (
    <View style={commonStyles.screen} testID="streaming-discover-screen">
      <PlatformRefreshFlatList
        testID="streaming-discover-list"
        refreshing={resultsQuery.isRefetching && !resultsQuery.isFetchingNextPage}
        onRefresh={() => void resultsQuery.refetch()}
        data={resultsData}
        keyExtractor={searchResultKeyExtractor}
        renderItem={renderItem}
        ListHeaderComponent={providerHeader}
        ListEmptyComponent={listEmptyComponent}
        ListFooterComponent={listFooter}
        contentContainerStyle={resultsData.length === 0 ? styles.emptyListContent : styles.listContent}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.4}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        initialNumToRender={layout.verticalList.initialNumToRender}
        maxToRenderPerBatch={layout.verticalList.maxToRenderPerBatch}
        windowSize={layout.verticalList.windowSize}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  headerSafeArea: {
    backgroundColor: colors.background,
  },
  headerContent: {
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  section: {
    gap: spacing.xs,
  },
  sectionLabel: {
    fontWeight: '600',
  },
  mediaRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  mediaChip: {
    minHeight: 44,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    justifyContent: 'center',
  },
  mediaChipSelected: {
    borderColor: colors.accent,
    backgroundColor: colors.accentTint12,
  },
  mediaChipSelectedText: {
    color: colors.accent,
    fontWeight: '600',
  },
  listContent: {
    paddingBottom: spacing.xxl,
  },
  emptyListContent: {
    flexGrow: 1,
    paddingBottom: spacing.xxl,
  },
  errorContainer: {
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  footerLoading: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
});
