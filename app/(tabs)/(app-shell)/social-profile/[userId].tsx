import { useCallback } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
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
  if (profile.isError || !profile.data) return <SafeAreaView style={styles.screen}><View style={styles.center}><AppText variant="bodySmall" muted>Profil bulunamadı veya gizli.</AppText></View></SafeAreaView>;

  const item = profile.data;
  const followLabel = item.followStatus === 'Accepted' ? 'Takibi bırak' :
    item.followStatus === 'Pending' ? 'İsteği iptal et' : 'Takip et';

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}><AppText variant="body">‹ Geri</AppText></Pressable>
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
          <AppButton title="Kullanıcıyı engelle" variant="destructive" onPress={() => Alert.alert(
            'Kullanıcı engellensin mi?',
            'Bu kullanıcıyla aranızdaki takip ilişkileri kaldırılır.',
            [{ text: 'Vazgeç', style: 'cancel' }, { text: 'Engelle', style: 'destructive', onPress: () => block.block.mutate() }],
          )} loading={block.block.isPending} />
        ) : null}
        {item.followStatus !== 'Self' ? (
          <AppButton title="Kullanıcıyı şikâyet et" variant="secondary" onPress={() => Alert.alert(
            'Kullanıcıyı bildir',
            'Bildirim nedenini seç.',
            [
              { text: 'Spam', onPress: () => report.mutate({ targetType: 'User', targetId: item.id, reason: 'Spam' }) },
              { text: 'Sahte hesap', onPress: () => report.mutate({ targetType: 'User', targetId: item.id, reason: 'FakeAccount' }) },
              { text: 'Taciz', onPress: () => report.mutate({ targetType: 'User', targetId: item.id, reason: 'Harassment' }) },
              { text: 'Vazgeç', style: 'cancel' },
            ],
          )} loading={report.isPending} />
        ) : null}
        {item.isPrivate && item.followStatus !== 'Accepted' && item.followStatus !== 'Self' ? (
          <AppText variant="bodySmall" muted center>Bu profil gizli. Paylaşımları görmek için takip isteği gönder.</AppText>
        ) : null}
        <View style={styles.stats}>
          <Pressable onPress={() => router.push(`/(tabs)/(app-shell)/social-people/${item.id}?type=followers`)} style={styles.stat}>
            <AppText variant="subtitle">{item.followersCount}</AppText><AppText variant="caption" muted>Takipçi</AppText>
          </Pressable>
          <Pressable onPress={() => router.push(`/(tabs)/(app-shell)/social-people/${item.id}?type=following`)} style={styles.stat}>
            <AppText variant="subtitle">{item.followingCount}</AppText><AppText variant="caption" muted>Takip</AppText>
          </Pressable>
        </View>
        <AppText variant="caption" muted>Movie Cave üyesi · {new Date(item.createdAt).toLocaleDateString()}</AppText>
      </View>
      <View style={styles.activitySection}>
        <AppText variant="subtitle">İstatistikler</AppText>
        {statistics.isLoading ? <ActivityIndicator color={colors.accent} /> : null}
        {statistics.data ? (
          <>
            <View style={styles.profileStatsGrid}>
              <View style={styles.profileStatCard}><AppText variant="title">{statistics.data.moviesWatched}</AppText><AppText variant="caption" muted>Film</AppText></View>
              <View style={styles.profileStatCard}><AppText variant="title">{statistics.data.episodesWatched}</AppText><AppText variant="caption" muted>Bölüm</AppText></View>
              <View style={styles.profileStatCard}><AppText variant="title">{statistics.data.ratingsCount}</AppText><AppText variant="caption" muted>Puan</AppText></View>
              <View style={styles.profileStatCard}><AppText variant="title">{statistics.data.reviewsCount}</AppText><AppText variant="caption" muted>İnceleme</AppText></View>
              <View style={styles.profileStatCard}><AppText variant="title">{statistics.data.favoritesCount}</AppText><AppText variant="caption" muted>Favori</AppText></View>
            </View>
            {statistics.data.milestones.length > 0 ? (
              <View style={styles.milestoneList}>
                <AppText variant="subtitle">Başarımlar</AppText>
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
        {statistics.isError ? <AppText variant="caption" muted>İstatistikler yüklenemedi.</AppText> : null}
      </View>
      <View style={styles.activitySection}>
        <AppText variant="subtitle">Son aktiviteler</AppText>
        {activities.isLoading ? <ActivityIndicator color={colors.accent} /> : null}
        {!activities.isLoading && activityItems.length === 0 ? (
          <AppText variant="bodySmall" muted>Henüz görüntülenecek aktivite yok.</AppText>
        ) : null}
        {activityItems.map(activity => (
          <Pressable key={activity.id} style={styles.activityCard}
            onPress={() => router.push(`/(tabs)/(app-shell)/social/${activity.id}`)}>
            <View style={styles.activityText}>
              <AppText variant="body">{activity.targetTitle || 'İçerik'} · {getActivityLabel(activity.activityType)}</AppText>
              {activity.targetSubtitle ? <AppText variant="caption" muted>{activity.targetSubtitle}</AppText> : null}
              {activity.ratingScore !== null ? <AppText variant="bodySmall">★ {activity.ratingScore}/10</AppText> : null}
              {activity.reviewExcerpt ? <AppText variant="bodySmall" muted numberOfLines={3}>{activity.reviewExcerpt}</AppText> : null}
              <AppText variant="caption" muted>{new Date(activity.createdAt).toLocaleDateString()}</AppText>
            </View>
            <AppText variant="caption" muted>♥ {activity.likesCount} · Yorum {activity.commentsCount}</AppText>
          </Pressable>
        ))}
        {activities.hasNextPage ? (
          <AppButton title="Daha fazla yükle" variant="secondary"
            onPress={() => void activities.fetchNextPage()} loading={activities.isFetchingNextPage} />
        ) : null}
        {activities.isError ? <AppText variant="caption" muted>Aktiviteler yüklenemedi.</AppText> : null}
      </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function getActivityLabel(type: string): string {
  switch (type) {
    case 'WatchedMovie': return 'izledi';
    case 'WatchedEpisode': return 'bölüm izledi';
    case 'RatedMovie':
    case 'RatedTvShow': return 'puan verdi';
    case 'ReviewedMovie':
    case 'ReviewedTvShow': return 'inceleme yazdı';
    case 'FavoritedMovie':
    case 'FavoritedTvShow': return 'favorilerine ekledi';
    default: return 'aktivite yaptı';
  }
}

const styles = StyleSheet.create({
  scrollContent: { paddingBottom: spacing.xl },
  activitySection: { paddingHorizontal: spacing.lg, gap: spacing.md },
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
});
