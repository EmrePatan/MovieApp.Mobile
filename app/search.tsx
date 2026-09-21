import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  BackHandler,
  Keyboard,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { MovieAppRefreshControl } from '@/components/refresh/MovieAppRefreshControl';
import { useQueryClient } from '@tanstack/react-query';
import { StackListScreen } from '@/components/layout/StackListScreen';
import { useFocusEffect, useLocalSearchParams, useRouter, useSegments } from 'expo-router';
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
import { SearchMappedResultsScroll } from '@/features/search/components/SearchMappedResultsScroll';
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
import { resolveSearchDisplayMode } from '@/features/search/utils/search-display-mode';
import { isValidSearchQuery, normalizeSearchQuery } from '@/features/search/utils/search-query';
import {
  logNavigationDiagnostic,
  useNavigationDiagnostics,
  useScreenRenderTrace,
} from '@/debug/navigation-diagnostics';
import { useAuth } from '@/auth/useAuth';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

export default function SearchScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { explore, from } = useLocalSearchParams<{ explore?: string; from?: string }>();
  const segments = useSegments();
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
  const displayMode = resolveSearchDisplayMode({
    inputText,
    submittedQuery,
    debouncedInput,
  });
  const hasActiveSearch = displayMode === 'results';

  const searchQuery = useSearchResults(submittedQuery, typeFilter);
  const showAutocomplete = displayMode === 'autocomplete';
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
      logNavigationDiagnostic('search:submit:ignored', {
        query,
        normalized,
      });
      return;
    }

    Keyboard.dismiss();
    setInputText(normalized);
    setSubmittedQuery(normalized);
    logNavigationDiagnostic('search:submit', {
      normalized,
      displayMode: 'results',
    });
  }, []);

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

  const handleSuggestionSelect = useCallback(
    (suggestion: SearchAutocompleteItem) => {
      Keyboard.dismiss();

      if (suggestion.type === 'person' && suggestion.tmdbId) {
        openPersonDetail(router, suggestion.tmdbId);
        return;
      }

      if (suggestion.type === 'movie' || suggestion.type === 'tv') {
        openCatalogDetailFromTab(router, suggestion.id, suggestion.type, 'search', { queryClient });
        return;
      }

      submitSearch(suggestion.title);
    },
    [queryClient, router, submitSearch],
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
      : t('search.results.error')
    : null;

  useNavigationDiagnostics('search', {
    displayMode,
    hasActiveSearch,
    normalizedInput,
    normalizedSubmittedQuery,
    resultCount: results.length,
    queryEnabled: isValidSearchQuery(normalizedSubmittedQuery),
    isLoading: searchQuery.isLoading,
    isError: searchQuery.isError,
    isFetching: searchQuery.isFetching,
  });

  useScreenRenderTrace('search', {
    pathname: `/${segments.join('/')}`,
    displayMode,
    resultCount: results.length,
    bodyKind: hasActiveSearch ? 'scroll-view' : 'scroll-view',
    headerPlacement: 'stack-screen',
    listMounted: hasActiveSearch,
  });

  const resultsFooter = searchQuery.isFetchingNextPage ? (
    <View style={styles.footerLoading}>
      <ActivityIndicator color={colors.accent} />
    </View>
  ) : null;

  const resultsBody = useMemo(() => {
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

    return (
      <SearchMappedResultsScroll
        layoutScope="search-results"
        testID="search-results-scroll"
        style={styles.resultsScroll}
        items={results}
        keyExtractor={searchResultKeyExtractor}
        onPress={handleResultPress}
        contentContainerStyle={styles.listContent}
        refreshControl={refreshControl}
        footer={resultsFooter}
        onEndReached={handleLoadMore}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      />
    );
  }, [
    handleLoadMore,
    handleRefresh,
    handleResultPress,
    hasActiveSearch,
    normalizedSubmittedQuery,
    refreshControl,
    results,
    resultsFooter,
    searchErrorMessage,
    searchQuery.isError,
    searchQuery.isLoading,
    t,
  ]);

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
  );

  return (
    <StackListScreen testID="search-screen" header={searchScreenHeader}>
      {hasActiveSearch ? (
        resultsBody
      ) : (
        <ScrollView
          style={styles.idleScroll}
          contentContainerStyle={styles.idleScrollContent}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          {isAuthenticated && showExplore ? (
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
          {showExplore ? <SearchExploreLanding /> : null}
        </ScrollView>
      )}
    </StackListScreen>
  );
}

const styles = StyleSheet.create({
  resultsScroll: {
    flex: 1,
  },
  listContent: {
    paddingBottom: spacing.xxl,
    flexGrow: 1,
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
});
