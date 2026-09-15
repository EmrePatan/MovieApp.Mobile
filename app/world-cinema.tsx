import { useCallback, useMemo, useState } from 'react';
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
import { getWorldCinemaCollectionLabel } from '@/features/discovery/world-cinema-collections';
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
  const router = useRouter();
  const queryClient = useQueryClient();
  const rawParams = useLocalSearchParams();
  const [countryExpanded, setCountryExpanded] = useState(false);

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

  const listHeader = useMemo(
    () => (
      <View style={styles.header}>
        <AppText variant="title" accessibilityRole="header">
          World Cinema
        </AppText>
        <AppText variant="bodySmall" muted>
          Discover movies and TV by content origin country
        </AppText>

        <View style={styles.toggleRow}>
          {ADVANCED_DISCOVER_MEDIA_OPTIONS.map((option) => {
            const selected = discoverState.mediaType === option.value;

            return (
              <Pressable
                key={option.value}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                accessibilityLabel={option.label}
                onPress={() => replaceState({ ...discoverState, mediaType: option.value })}
                style={({ pressed }) => [
                  styles.toggleChip,
                  selected && styles.toggleChipSelected,
                  pressed && styles.pressed,
                ]}
              >
                <AppText variant="bodySmall" style={selected ? styles.toggleLabelSelected : undefined}>
                  {option.label}
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
          {WORLD_CINEMA_SORT_OPTIONS.map((option) => {
            const selected = discoverState.sort === option.value;

            return (
              <Pressable
                key={option.value}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                accessibilityLabel={`Sort by ${option.label}`}
                onPress={() => replaceState({ ...discoverState, sort: option.value })}
                style={({ pressed }) => [
                  styles.sortChip,
                  selected && styles.sortChipSelected,
                  pressed && styles.pressed,
                ]}
              >
                <AppText variant="bodySmall" style={selected ? styles.sortLabelSelected : undefined}>
                  {option.label}
                </AppText>
              </Pressable>
            );
          })}
        </View>

        <AppText variant="bodySmall" muted>
          {getWorldCinemaCollectionLabel(discoverState.originCountry)}
        </AppText>
      </View>
    ),
    [countryExpanded, discoverState, replaceState],
  );

  const listEmpty = useMemo(() => {
    if (resultsQuery.isLoading) {
      return <SearchLoadingState />;
    }

    if (resultsQuery.isError) {
      const message = isApiError(resultsQuery.error)
        ? resultsQuery.error.userMessage
        : 'Unable to load world cinema results right now.';

      return (
        <View style={styles.errorContainer}>
          <ErrorView message={message} onRetry={() => void resultsQuery.refetch()} retryLabel="Try Again" />
        </View>
      );
    }

    if (items.length === 0) {
      return (
        <SearchEmptyState
          title="No titles found"
          message="Try another origin country or media type."
        />
      );
    }

    return null;
  }, [items.length, resultsQuery]);

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <View style={styles.topBar}>
        <DetailBackButton />
      </View>
      <FlatList
        data={items}
        keyExtractor={searchResultKeyExtractor}
        renderItem={({ item }) => (
          <SearchResultCard item={item} onPress={handleResultPress} />
        )}
        ListHeaderComponent={listHeader}
        ListEmptyComponent={listEmpty}
        ListFooterComponent={
          resultsQuery.isFetchingNextPage ? (
            <ActivityIndicator color={colors.accent} style={styles.footerLoader} />
          ) : null
        }
        refreshControl={
          <RefreshControl
            refreshing={resultsQuery.isRefetching && !resultsQuery.isFetchingNextPage}
            onRefresh={() => void resultsQuery.refetch()}
            tintColor={colors.accent}
          />
        }
        onEndReached={() => {
          if (resultsQuery.hasNextPage && !resultsQuery.isFetchingNextPage) {
            void resultsQuery.fetchNextPage();
          }
        }}
        onEndReachedThreshold={0.4}
        contentContainerStyle={styles.listContent}
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
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  toggleChipSelected: {
    borderColor: colors.accent,
    backgroundColor: colors.surfaceElevated,
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
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  sortChipSelected: {
    borderColor: colors.accent,
    backgroundColor: colors.surfaceElevated,
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
