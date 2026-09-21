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
import { MovieAppRefreshControl } from '@/components/refresh/MovieAppRefreshControl';
import { CatalogScreenShell } from '@/components/layout/CatalogScreenShell';
import { useLocalSearchParams, useRouter, useSegments } from 'expo-router';
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
import { SearchMappedResultsScroll } from '@/features/search/components/SearchMappedResultsScroll';
import { searchResultKeyExtractor } from '@/features/search/utils/search-list-keys';
import type { SearchResultItem } from '@/features/search/types';
import {
  useNavigationDiagnostics,
  useScreenRenderTrace,
} from '@/debug/navigation-diagnostics';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

export default function StreamingDiscoverScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const queryClient = useQueryClient();
  const rawParams = useLocalSearchParams();
  const segments = useSegments();
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

  const providerCount = providersQuery.data?.providers?.length ?? 0;
  const hasSelectedProviders = discoverState.watchProviderIds.length > 0;
  const resultsData = hasSelectedProviders ? items : [];

  useNavigationDiagnostics('streaming-discover', {
    mediaType: discoverState.mediaType,
    watchRegion: discoverState.watchRegion,
    providerCount,
    selectedProviderCount: discoverState.watchProviderIds.length,
    itemCount: items.length,
    providersLoading: providersQuery.isLoading,
    providersError: providersQuery.isError,
    resultsLoading: resultsQuery.isLoading,
    resultsError: resultsQuery.isError,
    isHydrated,
  });

  useScreenRenderTrace('streaming-discover', {
    pathname: `/${segments.join('/')}`,
    providerCount,
    itemCount: items.length,
    resultsDataCount: resultsData.length,
    bodyKind: hasSelectedProviders ? 'scroll-view' : 'placeholder',
    shellKind: 'catalog-screen-shell',
    listMounted: hasSelectedProviders,
  });

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
      <View testID="streaming-discover-provider-header" style={styles.screenHeader}>
        <View style={styles.topBar}>
          <DetailBackButton />
        </View>
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

  const resultsFooter = resultsQuery.isFetchingNextPage ? (
    <View style={styles.footerLoading}>
      <ActivityIndicator color={colors.accent} />
    </View>
  ) : null;

  const resultsBody = useMemo(() => {
    if (!hasSelectedProviders) {
      return <View style={styles.resultsPlaceholder} />;
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

    return (
      <SearchMappedResultsScroll
        layoutScope="streaming-discover"
        testID="streaming-discover-scroll"
        style={styles.resultsScroll}
        items={resultsData}
        keyExtractor={searchResultKeyExtractor}
        onPress={handleResultPress}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <MovieAppRefreshControl
            refreshing={resultsQuery.isRefetching && !resultsQuery.isFetchingNextPage}
            onRefresh={() => void resultsQuery.refetch()}
          />
        }
        footer={resultsFooter}
        onEndReached={() => {
          if (resultsQuery.hasNextPage && !resultsQuery.isFetchingNextPage) {
            void resultsQuery.fetchNextPage();
          }
        }}
      />
    );
  }, [
    handleResultPress,
    hasSelectedProviders,
    items.length,
    resultsData,
    resultsFooter,
    resultsQuery,
    t,
  ]);

  return (
    <CatalogScreenShell
      layoutScope="streaming-discover"
      testID="streaming-discover-screen"
      header={providerHeader}
    >
      {resultsBody}
    </CatalogScreenShell>
  );
}

const styles = StyleSheet.create({
  screenHeader: {
    paddingHorizontal: spacing.lg,
  },
  topBar: {
    marginHorizontal: -spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  resultsPlaceholder: {
    flex: 1,
  },
  resultsScroll: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
    flexGrow: 1,
  },
  headerContent: {
    gap: spacing.md,
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
  errorContainer: {
    paddingVertical: spacing.xl,
  },
  footerLoading: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
});
