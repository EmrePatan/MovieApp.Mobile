import { useCallback } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppText } from '@/components/common/AppText';
import { UserAvatar } from '@/components/common/UserAvatar';
import { AppButton } from '@/components/buttons/AppButton';
import { useSocialProfile, useSocialProfileStatistics, useSocialUserActivities } from '@/features/social/hooks/useSocialQueries';
import { useFollowSocialUser, useReportSocialContent, useSocialBlockMutations, useUnfollowSocialUser } from '@/features/social/hooks/useSocialMutations';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

export default function SocialProfileScreen() {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const profile = useSocialProfile(userId);
  const canViewActivities = !!profile.data && (!profile.data.isPrivate
    || profile.data.followStatus === 'Accepted' || profile.data.followStatus === 'Self');
  const activities = useSocialUserActivities(userId, canViewActivities);
  const statistics = useSocialProfileStatistics(userId, canViewActivities);
  const activityItems = activities.data?.pages.flatMap(page => page.items) ?? [];
  const follow = useFollowSocialUser(userId);
  const unfollow = useUnfollowSocialUser(userId);
  const block = useSocialBlockMutations(userId);
  const report = useReportSocialContent();

  const handleFollow = useCallback(() => {
    if (profile.data?.followStatus === 'Accepted' || profile.data?.followStatus === 'Pending') {
      unfollow.mutate();
    } else {
      follow.mutate();
    }
  }, [follow, profile.data?.followStatus, unfollow]);

  if (profile.isLoading) return <SafeAreaView style={styles.screen}><View style={styles.center}><ActivityIndicator color={colors.accent} /></View></SafeAreaView>;
  if (profile.isError || !profile.data) return <SafeAreaView style={styles.screen}><View style={styles.center}><AppText variant="bodySmall" muted>{profile.isError ? t('social.profileLoadError') : t('social.profileNotFound')}</AppText>{profile.isError ? <Pressable onPress={() => void profile.refetch()}><AppText variant="caption" style={styles.retry}>{t('common.retry')}</AppText></Pressable> : null}</View></SafeAreaView>;

  const item = profile.data;
  const followLabel = item.followStatus === 'Accepted' ? t('social.unfollow') :
    item.followStatus === 'Pending' ? t('social.cancelFollowRequest') : t('social.follow');

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
      <View style={styles.header}>
        <Pressable accessibilityRole="button" accessibilityLabel={t('social.back')} onPress={() => router.back()}><AppText variant="body">‹ {t('social.back')}</AppText></Pressable>
        <View style={styles.profileHeader}>
          <UserAvatar displayName={item.displayName} effectiveAvatarUrl={item.avatarUrl} size={84} textVariant="subtitle" style={styles.avatar} />
          <AppText variant="title">{item.displayName}</AppText>
          <AppText variant="bodySmall" muted>@{item.userName}</AppText>
        </View>
        {item.followStatus !== 'Self' ? (
          <AppButton title={followLabel} variant={item.followStatus === 'Accepted' ? 'secondary' : 'primary'}
            onPress={handleFollow} loading={follow.isPending || unfollow.isPending} />
        ) : null}
        {item.followStatus !== 'Self' ? (
          <AppButton title={t('social.blockUser')} variant="destructive" onPress={() => Alert.alert(
            t('social.blockUserTitle'),
            t('social.blockUserMessage'),
            [{ text: t('social.cancel'), style: 'cancel' }, { text: t('social.blockUser'), style: 'destructive', onPress: () => block.block.mutate(undefined, { onSuccess: () => router.back() }) }],
          )} loading={block.block.isPending} />
        ) : null}
        {item.followStatus !== 'Self' ? (
          <AppButton title={t('social.reportUser')} variant="secondary" onPress={() => Alert.alert(
            t('social.reportUserTitle'),
            t('social.reportUserReason'),
            [
              { text: t('social.spam'), onPress: () => report.mutate({ targetType: 'User', targetId: item.id, reason: 'Spam' }) },
              { text: t('social.reportFakeAccount'), onPress: () => report.mutate({ targetType: 'User', targetId: item.id, reason: 'FakeAccount' }) },
              { text: t('social.harassment'), onPress: () => report.mutate({ targetType: 'User', targetId: item.id, reason: 'Harassment' }) },
              { text: t('social.cancel'), style: 'cancel' },
            ],
          )} loading={report.isPending} />
        ) : null}
        {item.isPrivate && item.followStatus !== 'Accepted' && item.followStatus !== 'Self' ? (
          <AppText variant="bodySmall" muted center>{t('social.privateProfileNotice')}</AppText>
        ) : null}
        <View style={styles.stats}>
          <Pressable accessibilityRole="button" accessibilityLabel={`${item.followersCount} ${t('social.followersCountLabel')}`} onPress={() => router.push(`/(tabs)/(app-shell)/social-people/${item.id}?type=followers`)} style={styles.stat}>
            <AppText variant="subtitle">{item.followersCount}</AppText><AppText variant="caption" muted>{t('social.followersCountLabel')}</AppText>
          </Pressable>
          <Pressable accessibilityRole="button" accessibilityLabel={`${item.followingCount} ${t('social.followingCountLabel')}`} onPress={() => router.push(`/(tabs)/(app-shell)/social-people/${item.id}?type=following`)} style={styles.stat}>
            <AppText variant="subtitle">{item.followingCount}</AppText><AppText variant="caption" muted>{t('social.followingCountLabel')}</AppText>
          </Pressable>
        </View>
        <AppText variant="caption" muted>{t('social.memberSince')} · {new Date(item.createdAt).toLocaleDateString(i18n.language)}</AppText>
      </View>
      <View style={styles.activitySection}>
        <AppText variant="subtitle">{t('social.statistics')}</AppText>
        {statistics.isLoading ? <ActivityIndicator color={colors.accent} /> : null}
        {statistics.data ? (
          <>
            <View style={styles.profileStatsGrid}>
              <View style={styles.profileStatCard}><AppText variant="title">{statistics.data.moviesWatched}</AppText><AppText variant="caption" muted>{t('social.movies')}</AppText></View>
              <View style={styles.profileStatCard}><AppText variant="title">{statistics.data.episodesWatched}</AppText><AppText variant="caption" muted>{t('social.episodes')}</AppText></View>
              <View style={styles.profileStatCard}><AppText variant="title">{statistics.data.ratingsCount}</AppText><AppText variant="caption" muted>{t('social.ratingCount')}</AppText></View>
              <View style={styles.profileStatCard}><AppText variant="title">{statistics.data.reviewsCount}</AppText><AppText variant="caption" muted>{t('social.reviewCount')}</AppText></View>
              <View style={styles.profileStatCard}><AppText variant="title">{statistics.data.favoritesCount}</AppText><AppText variant="caption" muted>{t('social.favoriteCount')}</AppText></View>
            </View>
            {statistics.data.milestones.length > 0 ? (
              <View style={styles.milestoneList}>
                <AppText variant="subtitle">{t('social.achievements')}</AppText>
                {statistics.data.milestones.map(milestone => (
                  <View key={milestone.id} style={styles.milestoneCard}>
                    <AppText variant="body">🏆 {milestone.title}</AppText>
                    <AppText variant="caption" muted>{milestone.description}</AppText>
                  </View>
                ))}
              </View>
            ) : null}
          </>
        ) : null}
        {statistics.isError ? <View style={styles.inlineError}><AppText variant="caption" muted>{t('social.statsLoadError')}</AppText><AppButton title={t('common.retry')} variant="secondary" onPress={() => void statistics.refetch()} /></View> : null}
      </View>
      <View style={styles.activitySection}>
        <AppText variant="subtitle">{t('social.recentActivities')}</AppText>
        {activities.isLoading ? <ActivityIndicator color={colors.accent} /> : null}
        {!activities.isLoading && activityItems.length === 0 ? (
          <AppText variant="bodySmall" muted>{t('social.noActivities')}</AppText>
        ) : null}
        {activityItems.map(activity => (
          <Pressable accessibilityRole="button" accessibilityLabel={`${activity.targetTitle || t('social.contentFallback')} ${getActivityLabel(activity.activityType, t)}`} key={activity.id} style={styles.activityCard}
            onPress={() => router.push(`/(tabs)/(app-shell)/social/${activity.id}`)}>
            <View style={styles.activityText}>
              <AppText variant="body">{activity.targetTitle || t('social.contentFallback')} · {getActivityLabel(activity.activityType, t)}</AppText>
              {activity.targetSubtitle ? <AppText variant="caption" muted>{activity.targetSubtitle}</AppText> : null}
              {activity.ratingScore !== null ? <AppText variant="bodySmall">★ {activity.ratingScore}/10</AppText> : null}
              {activity.reviewExcerpt ? <AppText variant="bodySmall" muted numberOfLines={3}>{activity.reviewExcerpt}</AppText> : null}
              <AppText variant="caption" muted>{new Date(activity.createdAt).toLocaleDateString(i18n.language)}</AppText>
            </View>
            <AppText variant="caption" muted>♥ {activity.likesCount} · {t('social.commentsCount')} {activity.commentsCount}</AppText>
          </Pressable>
        ))}
        {activities.hasNextPage ? (
          <AppButton title={t('social.loadMore')} variant="secondary"
            onPress={() => void activities.fetchNextPage()} loading={activities.isFetchingNextPage} />
        ) : null}
        {activities.isError ? <View style={styles.inlineError}><AppText variant="caption" muted>{t('social.activitiesLoadError')}</AppText><AppButton title={t('common.retry')} variant="secondary" onPress={() => void (activities.isFetchNextPageError ? activities.fetchNextPage() : activities.refetch())} loading={activities.isFetching} /></View> : null}
      </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function getActivityLabel(type: string, t: (key: string) => string): string {
  switch (type) {
    case 'WatchedMovie': return t('social.activity.watchedMovie');
    case 'WatchedEpisode': return t('social.activity.watchedEpisode');
    case 'RatedMovie':
    case 'RatedTvShow': return t('social.activity.rated');
    case 'ReviewedMovie':
    case 'ReviewedTvShow': return t('social.activity.reviewed');
    case 'FavoritedMovie':
    case 'FavoritedTvShow': return t('social.activity.favorited');
    default: return t('social.activity.generic');
  }
}

const styles = StyleSheet.create({
  scrollContent: { paddingBottom: spacing.xl },
  activitySection: { paddingHorizontal: spacing.lg, gap: spacing.md },
  inlineError: { gap: spacing.sm, alignItems: 'flex-start' },
  profileStatsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  profileStatCard: { minWidth: '30%', flexGrow: 1, padding: spacing.md, borderRadius: 12, backgroundColor: colors.surface, alignItems: 'center', gap: spacing.xs },
  milestoneList: { gap: spacing.sm },
  milestoneCard: { padding: spacing.md, borderRadius: 12, backgroundColor: colors.surface, gap: spacing.xs },
  activityCard: { padding: spacing.md, borderRadius: 12, backgroundColor: colors.surface, gap: spacing.sm },
  activityText: { gap: spacing.xs },
  screen: { flex: 1, backgroundColor: colors.background },
  header: { padding: spacing.lg, gap: spacing.lg },
  profileHeader: { alignItems: 'center', gap: spacing.xs, paddingVertical: spacing.lg },
  avatar: { marginBottom: spacing.sm },
  stats: { flexDirection: 'row', justifyContent: 'center', gap: spacing.xxl },
  stat: { alignItems: 'center', gap: spacing.xs },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.lg },
  retry: { color: colors.accent, marginTop: spacing.sm },
});
