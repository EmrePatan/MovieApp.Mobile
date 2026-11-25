import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppText } from '@/components/common/AppText';
import { AppButton } from '@/components/buttons/AppButton';
import { GlassSurface } from '@/components/common/GlassSurface';
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
import { SocialFeedHeader } from '@/features/social/components/SocialFeedHeader';
import { SocialFeedFindPeopleButton } from '@/features/social/components/SocialFeedChrome';
import { SocialFeedComposerPrompt } from '@/features/social/components/SocialFeedComposerPrompt';
import { SocialFeedQuickPostSheet } from '@/features/social/components/SocialFeedQuickPostSheet';
import { SocialFeedFilmTexture } from '@/features/social/components/SocialFeedFilmTexture';
import { SocialFeedTimelineRowView } from '@/features/social/components/SocialFeedTimelineRowView';
import { SocialReportReasonSheet } from '@/features/social/components/SocialReportReasonSheet';
import { useSocialReportReasonSheet } from '@/features/social/hooks/useSocialReportReasonSheet';
import { socialFeedTheme } from '@/features/social/components/social-feed-theme';
import { useTabBarOverlayInset } from '@/features/navigation/useTabBarOverlayInset';

function feedModeForSegment(segment: SocialFeedSegment): 'following' | 'discover' {
  return segment === 'following' ? 'following' : 'discover';
}

export default function SocialFeedScreen() {
  const tabBarInset = useTabBarOverlayInset();
  useAuthFonts();
  const { t } = useTranslation();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isAuthenticated, user } = useAuth();
  const [feedSegment, setFeedSegment] = useState<SocialFeedSegment>('forYou');
  const [titleHeight, setTitleHeight] = useState(0);
  const [pinned, setPinned] = useState(false);
  const [composerOpen, setComposerOpen] = useState(false);
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

  const openComposer = useCallback(() => setComposerOpen(true), []);
  const closeComposer = useCallback(() => setComposerOpen(false), []);

  const openMessages = useCallback(() => {
    router.push('/(tabs)/(app-shell)/messages');
  }, [router]);

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      setPinned(titleHeight > 0 && event.nativeEvent.contentOffset.y > titleHeight);
    },
    [titleHeight],
  );

  const segmentTabs = <SocialFeedSegmentTabs active={feedSegment} onChange={setFeedSegment} />;

  const chrome = (
    <>
      <SocialFeedHeader onSearchPress={openPeopleSearch} onMessagesPress={openMessages} />
      {segmentTabs}
    </>
  );

  /** Title scrolls away; the segment control then pins as a glass bar. */
  const pinnedBar = pinned ? (
    <GlassSurface style={styles.pinnedBar} testID="social-feed-pinned-bar">
      <View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.pinnedScrim]} />
      {segmentTabs}
    </GlassSurface>
  ) : null;

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
        <FlatList
          style={styles.list}
          data={feedRows}
          keyExtractor={socialFeedTimelineRowKey}
          renderItem={renderRow}
          contentContainerStyle={[styles.listContent, { paddingBottom: spacing.xl + tabBarInset }]}
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
          onScroll={handleScroll}
          scrollEventThrottle={16}
          ListHeaderComponent={
            <>
              <View onLayout={(event) => setTitleHeight(event.nativeEvent.layout.height)}>
                <SocialFeedHeader onSearchPress={openPeopleSearch} onMessagesPress={openMessages} />
              </View>
              {segmentTabs}
              <View style={styles.composerGap} />
              <SocialFeedComposerPrompt
                displayName={user?.displayName ?? ''}
                avatarUrl={user?.effectiveAvatarUrl}
                onPress={openComposer}
              />
              {feed.isError && items.length > 0 ? (
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
              ) : null}
            </>
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
        {pinnedBar}
      </View>
      <SocialReportReasonSheet {...reportSheetProps} />
      <SocialFeedQuickPostSheet visible={composerOpen} onClose={closeComposer} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: socialFeedTheme.background },
  content: { flex: 1 },
  list: { flex: 1 },
  composerGap: { height: spacing.sm },
  pinnedBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingVertical: spacing.xs,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  pinnedScrim: {
    backgroundColor: 'rgba(10, 10, 14, 0.72)',
  },
  listContent: {
    flexGrow: 1,
    paddingTop: spacing.sm,
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
