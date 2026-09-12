import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { isApiError } from '@/api/errors';
import { AppText } from '@/components/common/AppText';
import { AppButton } from '@/components/buttons/AppButton';
import { ErrorView } from '@/components/common/ErrorView';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { buildCatalogDetailRoute } from '@/features/details/shared/routes';
import { SearchBar } from '@/features/search/components/SearchBar';
import { SearchEmptyState } from '@/features/search/components/SearchEmptyState';
import { SearchFilterControl } from '@/features/search/components/SearchFilterControl';
import { SearchHistorySection } from '@/features/search/components/SearchHistorySection';
import { SearchLoadingState } from '@/features/search/components/SearchLoadingState';
import { SearchResultCard } from '@/features/search/components/SearchResultCard';
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
import { isValidSearchQuery, normalizeSearchQuery } from '@/features/search/utils/search-query';
import { useAuth } from '@/auth/useAuth';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

export default function SearchScreen() {
  const router = useRouter();
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
  const autocompleteQuery = useAutocomplete(debouncedInput);
  const historyQuery = useSearchHistory();
  const deleteHistoryItem = useDeleteSearchHistoryItem();
  const clearHistory = useClearSearchHistory();

  const results = useMemo(
    () => searchQuery.data?.pages.flatMap((page) => page.items) ?? [],
    [searchQuery.data?.pages],
  );

  const showAutocomplete =
    !hasActiveSearch && isValidSearchQuery(normalizeSearchQuery(debouncedInput));

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
      router.push(buildCatalogDetailRoute(item.id, item.type));
    },
    [router],
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

  const handleLoadMore = useCallback(() => {
    if (
      !searchQuery.hasNextPage ||
      searchQuery.isFetchingNextPage ||
      searchQuery.isFetching
    ) {
      return;
    }

    void searchQuery.fetchNextPage();
  }, [searchQuery]);

  const handleRefresh = useCallback(() => {
    void searchQuery.refetch();
  }, [searchQuery]);

  const renderResult = useCallback(
    ({ item }: { item: SearchResultItem }) => (
      <SearchResultCard item={item} onPress={handleResultPress} />
    ),
    [handleResultPress],
  );

  const listHeader = (
    <View style={styles.header}>
      <AppText variant="title" style={styles.title}>
        Search
      </AppText>
      <SearchBar
        value={inputText}
        onChangeText={setInputText}
        onSubmit={handleSubmit}
        onClear={handleClear}
      />
      {showAutocomplete ? (
        <SearchSuggestionList
          suggestions={autocompleteQuery.data?.items ?? []}
          isLoading={autocompleteQuery.isLoading}
          onSelect={handleSuggestionSelect}
        />
      ) : null}
      {hasActiveSearch ? <SearchFilterControl value={typeFilter} onChange={setTypeFilter} /> : null}
      {!hasActiveSearch ? (
        <View style={styles.discoverLink}>
          <AppButton title="Discover trending & popular" variant="secondary" onPress={() => router.push('/discover')} />
        </View>
      ) : null}
    </View>
  );

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
          keyExtractor={(item) => `${item.type}-${item.id}`}
          renderItem={renderResult}
          ListHeaderComponent={listHeader}
          ListEmptyComponent={
            <SearchEmptyState
              title={`No movies or shows found for “${normalizedSubmittedQuery}”`}
            />
          }
          ListFooterComponent={
            searchQuery.isFetchingNextPage ? (
              <View style={styles.footerLoading}>
                <ActivityIndicator color={colors.accent} />
              </View>
            ) : null
          }
          refreshControl={
            <RefreshControl
              refreshing={searchQuery.isRefetching && !searchQuery.isFetchingNextPage}
              onRefresh={handleRefresh}
              tintColor={colors.accent}
            />
          }
          contentContainerStyle={styles.listContent}
          keyboardShouldPersistTaps="handled"
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.4}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <FlatList
        data={[]}
        renderItem={() => null}
        ListHeaderComponent={
          <>
            {listHeader}
            {isAuthenticated ? (
              <SearchHistorySection
                items={historyQuery.data?.items ?? []}
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
          </>
        }
        ListEmptyComponent={
          <SearchEmptyState
            title="Search for a movie or TV show"
            message="Find titles across the catalog and open details instantly."
          />
        }
        contentContainerStyle={styles.listContent}
        keyboardShouldPersistTaps="handled"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingTop: spacing.md,
    gap: spacing.sm,
  },
  title: {
    paddingHorizontal: spacing.lg,
  },
  discoverLink: {
    paddingHorizontal: spacing.lg,
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
