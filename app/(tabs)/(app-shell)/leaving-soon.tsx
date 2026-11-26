import { useCallback, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import { ActivityIndicator, FlatList, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { isApiError } from '@/api/errors';
import { AppText } from '@/components/common/AppText';
import { ErrorView } from '@/components/common/ErrorView';
import { StackListScreen } from '@/components/layout/StackListScreen';
import { PlatformRefreshFlatList } from '@/components/refresh/PlatformRefreshFlatList';
import { catalogBrowseListStyles } from '@/features/catalog/catalog-browse-list-styles';
import { CatalogListActions, CatalogSortSheet } from '@/features/catalog/components';
import { CatalogResultRow } from '@/features/catalog/components/CatalogResultRow';
import { DetailBackButton } from '@/features/details/shared/components/DetailScreenScaffold';
import { openCatalogDetailFromLibraryStack } from '@/features/details/shared/navigation/catalog-detail-navigation';
import { prefetchCatalogDetail } from '@/features/details/shared/navigation/prefetch-catalog-detail';
import { CatalogDiscoveryFilterSheet } from '@/features/discovery/components/CatalogDiscoveryFilterSheet';
import { CatalogEmptyState } from '@/features/discovery/components/CatalogEmptyState';
import {
  flattenLeavingSoonPages,
  formatLeavingLastDay,
  formatLeavingPlatforms,
} from '@/features/leaving-soon/leaving-soon-items';
import {
  filterDraftToLeavingSoonState,
  LEAVING_SOON_FILTER_SHEET_CONFIG,
  LEAVING_SOON_PARAM_KEYS,
  leavingSoonStateToFilterDraft,
  parseLeavingSoonParams,
  serializeLeavingSoonParams,
  serializeLeavingSoonRoute,
} from '@/features/leaving-soon/leaving-soon-params';
import {
  clearLeavingSoonFilters,
  DEFAULT_LEAVING_SOON_SORT,
  hasActiveLeavingSoonFilters,
  LEAVING_SOON_SORT_OPTIONS,
  type LeavingSoonItem,
  type LeavingSoonSort,
  type LeavingSoonState,
} from '@/features/leaving-soon/leaving-soon-types';
import { useLeavingSoonList } from '@/features/leaving-soon/useLeavingSoon';
import { setDiscoveryRouteParams } from '@/features/navigation/discovery-route-params';
import { ScrollToTopFab } from '@/features/navigation/ScrollToTopFab';
import { useFlatListScrollToTopControl } from '@/features/navigation/useFlatListScrollToTopControl';
import { SearchLoadingState } from '@/features/search/components/SearchLoadingState';
import { translateDiscoverySort } from '@/i18n/catalog-labels';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

export default function LeavingSoonScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const queryClient = useQueryClient();
  const rawParams = useLocalSearchParams();
  const [filterSheetVisible, setFilterSheetVisible] = useState(false);
  const [sortSheetVisible, setSortSheetVisible] = useState(false);
  const listRef = useRef<FlatList>(null);
  const { fabVisible, onListScroll, scrollToTop, scrollEventThrottle } =
    useFlatListScrollToTopControl(listRef);

  const state = useMemo(() => parseLeavingSoonParams(rawParams), [rawParams]);
  const resultsQuery = useLeavingSoonList(state);
  const items = useMemo(
    () => flattenLeavingSoonPages(resultsQuery.data?.pages),
    [resultsQuery.data?.pages],
  );
  const currentRoute = useMemo(() => serializeLeavingSoonRoute(state), [state]);

  const replaceState = useCallback(
    (next: LeavingSoonState) => {
      setDiscoveryRouteParams(router, serializeLeavingSoonParams(next), LEAVING_SOON_PARAM_KEYS);
    },
    [router],
  );

  const handleItemPress = useCallback(
    (item: LeavingSoonItem) => {
      prefetchCatalogDetail(queryClient, item.id, item.type);
      openCatalogDetailFromLibraryStack(router, item.id, item.type, 'discover', {
        libraryReturnHref: currentRoute,
      });
    },
    [currentRoute, queryClient, router],
  );

  const sortOptions = useMemo(
    () =>
      LEAVING_SOON_SORT_OPTIONS.map((value) => ({
        value,
        label:
          value === 'leaving_asc' ? t('leavingSoon.sortLeaving') : translateDiscoverySort(value),
      })),
    [t],
  );

  const listHeader = useMemo(
    () => (
      <View style={catalogBrowseListStyles.listHeader}>
        <View style={catalogBrowseListStyles.titleRow}>
          <AppText variant="title" accessibilityRole="header" style={catalogBrowseListStyles.title}>
            {t('leavingSoon.title')}
          </AppText>
          <CatalogListActions
            sortActive={state.sort !== DEFAULT_LEAVING_SOON_SORT}
            filterActive={hasActiveLeavingSoonFilters(state)}
            sortAccessibilityLabel={t('discovery.catalogFilters.sortAction')}
            filterAccessibilityLabel={t('discovery.catalogFilters.filterAction')}
            onPressSort={() => setSortSheetVisible(true)}
            onPressFilter={() => setFilterSheetVisible(true)}
            testID="leaving-soon-actions"
          />
        </View>
      </View>
    ),
    [state, t],
  );

  const renderListHeader = useCallback(() => listHeader, [listHeader]);

  const listEmpty = useMemo(() => {
    if (resultsQuery.isLoading) {
      return <SearchLoadingState />;
    }

    if (resultsQuery.isError) {
      const message = isApiError(resultsQuery.error)
        ? resultsQuery.error.userMessage
        : t('leavingSoon.loadError');

      return (
        <View style={catalogBrowseListStyles.errorContainer}>
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
        <CatalogEmptyState
          filtered={hasActiveLeavingSoonFilters(state)}
          onClearFilters={() => replaceState(clearLeavingSoonFilters(state))}
          title={t('leavingSoon.emptyTitle')}
          message={t('leavingSoon.emptyMessage')}
        />
      );
    }

    return null;
  }, [items.length, replaceState, resultsQuery, state, t]);

  return (
    <StackListScreen
      topBar={
        <View style={catalogBrowseListStyles.topBar}>
          <DetailBackButton />
        </View>
      }
    >
      <View style={styles.listHost}>
        <PlatformRefreshFlatList
          ref={listRef}
          refreshing={resultsQuery.isRefetching && !resultsQuery.isFetchingNextPage}
          onRefresh={() => void resultsQuery.refetch()}
          data={items}
          keyExtractor={(item: LeavingSoonItem) => `${item.type}:${item.id}`}
          renderItem={({ item }: { item: LeavingSoonItem }) => (
            <CatalogResultRow
              contentId={item.id}
              title={item.title}
              posterUrl={item.posterUrl}
              mediaType={item.type}
              releaseDate={item.releaseDate}
              year={item.year}
              voteAverage={item.voteAverage}
              genres={item.genres}
              note={`${formatLeavingLastDay(item.leavesAtUtc)} · ${formatLeavingPlatforms(item.platforms)}`}
              onPress={() => handleItemPress(item)}
            />
          )}
          ListHeaderComponent={renderListHeader}
          ListEmptyComponent={listEmpty}
          ListFooterComponent={
            resultsQuery.isFetchingNextPage ? (
              <ActivityIndicator color={colors.accent} style={styles.footerLoader} />
            ) : null
          }
          onEndReached={() => {
            if (resultsQuery.hasNextPage && !resultsQuery.isFetchingNextPage) {
              void resultsQuery.fetchNextPage();
            }
          }}
          onEndReachedThreshold={0.4}
          onScroll={onListScroll}
          scrollEventThrottle={scrollEventThrottle}
          contentContainerStyle={catalogBrowseListStyles.listContent}
        />
        <ScrollToTopFab visible={fabVisible} onPress={scrollToTop} />
      </View>
      <CatalogSortSheet
        visible={sortSheetVisible}
        title={t('discovery.catalogFilters.sort')}
        closeLabel={t('common.close')}
        options={sortOptions}
        value={state.sort}
        onSelect={(sort: LeavingSoonSort) => replaceState({ ...state, sort })}
        onClose={() => setSortSheetVisible(false)}
        testID="leaving-soon-sort-sheet"
      />
      <CatalogDiscoveryFilterSheet
        visible={filterSheetVisible}
        draft={leavingSoonStateToFilterDraft(state)}
        config={LEAVING_SOON_FILTER_SHEET_CONFIG}
        onClose={() => setFilterSheetVisible(false)}
        onApply={(draft) => replaceState(filterDraftToLeavingSoonState(draft, state))}
        onReset={() => {
          replaceState(clearLeavingSoonFilters(state));
          setFilterSheetVisible(false);
        }}
        testID="leaving-soon-filter-sheet"
      />
    </StackListScreen>
  );
}

const styles = StyleSheet.create({
  listHost: {
    flex: 1,
  },
  footerLoader: {
    paddingVertical: spacing.lg,
  },
});
