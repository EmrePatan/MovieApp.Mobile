import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { isApiError } from '@/api/errors';
import { useAuth } from '@/auth/useAuth';
import { AppButton } from '@/components/buttons/AppButton';
import { AppText } from '@/components/common/AppText';
import { ErrorView } from '@/components/common/ErrorView';
import { DetailBackButton } from '@/features/details/shared/components/DetailScreenScaffold';
import { buildCatalogDetailRoute } from '@/features/details/shared/routes';
import { DiscoveryKindControl } from '@/features/discovery/components/DiscoveryKindControl';
import { useDiscoveryResults } from '@/features/discovery/hooks/useDiscovery';
import type { DiscoveryKind, DiscoveryTypeFilter } from '@/features/discovery/types';
import { FollowingSection } from '@/features/following/components/FollowingSection';
import type { FollowingCatalogItem } from '@/features/following/types';
import { RecommendationSection } from '@/features/recommendations/components/RecommendationSection';
import { useRecommendationHome } from '@/features/recommendations/hooks/useRecommendationHome';
import type { RecommendationItem } from '@/features/recommendations/types';
import { UpcomingSection } from '@/features/upcoming/components/UpcomingSection';
import type { UpcomingCatalogItem } from '@/features/upcoming/types';
import { SearchFilterControl } from '@/features/search/components/SearchFilterControl';
import { SearchEmptyState } from '@/features/search/components/SearchEmptyState';
import { SearchLoadingState } from '@/features/search/components/SearchLoadingState';
import { SearchResultCard } from '@/features/search/components/SearchResultCard';
import type { SearchResultItem } from '@/features/search/types';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

export default function DiscoverScreen() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [kind, setKind] = useState<DiscoveryKind>('trending');
  const [typeFilter, setTypeFilter] = useState<DiscoveryTypeFilter>('all');

  const discoveryQuery = useDiscoveryResults(kind, typeFilter);
  const recommendationHomeQuery = useRecommendationHome();

  const items = useMemo(
    () => discoveryQuery.data?.pages.flatMap((page) => page.items) ?? [],
    [discoveryQuery.data?.pages],
  );

  const recommendationSections = useMemo(
    () =>
      (recommendationHomeQuery.data?.sections ?? []).filter(
        (section) => section.items.length > 0,
      ),
    [recommendationHomeQuery.data?.sections],
  );

  const handleRecommendationPress = useCallback(
    (item: RecommendationItem) => {
      router.push(buildCatalogDetailRoute(item.id, item.type));
    },
    [router],
  );

  const handleFollowingPress = useCallback(
    (item: FollowingCatalogItem) => {
      router.push(buildCatalogDetailRoute(item.id, item.type));
    },
    [router],
  );

  const handleUpcomingPress = useCallback(
    (item: UpcomingCatalogItem) => {
      router.push(buildCatalogDetailRoute(item.id, item.type));
    },
    [router],
  );

  const handleResultPress = useCallback(
    (item: SearchResultItem) => {
      router.push(buildCatalogDetailRoute(item.id, item.type));
    },
    [router],
  );

  const handleLoadMore = useCallback(() => {
    if (
      !discoveryQuery.hasNextPage ||
      discoveryQuery.isFetchingNextPage ||
      discoveryQuery.isFetching
    ) {
      return;
    }

    void discoveryQuery.fetchNextPage();
  }, [discoveryQuery]);

  const handleRefresh = useCallback(() => {
    void discoveryQuery.refetch();
    if (isAuthenticated) {
      void recommendationHomeQuery.refetch();
    }
  }, [discoveryQuery, isAuthenticated, recommendationHomeQuery]);

  const listHeader = (
    <View style={styles.header}>
      <DetailBackButton />
      <AppText variant="title">Discover</AppText>
      <AppText variant="bodySmall" muted>
        Trending and popular titles across the catalog
      </AppText>
      <DiscoveryKindControl value={kind} onChange={setKind} />
      <SearchFilterControl value={typeFilter} onChange={setTypeFilter} />
      {isAuthenticated && recommendationHomeQuery.isLoading ? (
        <View style={styles.sectionLoading}>
          <ActivityIndicator color={colors.accent} />
        </View>
      ) : null}
      {isAuthenticated && recommendationHomeQuery.isError ? (
        <View style={styles.sectionError}>
          <ErrorView
            message={
              isApiError(recommendationHomeQuery.error)
                ? recommendationHomeQuery.error.userMessage
                : 'Unable to load recommendations.'
            }
            onRetry={() => void recommendationHomeQuery.refetch()}
            retryLabel="Try Again"
          />
        </View>
      ) : null}
      {isAuthenticated ? <FollowingSection onItemPress={handleFollowingPress} /> : null}
      <UpcomingSection onItemPress={handleUpcomingPress} />
      {isAuthenticated
        ? recommendationSections.map((section) => (
            <RecommendationSection
              key={section.key}
              section={section}
              onItemPress={handleRecommendationPress}
            />
          ))
        : null}
      {!isAuthenticated ? (
        <View style={styles.signInPrompt}>
          <AppText variant="bodySmall" muted>
            Sign in to see personalized recommendations.
          </AppText>
          <AppButton
            title="Sign in"
            variant="secondary"
            onPress={() => router.push('/(auth)/login')}
          />
        </View>
      ) : null}
      <AppText variant="subtitle" style={styles.listTitle}>
        {kind === 'trending' ? 'Trending Now' : 'Popular Titles'}
      </AppText>
    </View>
  );

  if (discoveryQuery.isLoading && items.length === 0) {
    return (
      <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
        {listHeader}
        <SearchLoadingState />
      </SafeAreaView>
    );
  }

  if (discoveryQuery.isError && items.length === 0) {
    const message = isApiError(discoveryQuery.error)
      ? discoveryQuery.error.userMessage
      : 'Unable to load discovery content. Please try again.';

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
        data={items}
        keyExtractor={(item) => `${item.type}-${item.id}`}
        renderItem={({ item }) => <SearchResultCard item={item} onPress={handleResultPress} />}
        ListHeaderComponent={listHeader}
        ListEmptyComponent={
          <SearchEmptyState title={`No ${kind} titles found for this filter.`} />
        }
        ListFooterComponent={
          discoveryQuery.isFetchingNextPage ? (
            <View style={styles.footerLoading}>
              <ActivityIndicator color={colors.accent} />
            </View>
          ) : null
        }
        refreshControl={
          <RefreshControl
            refreshing={discoveryQuery.isRefetching && !discoveryQuery.isFetchingNextPage}
            onRefresh={handleRefresh}
            tintColor={colors.accent}
          />
        }
        contentContainerStyle={styles.listContent}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.4}
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
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  listTitle: {
    paddingTop: spacing.sm,
  },
  listContent: {
    paddingBottom: spacing.xxl,
    flexGrow: 1,
  },
  sectionLoading: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  sectionError: {
    paddingHorizontal: 0,
  },
  signInPrompt: {
    gap: spacing.sm,
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
