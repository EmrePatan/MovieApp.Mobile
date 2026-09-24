import { useCallback, useMemo } from 'react';
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
import { StackListScreen } from '@/components/layout/StackListScreen';
import { PlatformRefreshFlatList } from '@/components/refresh/PlatformRefreshFlatList';
import { useRouter } from 'expo-router';
import { isApiError } from '@/api/errors';
import { AppText } from '@/components/common/AppText';
import { ErrorView } from '@/components/common/ErrorView';
import { DetailBackButton } from '@/features/details/shared/components/DetailScreenScaffold';
import { openCatalogDetailFromLibraryStack } from '@/features/details/shared/navigation/catalog-detail-navigation';
import { prefetchCatalogDetail } from '@/features/details/shared/navigation/prefetch-catalog-detail';
import { ADVANCED_DISCOVER_MEDIA_OPTIONS } from '@/features/discovery/advanced-discover-types';
import { JustWatchAttribution } from '@/features/discovery/components/JustWatchAttribution';
import { StreamingProviderPosterCard } from '@/features/discovery/components/StreamingProviderPosterCard';
import { useDiscoveryWatchProviders } from '@/features/discovery/hooks/useDiscoveryWatchProviders';
import { useStreamingDiscover } from '@/features/discovery/hooks/useStreamingDiscover';
import { listAllStreamingHubProviders } from '@/features/discovery/streaming-platform-hub-types';
import type { StreamingDiscoverState } from '@/features/discovery/streaming-discover-types';
import { serializeStreamingDiscoverRoute } from '@/features/discovery/utils/streaming-discover-params';
import { SearchEmptyState } from '@/features/search/components/SearchEmptyState';
import { SearchLoadingState } from '@/features/search/components/SearchLoadingState';
import { SearchResultCard } from '@/features/search/components/SearchResultCard';
import {
  flattenDedupedSearchResultPages,
  searchResultKeyExtractor,
} from '@/features/search/utils/search-list-keys';
import type { SearchResultItem } from '@/features/search/types';
import { colors } from '@/theme/colors';
import { borderRadius, spacing } from '@/theme/spacing';
import { layout } from '@/theme/layout';
import { commonStyles } from '@/theme/theme';

interface StreamingPlatformScreenProps {
  discoverState: StreamingDiscoverState;
  onReplaceState: (next: StreamingDiscoverState) => void;
  isRegionHydrated: boolean;
}

export function StreamingPlatformScreen({
  discoverState,
  onReplaceState,
  isRegionHydrated,
}: StreamingPlatformScreenProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const queryClient = useQueryClient();

  const primaryProviderId = discoverState.watchProviderIds[0] ?? null;

  const providersQuery = useDiscoveryWatchProviders(
    discoverState.mediaType,
    discoverState.watchRegion,
    isRegionHydrated,
  );

  const hubProviders = useMemo(
    () => listAllStreamingHubProviders(providersQuery.data?.providers ?? []),
    [providersQuery.data?.providers],
  );

  const activeProvider = providersQuery.data?.providers.find(
    (p) => p.providerId === primaryProviderId,
  );

  const platformState = useMemo(
    () =>
      primaryProviderId == null
        ? discoverState
        : {
            ...discoverState,
            watchProviderIds: [primaryProviderId],
            watchMonetizationTypes: ['stream'] as StreamingDiscoverState['watchMonetizationTypes'],
            sort: 'popularity_desc' as const,
          },
    [discoverState, primaryProviderId],
  );

  const resultsQuery = useStreamingDiscover(platformState, undefined, isRegionHydrated);

  const items = useMemo(
    () => flattenDedupedSearchResultPages(resultsQuery.data?.pages),
    [resultsQuery.data?.pages],
  );

  const currentRoute = useMemo(
    () => serializeStreamingDiscoverRoute(platformState),
    [platformState],
  );

  const replacePlatformState = useCallback(
    (patch: Partial<StreamingDiscoverState>) => {
      onReplaceState({
        ...discoverState,
        ...patch,
        watchProviderIds: primaryProviderId != null ? [primaryProviderId] : discoverState.watchProviderIds,
      });
    },
    [discoverState, onReplaceState, primaryProviderId],
  );

  const setMediaType = useCallback(
    (mediaType: StreamingDiscoverState['mediaType']) => {
      replacePlatformState({ mediaType });
    },
    [replacePlatformState],
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

  const pickerHeader = useMemo(
    () => (
      <View testID="streaming-platform-picker">
        <SafeAreaView edges={['top']} style={styles.headerSafeArea}>
          <DetailBackButton contentInset={false} />
          <View style={styles.headerContent}>
            <AppText variant="title" accessibilityRole="header">
              {t('discover.streamingPlatformsHub.title')}
            </AppText>
            <AppText variant="bodySmall" muted>
              {t('discovery.streamingPlatform.chooseProvider')}
            </AppText>
            <View style={styles.posterRow}>
              {hubProviders.map((provider) => (
                <StreamingProviderPosterCard
                  key={provider.providerId}
                  provider={provider}
                  watchRegion={discoverState.watchRegion}
                  queryEnabled={isRegionHydrated}
                />
              ))}
            </View>
            <JustWatchAttribution />
          </View>
        </SafeAreaView>
      </View>
    ),
    [discoverState.watchRegion, hubProviders, isRegionHydrated, t],
  );

  const platformHeader = useMemo(() => {
    if (!activeProvider) {
      return null;
    }

    return (
      <View style={styles.catalogHeader} testID="streaming-platform-header">
        <AppText variant="title" accessibilityRole="header">
          {activeProvider.name}
        </AppText>
        <AppText variant="bodySmall" muted>
          {t('discovery.streamingPlatform.catalogSubtitle')}
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
                onPress={() => setMediaType(mediaType)}
                style={({ pressed }) => [
                  styles.mediaChip,
                  selected && styles.mediaChipSelected,
                  pressed && styles.pressed,
                ]}
              >
                <AppText variant="bodySmall" style={selected ? styles.mediaChipSelectedText : undefined}>
                  {label}
                </AppText>
              </Pressable>
            );
          })}
        </View>

        <JustWatchAttribution />
      </View>
    );
  }, [activeProvider, discoverState.mediaType, setMediaType, t]);

  const renderPlatformHeader = useCallback(() => platformHeader, [platformHeader]);

  const listEmptyComponent = useMemo(() => {
    if (primaryProviderId == null) {
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
          <ErrorView
            message={message}
            onRetry={() => void resultsQuery.refetch()}
            retryLabel={t('common.tryAgain')}
          />
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
  }, [items.length, primaryProviderId, resultsQuery, t]);

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

  if (primaryProviderId == null || !activeProvider) {
    return (
      <View style={commonStyles.screen} testID="streaming-discover-screen">
        {pickerHeader}
      </View>
    );
  }

  return (
    <StackListScreen
      testID="streaming-discover-screen"
      topBar={
        <View style={styles.topBar}>
          <DetailBackButton />
        </View>
      }
    >
      <PlatformRefreshFlatList
        testID="streaming-discover-list"
        refreshing={resultsQuery.isRefetching && !resultsQuery.isFetchingNextPage}
        onRefresh={() => void resultsQuery.refetch()}
        data={items}
        keyExtractor={searchResultKeyExtractor}
        renderItem={renderItem}
        ListHeaderComponent={renderPlatformHeader}
        ListEmptyComponent={listEmptyComponent}
        ListFooterComponent={listFooter}
        contentContainerStyle={[
          styles.catalogListContent,
          items.length === 0 && styles.emptyListContent,
        ]}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.4}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        initialNumToRender={layout.verticalList.initialNumToRender}
        maxToRenderPerBatch={layout.verticalList.maxToRenderPerBatch}
        windowSize={layout.verticalList.windowSize}
      />
    </StackListScreen>
  );
}

const styles = StyleSheet.create({
  topBar: {
    paddingHorizontal: spacing.lg,
  },
  headerSafeArea: {
    backgroundColor: colors.background,
  },
  headerContent: {
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  catalogHeader: {
    gap: spacing.md,
    paddingBottom: spacing.lg,
  },
  mediaRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  mediaChip: {
    minHeight: 44,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
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
  pressed: {
    opacity: 0.85,
  },
  posterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  catalogListContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  emptyListContent: {
    flexGrow: 1,
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
