import { useCallback } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppText } from '@/components/common/AppText';
import { AppButton } from '@/components/buttons/AppButton';
import { useSocialProfile } from '@/features/social/hooks/useSocialQueries';
import { useFollowSocialUser, useUnfollowSocialUser } from '@/features/social/hooks/useSocialMutations';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

export default function SocialProfileScreen() {
  const router = useRouter();
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const profile = useSocialProfile(userId);
  const follow = useFollowSocialUser(userId);
  const unfollow = useUnfollowSocialUser(userId);

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
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}><AppText variant="body">‹ Geri</AppText></Pressable>
        <View style={styles.profileHeader}>
          <View style={styles.avatar}><AppText variant="title">{item.displayName.slice(0, 1).toUpperCase()}</AppText></View>
          <AppText variant="title">{item.displayName}</AppText>
          <AppText variant="bodySmall" muted>@{item.userName}</AppText>
        </View>
        {item.followStatus !== 'Self' ? (
          <AppButton title={followLabel} variant={item.followStatus === 'Accepted' ? 'secondary' : 'primary'}
            onPress={handleFollow} loading={follow.isPending || unfollow.isPending} />
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  header: { padding: spacing.lg, gap: spacing.lg },
  profileHeader: { alignItems: 'center', gap: spacing.xs, paddingVertical: spacing.lg },
  avatar: { width: 84, height: 84, borderRadius: 42, backgroundColor: colors.surfaceElevated, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.sm },
  stats: { flexDirection: 'row', justifyContent: 'center', gap: spacing.xxl },
  stat: { alignItems: 'center', gap: spacing.xs },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.lg },
});
