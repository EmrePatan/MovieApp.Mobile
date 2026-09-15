import { useCallback, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  Pressable,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { isApiError } from '@/api/errors';
import { AppText } from '@/components/common/AppText';
import { ErrorView } from '@/components/common/ErrorView';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { prefetchCatalogDetail } from '@/features/details/shared/navigation/prefetch-catalog-detail';
import { buildCatalogDetailRoute } from '@/features/details/shared/routes';
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
import type { SearchAutocompleteItem, SearchResultItem, SearchTypeFilter } from '@/features/search/types';
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
  const { isAuthenticated } = useAuth();
  const [inputText, setInputText] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<SearchTypeFilter>('all');
  const [deletingHistoryId, setDeletingHistoryId] = useState<string | null>(null);

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
      prefetchCatalogDetail(queryClient, item.id, item.type);
      router.push(buildCatalogDetailRoute(item.id, item.type));
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
      <RefreshControl
        refreshing={isRefetching && !isFetchingNextPage}
        onRefresh={handleRefresh}
        tintColor={colors.accent}
      />
    ),
    [handleRefresh, isFetchingNextPage, isRefetching],
  );

  const listHeader = useMemo(
    () => (
      <SearchScreenHeader
        value={inputText}
        onChangeText={setInputText}
        onSubmit={handleSubmit}
        onClear={handleClear}
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
    ),
    [
      autocompleteQuery.data?.items,
      autocompleteQuery.isLoading,
      handleClear,
      handleSubmit,
      handleSuggestionSelect,
      hasActiveSearch,
      inputText,
      showAutocomplete,
      typeFilter,
    ],
  );

  const initialEmptyState = useMemo(
    () => (
      <SearchEmptyState
        variant="initial"
        title="Search movies and TV shows"
        message="Try a title like Inception or Breaking Bad"
      />
    ),
    [],
  );

  const noResultsState = useMemo(
    () => (
      <SearchEmptyState
        title={`No results for “${normalizedSubmittedQuery}”`}
        message="Try a different spelling or a broader search term."
      />
    ),
    [normalizedSubmittedQuery],
  );

  const isAutocompleteActive = showAutocomplete;

  const discoverLink = !hasActiveSearch && !isAutocompleteActive ? (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Discover trending and popular titles"
      onPress={() => router.push('/discover')}
      style={styles.discoverLink}
    >
      <AppText variant="bodySmall" style={styles.discoverLinkText}>
        Discover trending & popular
      </AppText>
    </Pressable>
  ) : null;

  if (hasActiveSearch) {
    if (searchQuery.isLoading && results.length === 0) {
      return (
        <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
          {listHeader}
          <SearchLoadingState />
        </SafeAreaView>
      );
    }

    if (searchQuery.isError && results.length === 0) {
      const message = isApiError(searchQuery.error)
        ? searchQuery.error.userMessage
        : 'Unable to search right now. Please try again.';

      return (
        <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
          {listHeader}
          <View style={styles.errorContainer}>
            <ErrorView message={message} onRetry={handleRefresh} retryLabel="Try Again" />
          </View>
        </SafeAreaView>
      );
    }

    return (
      <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
        <FlatList
          data={results}
          keyExtractor={searchResultKeyExtractor}
          renderItem={renderResult}
          ListHeaderComponent={listHeader}
          ListEmptyComponent={noResultsState}
          ListFooterComponent={
            searchQuery.isFetchingNextPage ? (
              <View style={styles.footerLoading}>
                <ActivityIndicator color={colors.accent} />
              </View>
            ) : null
          }
          refreshControl={refreshControl}
          contentContainerStyle={styles.listContent}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.4}
          initialNumToRender={layout.verticalList.initialNumToRender}
          maxToRenderPerBatch={layout.verticalList.maxToRenderPerBatch}
          windowSize={layout.verticalList.windowSize}
          removeClippedSubviews
        />
      </SafeAreaView>
    );
  }

  const showInitialEmpty =
    !isAutocompleteActive &&
    (!isAuthenticated || (!historyQuery.isLoading && historyItems.length === 0));

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <FlatList
        data={[]}
        renderItem={() => null}
        ListHeaderComponent={
          <>
            {listHeader}
            {isAuthenticated && !isAutocompleteActive ? (
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
            {discoverLink}
          </>
        }
        ListEmptyComponent={showInitialEmpty ? initialEmptyState : null}
        contentContainerStyle={styles.listContent}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
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
  discoverLink: {
    alignSelf: 'center',
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  discoverLinkText: {
    color: colors.accent,
    fontWeight: '600',
  },
});
