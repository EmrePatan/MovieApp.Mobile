import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  BackHandler,
  FlatList,
  Keyboard,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { AppText } from '@/components/common/AppText';
import { PlatformRefreshFlatList } from '@/components/refresh/PlatformRefreshFlatList';
import { useQueryClient } from '@tanstack/react-query';
import { StackListScreen } from '@/components/layout/StackListScreen';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import {
  parseSearchReturnOrigin,
  parseSearchScope,
  returnFromSearch,
} from '@/features/navigation/search-navigation';
import { useLibrarySearchResults } from '@/features/library/hooks/useLibrarySearchResults';
import { isApiError } from '@/api/errors';
import { ErrorView } from '@/components/common/ErrorView';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { shouldRequestNextInfinitePage } from '@/utils/should-request-next-infinite-page';
import { SearchExploreLanding } from '@/features/discovery/components/SearchExploreLanding';
import { openCatalogDetailFromTab } from '@/features/details/shared/navigation/open-catalog-detail-from-tab';
import { openPersonDetail } from '@/features/details/shared/navigation/person-detail-navigation';
import { SearchEmptyState } from '@/features/search/components/SearchEmptyState';
import { SearchFilterControl } from '@/features/search/components/SearchFilterControl';
import { SearchHistorySection } from '@/features/search/components/SearchHistorySection';
import { SearchLoadingState } from '@/features/search/components/SearchLoadingState';
import { SearchResultCard } from '@/features/search/components/SearchResultCard';
import { SearchScreenHeader } from '@/features/search/components/SearchScreenHeader';
import { SearchSuggestionList } from '@/features/search/components/SearchSuggestionList';
import { useAutocomplete } from '@/features/search/hooks/useAutocomplete';
import { useSearchResults } from '@/features/search/hooks/useSearch';
import { useRecentSearches } from '@/features/search/hooks/useRecentSearches';
import {
  isPersonSearchResult,
  type SearchAutocompleteItem,
  type SearchResultItem,
  type SearchTypeFilter,
} from '@/features/search/types';
import { AUTOCOMPLETE_DEBOUNCE_MS } from '@/features/search/types';
import {
  flattenDedupedSearchResultPages,
  searchResultKeyExtractor,
} from '@/features/search/utils/search-list-keys';
import { resolveSearchDisplayMode } from '@/features/search/utils/search-display-mode';
import { isValidSearchQuery, normalizeSearchQuery } from '@/features/search/utils/search-query';
import { PRODUCT_METRICS } from '@/features/metrics/product-metric-types';
import { trackProductMetric } from '@/features/metrics/track-product-metric';
import { colors } from '@/theme/colors';
import { layout } from '@/theme/layout';
import { spacing } from '@/theme/spacing';
import { commonStyles } from '@/theme/theme';
import { ScrollToTopFab } from '@/features/navigation/ScrollToTopFab';
import { useFlatListScrollToTopControl } from '@/features/navigation/useFlatListScrollToTopControl';

export default function SearchScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { explore, from, scope } = useLocalSearchParams<{
    explore?: string;
    from?: string;
    scope?: string;
  }>();
  const searchReturnOrigin = parseSearchReturnOrigin(from);
  const searchScope = parseSearchScope(scope);
  const isLibrarySearch = searchScope === 'library';
  const [inputText, setInputText] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<SearchTypeFilter>('all');
  const [deletingHistoryId, setDeletingHistoryId] = useState<string | null>(null);

  const handledExploreRef = useRef(false);
  const searchInputRef = useRef<TextInput>(null);
  const resultsListRef = useRef<FlatList>(null);
  const { fabVisible, onListScroll, scrollToTop, scrollEventThrottle } =
    useFlatListScrollToTopControl(resultsListRef);

  useEffect(() => {
    if (explore !== '1') {
      handledExploreRef.current = false;
      return;
    }

    if (handledExploreRef.current) {
      return;
    }

    handledExploreRef.current = true;
    setInputText('');
    setSubmittedQuery('');
    router.replace('/search');
  }, [explore, router]);

  const debouncedInput = useDebouncedValue(inputText, AUTOCOMPLETE_DEBOUNCE_MS);
  const normalizedInput = normalizeSearchQuery(inputText);
  const normalizedSubmittedQuery = normalizeSearchQuery(submittedQuery);
  const displayMode = resolveSearchDisplayMode({
    inputText,
    submittedQuery,
    debouncedInput,
  });
  const hasActiveSearch = displayMode === 'results';

  const catalogSearchQuery = useSearchResults(submittedQuery, typeFilter);
  const librarySearchQuery = useLibrarySearchResults(submittedQuery, typeFilter);
  const activeSearchQuery = isLibrarySearch ? librarySearchQuery : catalogSearchQuery;
  const showAutocomplete = !isLibrarySearch && displayMode === 'autocomplete';
  const autocompleteQuery = useAutocomplete(debouncedInput, { enabled: showAutocomplete });

  useEffect(() => {
    if (isLibrarySearch && typeFilter === 'person') {
      setTypeFilter('all');
    }
  }, [isLibrarySearch, typeFilter]);
  const {
    items: recentSearchItems,
    isLoading: isRecentSearchesLoading,
    recordQuery: recordRecentQuery,
    removeItem: removeRecentSearchItem,
    clearAll: clearRecentSearches,
  } = useRecentSearches();

  const results = useMemo(() => {
    if (isLibrarySearch) {
      return librarySearchQuery.data ?? [];
    }

    return flattenDedupedSearchResultPages(catalogSearchQuery.data?.pages);
  }, [catalogSearchQuery.data?.pages, isLibrarySearch, librarySearchQuery.data]);

  const showExplore = !isLibrarySearch && !hasActiveSearch && !showAutocomplete;

  const submitSearch = useCallback(
    (query: string, options?: { skipRecentQuery?: boolean }) => {
      const normalized = normalizeSearchQuery(query);
      if (!isValidSearchQuery(normalized)) {
        return;
      }

      Keyboard.dismiss();
      setInputText(normalized);
      setSubmittedQuery(normalized);
      trackProductMetric(PRODUCT_METRICS.searchSubmitted);

      if (!options?.skipRecentQuery && !isLibrarySearch) {
        void recordRecentQuery(normalized);
      }
    },
    [isLibrarySearch, recordRecentQuery],
  );

  const handleSubmit = useCallback(
    (submittedText?: string) => {
      submitSearch(submittedText ?? inputText);
    },
    [inputText, submitSearch],
  );

  const handleClear = useCallback(() => {
    setInputText('');
    setSubmittedQuery('');
  }, []);

  useFocusEffect(
    useCallback(() => {
      const focusTimer = setTimeout(() => {
        searchInputRef.current?.focus();
      }, 280);

      return () => {
        clearTimeout(focusTimer);
      };
    }, []),
  );

  const handleBack = useCallback(() => {
    if (searchReturnOrigin) {
      returnFromSearch(router, searchReturnOrigin);
      return;
    }

    if (router.canGoBack()) {
      router.back();
    }
  }, [router, searchReturnOrigin]);

  const canNavigateBack = Boolean(searchReturnOrigin || router.canGoBack());

  useFocusEffect(
    useCallback(() => {
      if (!canNavigateBack) {
        return undefined;
      }

      const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
        handleBack();
        return true;
      });

      return () => {
        subscription.remove();
      };
    }, [canNavigateBack, handleBack]),
  );

  const recordAutocompleteInputAsRecent = useCallback(() => {
    const normalized = normalizeSearchQuery(inputText);
    if (!isValidSearchQuery(normalized)) {
      return;
    }

    void recordRecentQuery(normalized);
  }, [inputText, recordRecentQuery]);

  const handleSuggestionSelect = useCallback(
    (suggestion: SearchAutocompleteItem) => {
      Keyboard.dismiss();

      if (suggestion.type === 'person' && suggestion.tmdbId) {
        recordAutocompleteInputAsRecent();
        openPersonDetail(router, suggestion.tmdbId);
        return;
      }

      if (suggestion.type === 'movie' || suggestion.type === 'tv') {
        recordAutocompleteInputAsRecent();
        openCatalogDetailFromTab(router, suggestion.id, suggestion.type, 'search', { queryClient });
        return;
      }

      submitSearch(suggestion.title);
    },
    [queryClient, recordAutocompleteInputAsRecent, router, submitSearch],
  );

  const handleRecentQuerySelect = useCallback(
    (query: string) => {
      submitSearch(query, { skipRecentQuery: true });
      void recordRecentQuery(query);
    },
    [recordRecentQuery, submitSearch],
  );

  const handleResultPress = useCallback(
    (item: SearchResultItem) => {
      Keyboard.dismiss();

      if (isPersonSearchResult(item)) {
        openPersonDetail(router, item.tmdbId);
        return;
      }

      openCatalogDetailFromTab(
        router,
        item.id,
        item.type,
        isLibrarySearch ? 'library' : 'search',
        { queryClient },
      );
    },
    [isLibrarySearch, queryClient, router],
  );

  const handleDeleteRecentSearchItem = useCallback(
    (id: string) => {
      setDeletingHistoryId(id);
      void removeRecentSearchItem(id).finally(() => {
        setDeletingHistoryId(null);
      });
    },
    [removeRecentSearchItem],
  );

  const [isClearingRecentSearches, setIsClearingRecentSearches] = useState(false);

  const handleClearRecentSearches = useCallback(() => {
    if (isClearingRecentSearches) {
      return;
    }

    setIsClearingRecentSearches(true);
    void clearRecentSearches().finally(() => {
      setIsClearingRecentSearches(false);
    });
  }, [clearRecentSearches, isClearingRecentSearches]);

  const {
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    refetch,
    isRefetching,
  } = catalogSearchQuery;

  const handleLoadMore = useCallback(() => {
    if (isLibrarySearch) {
      return;
    }

    if (!shouldRequestNextInfinitePage({ hasNextPage, isFetchingNextPage })) {
      return;
    }

    void fetchNextPage();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage, isLibrarySearch]);

  const handleRefresh = useCallback(() => {
    void activeSearchQuery.refetch();
  }, [activeSearchQuery]);

  const searchErrorMessage = activeSearchQuery.isError
    ? isApiError(activeSearchQuery.error)
      ? activeSearchQuery.error.userMessage
      : t('search.results.error')
    : null;

  const resultsFooter = !isLibrarySearch && catalogSearchQuery.isFetchingNextPage ? (
    <View style={styles.footerLoading}>
      <ActivityIndicator color={colors.accent} />
    </View>
  ) : null;

  const listEmptyComponent = useMemo(() => {
    if (activeSearchQuery.isLoading && results.length === 0) {
      return <SearchLoadingState />;
    }

    if (activeSearchQuery.isError && results.length === 0) {
      return (
        <View style={styles.errorContainer}>
          <ErrorView
            message={searchErrorMessage ?? t('search.results.error')}
            onRetry={handleRefresh}
            retryLabel={t('common.tryAgain')}
          />
        </View>
      );
    }

    if (results.length === 0) {
      return (
        <SearchEmptyState
          title={t('search.results.noResultsTitle', { query: normalizedSubmittedQuery })}
          message={t('search.results.noResultsMessage')}
        />
      );
    }

    return null;
  }, [
    handleRefresh,
    normalizedSubmittedQuery,
    results.length,
    searchErrorMessage,
    activeSearchQuery.isError,
    activeSearchQuery.isLoading,
    t,
  ]);

  const renderResultItem = useCallback(
    ({ item }: { item: SearchResultItem }) => (
      <SearchResultCard item={item} onPress={handleResultPress} />
    ),
    [handleResultPress],
  );

  const searchScreenHeader = (
    <SearchScreenHeader
      value={inputText}
      onChangeText={setInputText}
      onSubmit={handleSubmit}
      onClear={handleClear}
      onBack={canNavigateBack ? handleBack : undefined}
      inputRef={searchInputRef}
      autoFocus
    >
      {hasActiveSearch ? (
        <SearchFilterControl
          value={typeFilter}
          onChange={setTypeFilter}
          variant={isLibrarySearch ? 'library' : 'catalog'}
        />
      ) : null}
    </SearchScreenHeader>
  );

  if (hasActiveSearch) {
    return (
      <View style={commonStyles.screen} testID="search-screen">
        <View style={styles.listHost}>
        <PlatformRefreshFlatList
          ref={resultsListRef}
          testID="search-results-list"
          refreshing={activeSearchQuery.isRefetching && !catalogSearchQuery.isFetchingNextPage}
          onRefresh={handleRefresh}
          data={results}
          keyExtractor={searchResultKeyExtractor}
          renderItem={renderResultItem}
          ListHeaderComponent={searchScreenHeader}
          ListEmptyComponent={listEmptyComponent}
          ListFooterComponent={resultsFooter}
          contentContainerStyle={results.length === 0 ? styles.emptyListContent : styles.listContent}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.4}
          onScroll={onListScroll}
          scrollEventThrottle={scrollEventThrottle}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          initialNumToRender={layout.verticalList.initialNumToRender}
          maxToRenderPerBatch={layout.verticalList.maxToRenderPerBatch}
          windowSize={layout.verticalList.windowSize}
        />
        <ScrollToTopFab visible={fabVisible} onPress={scrollToTop} />
        </View>
      </View>
    );
  }

  if (showAutocomplete) {
    return (
      <StackListScreen testID="search-screen" header={searchScreenHeader}>
        <SearchSuggestionList
          suggestions={autocompleteQuery.data?.items ?? []}
          isLoading={autocompleteQuery.isLoading}
          onSelect={handleSuggestionSelect}
        />
      </StackListScreen>
    );
  }

  return (
    <StackListScreen testID="search-screen" header={searchScreenHeader}>
      <ScrollView
        style={styles.idleScroll}
        contentContainerStyle={styles.idleScrollContent}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        {showExplore && !isRecentSearchesLoading ? (
          <SearchHistorySection
            items={recentSearchItems}
            isClearing={isClearingRecentSearches}
            deletingId={deletingHistoryId}
            onSelect={handleRecentQuerySelect}
            onDelete={handleDeleteRecentSearchItem}
            onClearAll={handleClearRecentSearches}
          />
        ) : null}
        {showExplore ? <SearchExploreLanding /> : null}
        {isLibrarySearch && !hasActiveSearch && !showAutocomplete ? (
          <View style={styles.libraryIdleHint}>
            <AppText variant="bodySmall" muted center>
              {t('search.library.idleHint')}
            </AppText>
          </View>
        ) : null}
      </ScrollView>
    </StackListScreen>
  );
}

const styles = StyleSheet.create({
  listHost: {
    flex: 1,
  },
  listContent: {
    paddingBottom: spacing.xxl,
  },
  emptyListContent: {
    flexGrow: 1,
    paddingBottom: spacing.xxl,
  },
  idleScroll: {
    flex: 1,
  },
  idleScrollContent: {
    flexGrow: 1,
    paddingBottom: spacing.xxl,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  footerLoading: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  libraryIdleHint: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
});
