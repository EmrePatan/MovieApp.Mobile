import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  BackHandler,
  FlatList,
  Keyboard,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { MovieAppRefreshControl } from '@/components/refresh/MovieAppRefreshControl';
import { useQueryClient } from '@tanstack/react-query';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import {
  parseSearchReturnOrigin,
  returnFromSearch,
} from '@/features/navigation/search-navigation';
import { isApiError } from '@/api/errors';
import { ErrorView } from '@/components/common/ErrorView';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
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
import {
  useClearSearchHistory,
  useDeleteSearchHistoryItem,
  useSearchHistory,
} from '@/features/search/hooks/useSearchHistory';
import {
  isPersonSearchResult,
  type SearchAutocompleteItem,
  type SearchResultItem,
  type SearchTypeFilter,
} from '@/features/search/types';
import { AUTOCOMPLETE_DEBOUNCE_MS } from '@/features/search/types';
import { searchResultKeyExtractor } from '@/features/search/utils/search-list-keys';
import { isValidSearchQuery, normalizeSearchQuery } from '@/features/search/utils/search-query';
import { useAuth } from '@/auth/useAuth';
import { colors } from '@/theme/colors';
import { layout } from '@/theme/layout';
import { spacing } from '@/theme/spacing';

export default function SearchScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { explore, from } = useLocalSearchParams<{ explore?: string; from?: string }>();
  const searchReturnOrigin = parseSearchReturnOrigin(from);
  const { isAuthenticated } = useAuth();
  const [inputText, setInputText] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<SearchTypeFilter>('all');
  const [deletingHistoryId, setDeletingHistoryId] = useState<string | null>(null);

  const handledExploreRef = useRef(false);
  const searchInputRef = useRef<TextInput>(null);

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
  const hasActiveSearch =
    isValidSearchQuery(normalizedSubmittedQuery) &&
    normalizedInput === normalizedSubmittedQuery;

  const searchQuery = useSearchResults(submittedQuery, typeFilter);
  const showAutocomplete =
    !hasActiveSearch && isValidSearchQuery(normalizeSearchQuery(debouncedInput));
  const autocompleteQuery = useAutocomplete(debouncedInput, { enabled: showAutocomplete });
  const historyQuery = useSearchHistory({ enabled: !hasActiveSearch });
  const deleteHistoryItem = useDeleteSearchHistoryItem();
  const clearHistory = useClearSearchHistory();

  const results = useMemo(
    () => searchQuery.data?.pages.flatMap((page) => page.items) ?? [],
    [searchQuery.data?.pages],
  );

  const historyItems = historyQuery.data?.items ?? [];
  const showExplore = !hasActiveSearch && !showAutocomplete;

  const submitSearch = useCallback((query: string) => {
    const normalized = normalizeSearchQuery(query);
    if (!isValidSearchQuery(normalized)) {
      return;
    }

    Keyboard.dismiss();
    setInputText(normalized);
    setSubmittedQuery(normalized);
  }, []);

  const handleSubmit = useCallback(() => {
    submitSearch(inputText);
  }, [inputText, submitSearch]);

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

  const handleSuggestionSelect = useCallback(
    (suggestion: SearchAutocompleteItem) => {
      submitSearch(suggestion.title);
    },
    [submitSearch],
  );

  const handleHistorySelect = useCallback(
    (query: string) => {
      submitSearch(query);
    },
    [submitSearch],
  );

  const handleResultPress = useCallback(
    (item: SearchResultItem) => {
      Keyboard.dismiss();

      if (isPersonSearchResult(item)) {
        openPersonDetail(router, item.tmdbId);
        return;
      }

      openCatalogDetailFromTab(router, item.id, item.type, 'search', { queryClient });
    },
    [queryClient, router],
  );

  const handleDeleteHistoryItem = useCallback(
    (id: string) => {
      if (deleteHistoryItem.isPending) {
        return;
      }

      setDeletingHistoryId(id);
      deleteHistoryItem.mutate(id, {
        onSettled: () => {
          setDeletingHistoryId(null);
        },
      });
    },
    [deleteHistoryItem],
  );

  const handleClearHistory = useCallback(() => {
    if (clearHistory.isPending) {
      return;
    }

    clearHistory.mutate();
  }, [clearHistory]);

  const {
    hasNextPage,
    isFetchingNextPage,
    isFetching,
    fetchNextPage,
    refetch,
    isRefetching,
  } = searchQuery;

  const handleLoadMore = useCallback(() => {
    if (!hasNextPage || isFetchingNextPage || isFetching) {
      return;
    }

    void fetchNextPage();
  }, [fetchNextPage, hasNextPage, isFetching, isFetchingNextPage]);

  const handleRefresh = useCallback(() => {
    void refetch();
  }, [refetch]);

  const renderResult = useCallback(
    ({ item }: { item: SearchResultItem }) => (
      <SearchResultCard item={item} onPress={handleResultPress} />
    ),
    [handleResultPress],
  );

  const refreshControl = useMemo(
    () => (
      <MovieAppRefreshControl
        refreshing={isRefetching && !isFetchingNextPage}
        onRefresh={handleRefresh}
      />
    ),
    [handleRefresh, isFetchingNextPage, isRefetching],
  );

  const searchErrorMessage = searchQuery.isError
    ? isApiError(searchQuery.error)
      ? searchQuery.error.userMessage
      : 'Unable to search right now. Please try again.'
    : null;

  const listHeader = useMemo(
    () => (
      <>
        <SearchScreenHeader
          value={inputText}
          onChangeText={setInputText}
          onSubmit={handleSubmit}
          onClear={handleClear}
          onBack={canNavigateBack ? handleBack : undefined}
          inputRef={searchInputRef}
          autoFocus
        >
          {showAutocomplete ? (
            <SearchSuggestionList
              suggestions={autocompleteQuery.data?.items ?? []}
              isLoading={autocompleteQuery.isLoading}
              onSelect={handleSuggestionSelect}
            />
          ) : null}
          {hasActiveSearch ? (
            <SearchFilterControl value={typeFilter} onChange={setTypeFilter} />
          ) : null}
        </SearchScreenHeader>
        {!hasActiveSearch && isAuthenticated && showExplore ? (
          <SearchHistorySection
            items={historyItems}
            isLoading={historyQuery.isLoading}
            isError={historyQuery.isError}
            isClearing={clearHistory.isPending}
            deletingId={deletingHistoryId}
            onSelect={handleHistorySelect}
            onDelete={handleDeleteHistoryItem}
            onClearAll={handleClearHistory}
            onRetry={() => void historyQuery.refetch()}
          />
        ) : null}
        {!hasActiveSearch && showExplore ? <SearchExploreLanding /> : null}
      </>
    ),
    [
      autocompleteQuery.data?.items,
      autocompleteQuery.isLoading,
      canNavigateBack,
      clearHistory.isPending,
      deletingHistoryId,
      handleClear,
      handleClearHistory,
      handleDeleteHistoryItem,
      handleHistorySelect,
      handleBack,
      handleSubmit,
      handleSuggestionSelect,
      hasActiveSearch,
      historyItems,
      historyQuery,
      inputText,
      isAuthenticated,
      showAutocomplete,
      showExplore,
      typeFilter,
    ],
  );

  const listEmptyComponent = useMemo(() => {
    if (!hasActiveSearch) {
      return null;
    }

    if (searchQuery.isLoading && results.length === 0) {
      return <SearchLoadingState />;
    }

    if (searchQuery.isError && results.length === 0) {
      return (
        <View style={styles.errorContainer}>
          <ErrorView
            message={searchErrorMessage ?? 'Unable to search right now. Please try again.'}
            onRetry={handleRefresh}
            retryLabel="Try Again"
          />
        </View>
      );
    }

    if (results.length === 0) {
      return (
        <SearchEmptyState
          title={`No results for “${normalizedSubmittedQuery}”`}
          message="Try a different spelling or a broader search term."
        />
      );
    }

    return null;
  }, [
    handleRefresh,
    hasActiveSearch,
    normalizedSubmittedQuery,
    results.length,
    searchErrorMessage,
    searchQuery.isError,
    searchQuery.isLoading,
  ]);

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <FlatList
        data={hasActiveSearch ? results : []}
        keyExtractor={searchResultKeyExtractor}
        renderItem={renderResult}
        ListHeaderComponent={listHeader}
        ListEmptyComponent={listEmptyComponent}
        ListFooterComponent={
          hasActiveSearch && searchQuery.isFetchingNextPage ? (
            <View style={styles.footerLoading}>
              <ActivityIndicator color={colors.accent} />
            </View>
          ) : null
        }
        refreshControl={hasActiveSearch ? refreshControl : undefined}
        contentContainerStyle={styles.listContent}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        onEndReached={hasActiveSearch ? handleLoadMore : undefined}
        onEndReachedThreshold={0.4}
        initialNumToRender={layout.verticalList.initialNumToRender}
        maxToRenderPerBatch={layout.verticalList.maxToRenderPerBatch}
        windowSize={layout.verticalList.windowSize}
        removeClippedSubviews={hasActiveSearch}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    paddingBottom: spacing.xxl,
    flexGrow: 1,
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
});
