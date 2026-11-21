import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppText } from '@/components/common/AppText';
import { AppButton } from '@/components/buttons/AppButton';
import { useAuth } from '@/auth/useAuth';
import { useAuthFonts } from '@/features/auth/useAuthFonts';
import { authTypography } from '@/features/auth/auth-typography';
import { useSocialFeed } from '@/features/social/hooks/useSocialQueries';
import {
  useReportSocialContent,
  useToggleSocialActivityLike,
} from '@/features/social/hooks/useSocialMutations';
import type { SocialFeedItem } from '@/features/social/types';
import { layout } from '@/theme/layout';
import { spacing } from '@/theme/spacing';
import { openSocialActivityCatalog } from '@/features/social/navigation/open-social-activity-catalog';
import { openSocialProfile } from '@/features/social/navigation/open-social-profile';
import {
  buildSocialFeedTimeline,
  socialFeedTimelineRowKey,
  type SocialFeedTimelineRow,
} from '@/features/social/utils/social-feed-presentation';
import {
  SocialFeedSegmentTabs,
  type SocialFeedSegment,
} from '@/features/social/components/SocialFeedSegmentTabs';
import { SocialFeedFindPeopleButton } from '@/features/social/components/SocialFeedChrome';
import { SocialFeedFilmTexture } from '@/features/social/components/SocialFeedFilmTexture';
import { SocialFeedTimelineRowView } from '@/features/social/components/SocialFeedTimelineRowView';
import { SocialReportReasonSheet } from '@/features/social/components/SocialReportReasonSheet';
import { useSocialReportReasonSheet } from '@/features/social/hooks/useSocialReportReasonSheet';
import { socialFeedTheme } from '@/features/social/components/social-feed-theme';

function feedModeForSegment(segment: SocialFeedSegment): 'following' | 'discover' {
  return segment === 'following' ? 'following' : 'discover';
}

export default function SocialFeedScreen() {
  useAuthFonts();
  const { t } = useTranslation();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isAuthenticated, user } = useAuth();
  const [feedSegment, setFeedSegment] = useState<SocialFeedSegment>('forYou');
  const feedMode = feedModeForSegment(feedSegment);
  const feed = useSocialFeed(feedMode);
  const toggleLike = useToggleSocialActivityLike();
  const report = useReportSocialContent();
  const { openActivityReport, reportSheetProps } = useSocialReportReasonSheet(report);
  const items = useMemo(() => feed.data?.pages.flatMap((page) => page.items) ?? [], [feed.data?.pages]);
  const feedRows = useMemo(() => buildSocialFeedTimeline(items), [feed.data?.pages, items]);

  const handleLike = useCallback(
    (item: SocialFeedItem) => {
      toggleLike.mutate({ activityId: item.id, isLiked: item.isLikedByMe });
    },
    [toggleLike],
  );

  const handleProfile = useCallback(
    (item: SocialFeedItem) => {
      openSocialProfile(router, item.actorId);
    },
    [router],
  );

  const handleComments = useCallback(
    (item: SocialFeedItem) => {
      router.push(`/(tabs)/(app-shell)/social/${item.id}`);
    },
    [router],
  );

  const handleActivity = useCallback(
    (item: SocialFeedItem) => {
      if (!openSocialActivityCatalog(router, item, { queryClient })) {
        router.push(`/(tabs)/(app-shell)/social/${item.id}`);
      }
    },
    [queryClient, router],
  );

  const isActivityLiking = useCallback(
    (activityId: string) => toggleLike.isPending && toggleLike.variables?.activityId === activityId,
    [toggleLike.isPending, toggleLike.variables?.activityId],
  );

  const handleLoadMore = useCallback(() => {
    if (feed.hasNextPage && !feed.isFetchingNextPage) void feed.fetchNextPage();
  }, [feed]);

  const openPeopleSearch = useCallback(() => {
    router.push('/(tabs)/(app-shell)/social-search');
  }, [router]);

  const emptyCopy =
    feedSegment === 'following' ? t('social.emptyFollowing') : t('social.emptyDiscover');

  const chrome = <SocialFeedSegmentTabs active={feedSegment} onChange={setFeedSegment} />;

  const renderRow = useCallback(
    ({ item: row }: { item: SocialFeedTimelineRow }) => (
      <SocialFeedTimelineRowView
        row={row}
        currentUserId={user?.id}
        isActivityLiking={isActivityLiking}
        onLikeActivity={handleLike}
        onOpenProfile={handleProfile}
        onOpenComments={handleComments}
        onOpenActivity={handleActivity}
        onReportActivity={openActivityReport}
      />
    ),
    [
      user?.id,
      isActivityLiking,
      handleLike,
      handleProfile,
      handleComments,
      handleActivity,
      openActivityReport,
    ],
  );

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.empty}>
          <AppText style={styles.emptyTitle}>{t('social.title')}</AppText>
          <AppText style={styles.emptyCopy}>{t('social.signIn')}</AppText>
          <AppButton title={t('auth.signIn')} onPress={() => router.push('/(auth)/login')} />
        </View>
      </SafeAreaView>
    );
  }

  if (feed.isLoading && items.length === 0) {
    return (
      <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
        <View style={styles.content}>
          <SocialFeedFilmTexture />
          {chrome}
          <View style={styles.empty}>
            <ActivityIndicator color={socialFeedTheme.accent} />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (feed.isError && items.length === 0) {
    return (
      <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
        <View style={styles.content}>
          <SocialFeedFilmTexture />
          {chrome}
          <View style={styles.empty}>
            <AppText style={styles.emptyCopy}>{t('social.loadError')}</AppText>
            <AppButton title={t('common.retry')} variant="secondary" onPress={() => void feed.refetch()} />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <View style={styles.content}>
        <SocialFeedFilmTexture />
        {chrome}
        <FlatList
          style={styles.list}
          data={feedRows}
          keyExtractor={socialFeedTimelineRowKey}
          renderItem={renderRow}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          overScrollMode="never"
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.4}
          initialNumToRender={layout.verticalList.initialNumToRender}
          maxToRenderPerBatch={layout.verticalList.maxToRenderPerBatch}
          windowSize={layout.verticalList.windowSize}
          removeClippedSubviews
          refreshing={feed.isRefetching && !feed.isFetchingNextPage}
          onRefresh={() => void feed.refetch()}
          ListHeaderComponent={
            feed.isError && items.length > 0 ? (
              <View style={styles.inlineError}>
                <AppText style={styles.inlineErrorText}>{t('social.loadError')}</AppText>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={t('common.retry')}
                  onPress={() => void feed.refetch()}
                  hitSlop={8}
                >
                  <AppText style={styles.retry}>{t('common.retry')}</AppText>
                </Pressable>
              </View>
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.emptyInline}>
              <AppText style={styles.emptyEditorial}>{emptyCopy}</AppText>
              {feedSegment === 'following' ? (
                <SocialFeedFindPeopleButton onPress={openPeopleSearch} />
              ) : null}
            </View>
          }
          ListFooterComponent={
            feed.isFetchingNextPage ? (
              <ActivityIndicator color={socialFeedTheme.accent} style={styles.footer} />
            ) : feed.isFetchNextPageError ? (
              <View style={styles.inlineError}>
                <AppText style={styles.inlineErrorText}>{t('social.loadError')}</AppText>
                <AppButton
                  title={t('common.retry')}
                  variant="secondary"
                  onPress={() => void feed.fetchNextPage()}
                />
              </View>
            ) : null
          }
        />
      </View>
      <SocialReportReasonSheet {...reportSheetProps} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: socialFeedTheme.background },
  content: { flex: 1 },
  list: { flex: 1 },
  listContent: {
    flexGrow: 1,
    paddingTop: spacing.xs,
    paddingBottom: spacing.xl,
  },
  inlineError: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
  },
  inlineErrorText: { fontSize: 13, color: socialFeedTheme.textSecondary },
  retry: { color: socialFeedTheme.accent, fontSize: 13, fontWeight: '600' },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    padding: spacing.xl,
  },
  emptyTitle: {
    fontFamily: authTypography.wordmarkSemibold,
    fontSize: 28,
    lineHeight: 34,
    color: socialFeedTheme.textPrimary,
  },
  emptyCopy: {
    fontSize: 14,
    lineHeight: 20,
    color: socialFeedTheme.textSecondary,
    textAlign: 'center',
  },
  emptyInline: {
    flexGrow: 1,
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
  },
  emptyEditorial: {
    fontFamily: authTypography.editorialRegular,
    fontSize: 22,
    lineHeight: 30,
    color: socialFeedTheme.textSecondary,
    textAlign: 'center',
  },
  footer: { padding: spacing.lg },
});
