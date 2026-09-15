import { useCallback } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { isApiError } from '@/api/errors';
import { useAuth } from '@/auth/useAuth';
import { AppButton } from '@/components/buttons/AppButton';
import { AppText } from '@/components/common/AppText';
import { ErrorView } from '@/components/common/ErrorView';
import { openCatalogDetailFromTab } from '@/features/details/shared/navigation/open-catalog-detail-from-tab';
import { useFollowingCount } from '@/features/following/hooks/useFollowingCount';
import { useHome } from '@/features/home/hooks/useHome';
import type { HomeItem } from '@/features/home/types';
import { DEFAULT_HOME_SECTION_SIZE } from '@/features/home/types';
import { openLibraryStackScreen } from '@/features/library/navigation/library-stack-navigation';
import { useCurrentProfile } from '@/features/profile/hooks/useCurrentProfile';
import { useProfileStatistics } from '@/features/profile/hooks/useProfileStatistics';
import {
  formatFavoritesSubtitle,
  formatFollowingSubtitle,
  formatWatchHistorySubtitle,
  formatWatchlistSubtitle,
} from '@/features/profile/utils/library-copy';
import { useQueryClient } from '@tanstack/react-query';
import { LibraryContinueWatchingSection } from './LibraryContinueWatchingSection';
import { colors } from '@/theme/colors';
import { borderRadius, spacing } from '@/theme/spacing';

interface LibraryDestination {
  label: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  href: string;
  useTabRoute?: boolean;
}

function LibrarySummaryCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <View style={styles.summaryCard}>
      <AppText variant="caption" muted>
        {label}
      </AppText>
      <AppText variant="title">{value}</AppText>
    </View>
  );
}

export function LibraryHubContent() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();
  const profileQuery = useCurrentProfile();
  const statisticsQuery = useProfileStatistics();
  const followingCountQuery = useFollowingCount();
  const homeQuery = useHome('all', DEFAULT_HOME_SECTION_SIZE);

  const continueWatchingItems =
    homeQuery.data?.sections.find((section) => section.type === 'ContinueWatching')?.items ?? [];

  const summary = statisticsQuery.data?.summary;
  const followingCount = followingCountQuery.totalCount;

  const handleRefresh = useCallback(() => {
    void profileQuery.refetch();
    void statisticsQuery.refetch();
    void followingCountQuery.refetch();
    void homeQuery.refetch();
  }, [followingCountQuery, homeQuery, profileQuery, statisticsQuery]);

  const handleContinueItemPress = useCallback(
    (item: HomeItem) => {
      openCatalogDetailFromTab(
        router,
        item.id,
        item.contentType === 'movie' ? 'movie' : 'tv',
        'library',
        { queryClient },
      );
    },
    [queryClient, router],
  );

  const openDestination = useCallback(
    (destination: LibraryDestination) => {
      if (destination.useTabRoute) {
        router.push(destination.href);
        return;
      }

      openLibraryStackScreen(router, destination.href, '/(tabs)/library');
    },
    [router],
  );

  const destinations: LibraryDestination[] = summary
    ? [
        {
          label: 'Favorites',
          subtitle: formatFavoritesSubtitle(summary.favoritesCount),
          icon: 'heart-outline',
          href: '/favorites',
        },
        {
          label: 'Watchlists',
          subtitle: formatWatchlistSubtitle(summary.watchlistCount),
          icon: 'bookmark-outline',
          href: '/(tabs)/watchlist',
          useTabRoute: true,
        },
        {
          label: 'Following',
          subtitle: formatFollowingSubtitle(followingCount),
          icon: 'notifications-outline',
          href: '/following',
        },
        {
          label: 'Watch History',
          subtitle: formatWatchHistorySubtitle(summary.moviesWatched, summary.episodesWatched),
          icon: 'time-outline',
          href: '/watch-history',
        },
        {
          label: 'Coming Up',
          subtitle: 'Followed releases and upcoming episodes',
          icon: 'calendar-outline',
          href: '/upcoming',
        },
        {
          label: 'Ratings & Reviews',
          subtitle: `${summary.ratingsCount} ratings · ${summary.reviewsCount} reviews`,
          icon: 'star-outline',
          href: '/(tabs)/profile',
          useTabRoute: true,
        },
      ]
    : [];

  const isRefreshing =
    (statisticsQuery.isRefetching && !statisticsQuery.isLoading) ||
    (homeQuery.isRefetching && !homeQuery.isLoading);

  if (!isAuthenticated) {
    return (
      <View style={styles.centered}>
        <AppText variant="title">My Library</AppText>
        <AppText variant="bodySmall" muted style={styles.signInCopy}>
          Sign in to save titles, track progress, and build your collection.
        </AppText>
        <AppButton title="Sign in" onPress={() => router.push('/(auth)/login')} />
      </View>
    );
  }

  if (statisticsQuery.isLoading && !summary) {
    return (
      <View style={styles.centered}>
        <AppText variant="bodySmall" muted>Loading your library...</AppText>
      </View>
    );
  }

  if (statisticsQuery.isError && !summary) {
    const message = isApiError(statisticsQuery.error)
      ? statisticsQuery.error.userMessage
      : 'Unable to load your library.';

    return (
      <View style={styles.centered}>
        <ErrorView message={message} onRetry={handleRefresh} retryLabel="Try Again" />
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor={colors.accent} />
      }
    >
      <View style={styles.header}>
        <AppText variant="title" accessibilityRole="header">
          My Library
        </AppText>
        <AppText variant="bodySmall" muted>
          Your collection, progress, and saved titles
        </AppText>
      </View>

      {summary ? (
        <View style={styles.summaryGrid}>
          <LibrarySummaryCard label="Watching" value={String(summary.showsStarted)} />
          <LibrarySummaryCard label="Completed" value={String(summary.showsCompleted)} />
          <LibrarySummaryCard label="Saved" value={String(summary.watchlistCount)} />
        </View>
      ) : null}

      <LibraryContinueWatchingSection items={continueWatchingItems} onItemPress={handleContinueItemPress} />

      <View style={styles.destinations}>
        <AppText variant="subtitle">My Collection</AppText>
        {destinations.map((destination) => (
          <Pressable
            key={destination.label}
            accessibilityRole="button"
            accessibilityLabel={destination.label}
            onPress={() => openDestination(destination)}
            style={({ pressed }) => [styles.destinationRow, pressed && styles.pressed]}
          >
            <View style={styles.destinationIcon}>
              <Ionicons name={destination.icon} size={18} color={colors.accent} />
            </View>
            <View style={styles.destinationCopy}>
              <AppText variant="body">{destination.label}</AppText>
              <AppText variant="caption" muted>{destination.subtitle}</AppText>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl,
    gap: spacing.xl,
  },
  header: {
    paddingHorizontal: spacing.lg,
    gap: spacing.xs,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  summaryCard: {
    flexGrow: 1,
    minWidth: 100,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    gap: spacing.xs,
  },
  destinations: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  destinationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  destinationIcon: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accentTint12,
  },
  destinationCopy: {
    flex: 1,
    gap: 2,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  signInCopy: {
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.85,
  },
});
