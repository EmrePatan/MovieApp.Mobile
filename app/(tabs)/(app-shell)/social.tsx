import { useCallback, useMemo } from 'react';
import { ActivityIndicator, Alert, FlatList, Image, Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppText } from '@/components/common/AppText';
import { AppButton } from '@/components/buttons/AppButton';
import { useAuth } from '@/auth/useAuth';
import { useSocialFeed, useSocialUnreadNotificationCount } from '@/features/social/hooks/useSocialQueries';
import { useReportSocialContent, useToggleSocialActivityLike } from '@/features/social/hooks/useSocialMutations';
import type { SocialFeedItem } from '@/features/social/types';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { resolveImageUri } from '@/utils/image-url';

function getActivityLabelKey(type: string): string {
  switch (type) {
    case 'WatchedMovie':
    case '1': return 'social.activity.watchedMovie';
    case 'WatchedEpisode':
    case '2': return 'social.activity.watchedEpisode';
    case 'RatedMovie':
    case 'RatedTvShow':
    case '3':
    case '4': return 'social.activity.rated';
    case 'ReviewedMovie':
    case 'ReviewedTvShow':
    case '5':
    case '6': return 'social.activity.reviewed';
    case 'FavoritedMovie':
    case 'FavoritedTvShow':
    case '7':
    case '8': return 'social.activity.favorited';
    default: return 'social.activity.generic';
  }
}

function SocialActivityCard({
  item,
  onLike,
  onProfile,
  onComments,
  onReport,
  isLiking,
  activityLabel,
  likeLabel,
  unlikeLabel,
  commentsLabel,
  reportLabel,
}: {
  item: SocialFeedItem;
  onLike: (item: SocialFeedItem) => void;
  onProfile: (item: SocialFeedItem) => void;
  onComments: (item: SocialFeedItem) => void;
  onReport: (item: SocialFeedItem) => void;
  isLiking: boolean;
  activityLabel: string;
  likeLabel: string;
  unlikeLabel: string;
  commentsLabel: string;
  reportLabel: string;
}) {
  const { t, i18n } = useTranslation();
  const dateLabel = new Date(item.createdAt).toLocaleDateString(i18n.language);
  const posterUri = resolveImageUri(item.posterPath, 'w300');
  return (
    <View style={styles.card}>
      <Pressable accessibilityRole="button" onPress={() => onProfile(item)} style={styles.cardHeader}>
        <View style={styles.avatar}>
          <AppText variant="subtitle">{item.displayName.slice(0, 1).toUpperCase()}</AppText>
        </View>
        <View style={styles.actorBlock}>
          <AppText variant="body" style={styles.actorName}>{item.displayName}</AppText>
          <AppText variant="caption" muted>@{item.userName} · {dateLabel}</AppText>
        </View>
      </Pressable>
      <AppText variant="body">
        {item.displayName} {activityLabel}
      </AppText>
      <View style={styles.contentCard}>
        {posterUri ? <Image source={{ uri: posterUri }} style={styles.poster} /> : null}
        <View style={styles.contentText}>
          <AppText variant="subtitle">{item.targetTitle || t('social.contentFallback')}</AppText>
          {item.targetSubtitle ? <AppText variant="bodySmall" muted>{item.targetSubtitle}</AppText> : null}
          {item.ratingScore !== null ? <AppText variant="bodySmall">★ {item.ratingScore}/10</AppText> : null}
          {item.reviewExcerpt ? <AppText variant="bodySmall" muted numberOfLines={4}>{item.reviewExcerpt}</AppText> : null}
        </View>
      </View>
      <View style={styles.actions}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={item.isLikedByMe ? unlikeLabel : likeLabel}
          disabled={isLiking}
          onPress={() => onLike(item)}
          style={styles.actionButton}
        >
          <AppText variant="bodySmall" style={item.isLikedByMe ? styles.liked : undefined}>
            {item.isLikedByMe ? '♥' : '♡'} {item.likesCount}
          </AppText>
        </Pressable>
        <Pressable accessibilityRole="button" onPress={() => onComments(item)} style={styles.actionButton}>
          <AppText variant="bodySmall">{commentsLabel} · {item.commentsCount}</AppText>
        </Pressable>
        <Pressable accessibilityRole="button" onPress={() => onReport(item)} style={styles.actionButton}>
          <AppText variant="caption" muted>{reportLabel}</AppText>
        </Pressable>
      </View>
    </View>
  );
}

type FeedListItem =
  | { kind: 'activity'; item: SocialFeedItem }
  | { kind: 'episode-group'; items: SocialFeedItem[] };

function groupConsecutiveEpisodeActivities(items: SocialFeedItem[]): FeedListItem[] {
  const result: FeedListItem[] = [];
  for (let index = 0; index < items.length;) {
    const first = items[index];
    const isEpisode = first.activityType === 'WatchedEpisode' || first.activityType === '2';
    if (!isEpisode) { result.push({ kind: 'activity', item: first }); index += 1; continue; }
    const group = [first];
    let next = index + 1;
    while (next < items.length) {
      const candidate = items[next];
      const candidateIsEpisode = candidate.activityType === 'WatchedEpisode' || candidate.activityType === '2';
      const withinOneDay = Math.abs(new Date(first.createdAt).getTime() - new Date(candidate.createdAt).getTime()) <= 86400000;
      if (candidateIsEpisode && candidate.actorId === first.actorId && candidate.targetTitle === first.targetTitle && withinOneDay) { group.push(candidate); next += 1; }
      else break;
    }
    result.push(group.length > 1 ? { kind: 'episode-group', items: group } : { kind: 'activity', item: first });
    index = next;
  }
  return result;
}

function SocialEpisodeGroupCard({ items, onLike, onProfile, onComments, onReport, isLiking, watchedLabel, watchedCountLabel, likeLabel, unlikeLabel, commentsLabel, reportLabel }: {
  items: SocialFeedItem[]; onLike: (item: SocialFeedItem) => void; onProfile: (item: SocialFeedItem) => void;
  onComments: (item: SocialFeedItem) => void; onReport: (item: SocialFeedItem) => void;
  isLiking: (item: SocialFeedItem) => boolean; watchedLabel: string; watchedCountLabel: string; likeLabel: string; unlikeLabel: string;
  commentsLabel: string; reportLabel: string;
}) {
  const { i18n } = useTranslation();
  const first = items[0];
  const posterUri = resolveImageUri(first.posterPath, 'w300');
  return (
    <View style={styles.card}>
      <Pressable accessibilityRole="button" onPress={() => onProfile(first)} style={styles.cardHeader}>
        <View style={styles.avatar}><AppText variant="subtitle">{first.displayName.slice(0, 1).toUpperCase()}</AppText></View>
        <View style={styles.actorBlock}><AppText variant="body" style={styles.actorName}>{first.displayName}</AppText>
          <AppText variant="caption" muted>@{first.userName} · {new Date(first.createdAt).toLocaleDateString(i18n.language)}</AppText></View>
      </Pressable>
      <AppText variant="body">{first.displayName} {watchedLabel} · {watchedCountLabel}</AppText>
      <View style={styles.contentCard}>
        {posterUri ? <Image source={{ uri: posterUri }} style={styles.poster} /> : null}
        <View style={styles.contentText}><AppText variant="subtitle">{first.targetTitle}</AppText>
          {items.map(item => <View key={item.id} style={styles.episodeRow}>
            <View style={styles.episodeTitle}><AppText variant="bodySmall">{item.targetSubtitle ?? item.targetTitle}</AppText></View>
            <Pressable accessibilityRole="button" accessibilityLabel={item.isLikedByMe ? unlikeLabel : likeLabel} disabled={isLiking(item)} onPress={() => onLike(item)}>
              <AppText variant="caption" style={item.isLikedByMe ? styles.liked : undefined}>{item.isLikedByMe ? '♥' : '♡'} {item.likesCount}</AppText></Pressable>
            <Pressable accessibilityRole="button" onPress={() => onComments(item)}><AppText variant="caption">{commentsLabel} · {item.commentsCount}</AppText></Pressable>
            <Pressable accessibilityRole="button" onPress={() => onReport(item)}><AppText variant="caption" muted>{reportLabel}</AppText></Pressable>
          </View>)}
        </View>
      </View>
    </View>
  );
}
export default function SocialFeedScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const feed = useSocialFeed();
  const unreadNotifications = useSocialUnreadNotificationCount();
  const toggleLike = useToggleSocialActivityLike();
  const report = useReportSocialContent();
  const items = useMemo(() => feed.data?.pages.flatMap(page => page.items) ?? [], [feed.data?.pages]);
  const feedRows = useMemo(() => groupConsecutiveEpisodeActivities(items), [items]);

  const handleLike = useCallback((item: SocialFeedItem) => {
    toggleLike.mutate({ activityId: item.id, isLiked: item.isLikedByMe });
  }, [toggleLike]);

  const handleProfile = useCallback((item: SocialFeedItem) => {
    router.push(`/(tabs)/(app-shell)/social-profile/${item.actorId}`);
  }, [router]);

  const handleComments = useCallback((item: SocialFeedItem) => {
    router.push(`/(tabs)/(app-shell)/social/${item.id}`);
  }, [router]);

  const handleReport = useCallback((item: SocialFeedItem) => {
    Alert.alert(t('social.reportTitle'), t('social.chooseReportReason'), [
      { text: t('social.spam'), onPress: () => report.mutate({ targetType: 'Activity', targetId: item.id, reason: 'Spam' }) },
      { text: t('social.inappropriate'), onPress: () => report.mutate({ targetType: 'Activity', targetId: item.id, reason: 'Inappropriate' }) },
      { text: t('social.harassment'), onPress: () => report.mutate({ targetType: 'Activity', targetId: item.id, reason: 'Harassment' }) },
      { text: t('social.cancel'), style: 'cancel' },
    ]);
  }, [report, t]);

  const handleLoadMore = useCallback(() => {
    if (feed.hasNextPage && !feed.isFetchingNextPage) void feed.fetchNextPage();
  }, [feed]);

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.empty}>
          <AppText variant="title">{t('social.title')}</AppText>
          <AppText variant="bodySmall" muted>{t('social.signIn')}</AppText>
          <AppButton title={t('auth.signIn')} onPress={() => router.push('/(auth)/login')} />
        </View>
      </SafeAreaView>
    );
  }

  if (feed.isLoading && items.length === 0) {
    return <SafeAreaView style={styles.screen}><View style={styles.empty}><ActivityIndicator color={colors.accent} /></View></SafeAreaView>;
  }

  if (feed.isError && items.length === 0) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.empty}>
          <AppText variant="bodySmall" muted>{t('social.loadError')}</AppText>
          <AppButton title={t('common.retry')} variant="secondary" onPress={() => void feed.refetch()} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <FlatList
        data={feedRows}
        keyExtractor={row => row.kind === 'activity' ? row.item.id : 'episode-group-' + row.items[0].id}
        renderItem={({ item: row }) => row.kind === 'activity' ? (
          <SocialActivityCard
            item={row.item} onLike={handleLike} onProfile={handleProfile} onComments={handleComments} onReport={handleReport}
            isLiking={toggleLike.isPending && toggleLike.variables?.activityId === row.item.id}
            activityLabel={t(getActivityLabelKey(row.item.activityType))} likeLabel={t('social.like')} unlikeLabel={t('social.unlike')}
            commentsLabel={t('social.commentsCount')} reportLabel={t('social.report')}
          />
        ) : (
          <SocialEpisodeGroupCard
            items={row.items} onLike={handleLike} onProfile={handleProfile} onComments={handleComments} onReport={handleReport}
            isLiking={episode => toggleLike.isPending && toggleLike.variables?.activityId === episode.id}
            watchedLabel={t('social.activity.watchedEpisode')} watchedCountLabel={t('social.watchedEpisodesCount', { count: row.items.length })}
            likeLabel={t('social.like')} unlikeLabel={t('social.unlike')}
            commentsLabel={t('social.commentsCount')} reportLabel={t('social.report', 'Report')}
          />
        )}
        contentContainerStyle={styles.listContent}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.4}
        refreshing={feed.isRefetching && !feed.isFetchingNextPage}
        onRefresh={() => void feed.refetch()}
        ListHeaderComponent={
          <View style={styles.headerContainer}>
          {feed.isError && items.length > 0 ? (
            <View style={styles.inlineError}>
              <AppText variant="caption" muted>{t('social.loadError')}</AppText>
              <Pressable onPress={() => void feed.refetch()}><AppText variant="caption" style={styles.headerAction}>{t('common.retry')}</AppText></Pressable>
            </View>
          ) : null}
          <View style={styles.headerRow}>
            <AppText variant="title" style={styles.title}>{t('social.title')}</AppText>
            <View style={styles.headerActions}>
              <Pressable onPress={() => router.push('/(tabs)/(app-shell)/social-search')}>
                <AppText variant="caption" style={styles.headerAction}>{t('social.search')}</AppText>
              </Pressable>
              <Pressable onPress={() => router.push('/(tabs)/(app-shell)/social-requests')}>
                <AppText variant="caption" style={styles.headerAction}>{t('social.requests')}</AppText>
              </Pressable>
              <Pressable onPress={() => router.push('/(tabs)/(app-shell)/social-notifications')}>
                <AppText variant="caption" style={styles.headerAction}>{t('social.notifications')}{unreadNotifications.data ? ` (${unreadNotifications.data})` : ''}</AppText>
              </Pressable>
              <Pressable onPress={() => router.push('/(tabs)/(app-shell)/social-privacy')}>
                <AppText variant="caption" style={styles.headerAction}>{t('social.privacyTitle')}</AppText>
              </Pressable>
            </View>
          </View>
          </View>
        }
        ListEmptyComponent={<View style={styles.empty}><AppText variant="bodySmall" muted>{t('social.empty')}</AppText></View>}
        ListFooterComponent={feed.isFetchingNextPage ? <ActivityIndicator color={colors.accent} style={styles.footer} /> : feed.isFetchNextPageError ? (
          <View style={styles.inlineError}>
            <AppText variant="caption" muted>{t('social.loadError')}</AppText>
            <AppButton title={t('common.retry')} variant="secondary" onPress={() => void feed.fetchNextPage()} />
          </View>
        ) : null}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  listContent: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl, gap: spacing.md },
  headerContainer: { gap: spacing.sm },
  inlineError: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm, paddingVertical: spacing.xs },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerActions: { flexDirection: 'row', gap: spacing.md },
  headerAction: { color: colors.accent },
  title: { marginTop: spacing.md, marginBottom: spacing.sm },
  poster: { width: 58, height: 86, borderRadius: 8, backgroundColor: colors.surface },
  contentText: { flex: 1, gap: spacing.xs },
  episodeRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: spacing.sm, paddingVertical: spacing.xs },
  episodeTitle: { flex: 1, minWidth: 110 },
  card: { padding: spacing.md, borderRadius: 16, backgroundColor: colors.surface, gap: spacing.md },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surfaceElevated, alignItems: 'center', justifyContent: 'center' },
  actorBlock: { flex: 1 },
  actorName: { fontWeight: '600' },
  contentCard: { flexDirection: 'row', padding: spacing.md, borderRadius: 12, backgroundColor: colors.surfaceElevated, gap: spacing.md },
  actions: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  actionButton: { paddingVertical: spacing.xs },
  liked: { color: colors.accent },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md, padding: spacing.xl },
  footer: { padding: spacing.lg },
});
