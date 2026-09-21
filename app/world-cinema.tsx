import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  translateAdvancedDiscoverMediaType,
  translateWorldCinemaSort,
} from '@/i18n/catalog-labels';
import { useQueryClient } from '@tanstack/react-query';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { MovieAppRefreshControl } from '@/components/refresh/MovieAppRefreshControl';
import { StackListScreen } from '@/components/layout/StackListScreen';
import { mergeFlatListStyle } from '@/components/layout/flat-list-layout';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { isApiError } from '@/api/errors';
import { AppText } from '@/components/common/AppText';
import { ErrorView } from '@/components/common/ErrorView';
import { DetailBackButton } from '@/features/details/shared/components/DetailScreenScaffold';
import { openCatalogDetailFromLibraryStack } from '@/features/details/shared/navigation/catalog-detail-navigation';
import { prefetchCatalogDetail } from '@/features/details/shared/navigation/prefetch-catalog-detail';
import { PRODUCT_METRICS } from '@/features/metrics/product-metric-types';
import { useTrackProductMetricOnFocus } from '@/features/metrics/use-track-product-metric-on-focus';
import { OriginCountrySelector } from '@/features/regions/components/OriginCountrySelector';
import { useWorldCinema } from '@/features/discovery/hooks/useWorldCinema';
import {
  parseWorldCinemaParams,
  serializeWorldCinemaParams,
  serializeWorldCinemaRoute,
} from '@/features/discovery/utils/world-cinema-params';
import {
  setDiscoveryRouteParams,
  WORLD_CINEMA_PARAM_KEYS,
} from '@/features/navigation/discovery-route-params';
import { ADVANCED_DISCOVER_MEDIA_OPTIONS } from '@/features/discovery/advanced-discover-types';
import { WORLD_CINEMA_SORT_OPTIONS } from '@/features/discovery/world-cinema-types';
import type { WorldCinemaState } from '@/features/discovery/world-cinema-types';
import { SearchEmptyState } from '@/features/search/components/SearchEmptyState';
import { SearchLoadingState } from '@/features/search/components/SearchLoadingState';
import { SearchResultCard } from '@/features/search/components/SearchResultCard';
import { searchResultKeyExtractor } from '@/features/search/utils/search-list-keys';
import type { SearchResultItem } from '@/features/search/types';
import { colors } from '@/theme/colors';
import { borderRadius, spacing } from '@/theme/spacing';

export default function WorldCinemaScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const queryClient = useQueryClient();
  const rawParams = useLocalSearchParams();
  const [countryExpanded, setCountryExpanded] = useState(false);
  useTrackProductMetricOnFocus(PRODUCT_METRICS.worldCinemaOpened);

  const discoverState = useMemo(
    () => parseWorldCinemaParams(rawParams),
    [rawParams],
  );

  const resultsQuery = useWorldCinema(discoverState);

  const items = useMemo(
    () => resultsQuery.data?.pages.flatMap((page) => page.items) ?? [],
    [resultsQuery.data?.pages],
  );

  const currentRoute = useMemo(
    () => serializeWorldCinemaRoute(discoverState),
    [discoverState],
  );

  const replaceState = useCallback(
    (next: WorldCinemaState) => {
      setDiscoveryRouteParams(
        router,
        serializeWorldCinemaParams(next),
        WORLD_CINEMA_PARAM_KEYS,
      );
    },
    [router],
  );

  const handleResultPress = useCallback(
    (item: SearchResultItem) => {
      if (item.type !== 'movie' && item.type !== 'tv') {
        return;
      }

      prefetchCatalogDetail(queryClient, item.id, item.type);
      openCatalogDetailFromLibraryStack(
        router,
        item.id,
        item.type,
        'discover',
        { libraryReturnHref: currentRoute },
      );
    },
    [currentRoute, queryClient, router],
  );

  const listHeaderContent = useMemo(
    () => (
      <View style={styles.header}>
        <AppText variant="title" accessibilityRole="header">
          {t('discovery.worldCinemaScreen.title')}
        </AppText>
        <AppText variant="bodySmall" muted>
          {t('discovery.worldCinemaScreen.subtitle')}
        </AppText>

        <View style={styles.toggleRow}>
          {ADVANCED_DISCOVER_MEDIA_OPTIONS.map((mediaType) => {
            const selected = discoverState.mediaType === mediaType;
            const label = translateAdvancedDiscoverMediaType(mediaType);

            return (
              <Pressable
                key={mediaType}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                accessibilityLabel={label}
                onPress={() => replaceState({ ...discoverState, mediaType })}
                style={({ pressed }) => [
                  styles.toggleChip,
                  selected && styles.toggleChipSelected,
                  pressed && styles.pressed,
                ]}
              >
                <AppText variant="bodySmall" style={selected ? styles.toggleLabelSelected : undefined}>
                  {label}
                </AppText>
              </Pressable>
            );
          })}
        </View>

        <OriginCountrySelector
          value={discoverState.originCountry}
          expanded={countryExpanded}
          onToggleExpanded={() => setCountryExpanded((current) => !current)}
          onSelect={(originCountry) => {
            setCountryExpanded(false);
            replaceState({ ...discoverState, originCountry });
          }}
          testID="origin-country-selector"
        />

        <View style={styles.sortRow}>
          {WORLD_CINEMA_SORT_OPTIONS.map((sort) => {
            const selected = discoverState.sort === sort;
            const label = translateWorldCinemaSort(sort);

            return (
              <Pressable
                key={sort}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                accessibilityLabel={t('common.sortByLabel', { label })}
                onPress={() => replaceState({ ...discoverState, sort })}
                style={({ pressed }) => [
                  styles.sortChip,
                  selected && styles.sortChipSelected,
                  pressed && styles.pressed,
                ]}
              >
                <AppText variant="bodySmall" style={selected ? styles.sortLabelSelected : undefined}>
                  {label}
                </AppText>
              </Pressable>
            );
          })}
        </View>
      </View>
    ),
    [countryExpanded, discoverState, replaceState, t],
  );

  const renderListHeader = useCallback(() => listHeaderContent, [listHeaderContent]);

  const listEmpty = useMemo(() => {
    if (resultsQuery.isLoading) {
      return <SearchLoadingState />;
    }

    if (resultsQuery.isError) {
      const message = isApiError(resultsQuery.error)
        ? resultsQuery.error.userMessage
        : t('discovery.worldCinemaScreen.loadError');

      return (
        <View style={styles.errorContainer}>
          <ErrorView message={message} onRetry={() => void resultsQuery.refetch()} retryLabel={t('common.tryAgain')} />
        </View>
      );
    }

    if (items.length === 0) {
      return (
        <SearchEmptyState
          title={t('discovery.worldCinemaScreen.emptyTitle')}
          message={t('discovery.worldCinemaScreen.emptyMessage')}
        />
      );
    }

    return null;
  }, [items.length, resultsQuery, t]);

  return (
    <StackListScreen
      topBar={
        <View style={styles.topBar}>
          <DetailBackButton />
        </View>
      }
    >
      <FlatList
        data={items}
        keyExtractor={searchResultKeyExtractor}
        renderItem={({ item }) => (
          <SearchResultCard item={item} onPress={handleResultPress} />
        )}
        ListHeaderComponent={renderListHeader}
        ListEmptyComponent={listEmpty}
        ListFooterComponent={
          resultsQuery.isFetchingNextPage ? (
            <ActivityIndicator color={colors.accent} style={styles.footerLoader} />
          ) : null
        }
        refreshControl={
          <MovieAppRefreshControl
            refreshing={resultsQuery.isRefetching && !resultsQuery.isFetchingNextPage}
            onRefresh={() => void resultsQuery.refetch()}
          />
        }
        onEndReached={() => {
          if (resultsQuery.hasNextPage && !resultsQuery.isFetchingNextPage) {
            void resultsQuery.fetchNextPage();
          }
        }}
        onEndReachedThreshold={0.4}
        style={mergeFlatListStyle()}
        contentContainerStyle={styles.listContent}
      />
    </StackListScreen>
  );
}

const styles = StyleSheet.create({
  topBar: {
    paddingHorizontal: spacing.lg,
  },
  header: {
    gap: spacing.md,
    paddingBottom: spacing.lg,
  },
  toggleRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  toggleChip: {
    minHeight: 44,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    justifyContent: 'center',
  },
  toggleChipSelected: {
    borderColor: colors.accent,
    backgroundColor: colors.accentTint12,
  },
  toggleLabelSelected: {
    color: colors.accent,
    fontWeight: '600',
  },
  sortRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  sortChip: {
    minHeight: 44,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    justifyContent: 'center',
  },
  sortChipSelected: {
    borderColor: colors.accent,
    backgroundColor: colors.accentTint12,
  },
  sortLabelSelected: {
    color: colors.accent,
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
    flexGrow: 1,
  },
  errorContainer: {
    paddingVertical: spacing.lg,
  },
  footerLoader: {
    paddingVertical: spacing.lg,
  },
  pressed: {
    opacity: 0.85,
  },
});
