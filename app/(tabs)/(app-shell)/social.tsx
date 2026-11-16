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
  const dateLabel = new Date(item.createdAt).toLocaleDateString();
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
          <AppText variant="subtitle">{item.targetTitle || 'Content'}</AppText>
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

export default function SocialFeedScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const feed = useSocialFeed();
  const unreadNotifications = useSocialUnreadNotificationCount();
  const toggleLike = useToggleSocialActivityLike();
  const report = useReportSocialContent();
  const items = useMemo(() => feed.data?.pages.flatMap(page => page.items) ?? [], [feed.data?.pages]);

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
    Alert.alert('Paylaşımı bildir', 'Bildirim nedenini seç.', [
      { text: 'Spam', onPress: () => report.mutate({ targetType: 'Activity', targetId: item.id, reason: 'Spam' }) },
      { text: 'Uygunsuz içerik', onPress: () => report.mutate({ targetType: 'Activity', targetId: item.id, reason: 'Inappropriate' }) },
      { text: 'Taciz', onPress: () => report.mutate({ targetType: 'Activity', targetId: item.id, reason: 'Harassment' }) },
      { text: 'Vazgeç', style: 'cancel' },
    ]);
  }, [report]);

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
        data={items}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <SocialActivityCard
            item={item}
            onLike={handleLike}
            onProfile={handleProfile}
            onComments={handleComments}
            onReport={handleReport}
            isLiking={toggleLike.isPending && toggleLike.variables?.activityId === item.id}
            activityLabel={t(getActivityLabelKey(item.activityType))}
            likeLabel={t('social.like')}
            unlikeLabel={t('social.unlike')}
            commentsLabel={t('social.commentsCount')}
            reportLabel={t('social.report', 'Report')}
          />
        )}
        contentContainerStyle={styles.listContent}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.4}
        refreshing={feed.isRefetching && !feed.isFetchingNextPage}
        onRefresh={() => void feed.refetch()}
        ListHeaderComponent={
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
                <AppText variant="caption" style={styles.headerAction}>Gizlilik</AppText>
              </Pressable>
            </View>
          </View>
        }
        ListEmptyComponent={<View style={styles.empty}><AppText variant="bodySmall" muted>{t('social.empty')}</AppText></View>}
        ListFooterComponent={feed.isFetchingNextPage ? <ActivityIndicator color={colors.accent} style={styles.footer} /> : null}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  listContent: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl, gap: spacing.md },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerActions: { flexDirection: 'row', gap: spacing.md },
  headerAction: { color: colors.accent },
  title: { marginTop: spacing.md, marginBottom: spacing.sm },
  poster: { width: 58, height: 86, borderRadius: 8, backgroundColor: colors.surface },
  contentText: { flex: 1, gap: spacing.xs },
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
