import { ActivityIndicator, Pressable, StyleSheet, Switch, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppText } from '@/components/common/AppText';
import { useSocialBlockedUsers, useSocialPrivacy } from '@/features/social/hooks/useSocialQueries';
import { useUnblockSocialUser, useUpdateSocialPrivacy } from '@/features/social/hooks/useSocialMutations';
import type { SocialPrivacySettings } from '@/features/social/types';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

export default function SocialPrivacyScreen() {
  const router = useRouter();
  const query = useSocialPrivacy();
  const blockedUsers = useSocialBlockedUsers();
  const unblock = useUnblockSocialUser();
  const update = useUpdateSocialPrivacy();
  const settings = query.data;

  const change = (patch: Partial<SocialPrivacySettings>) => {
    if (!settings || update.isPending) return;
    update.mutate({ ...settings, ...patch });
  };

  const renderToggle = (label: string, description: string, value: boolean, onChange: (value: boolean) => void) => (
    <View style={styles.row}>
      <View style={styles.copy}>
        <AppText variant="body">{label}</AppText>
        <AppText variant="caption" muted>{description}</AppText>
      </View>
      <Switch value={value} onValueChange={onChange} disabled={update.isPending}
        trackColor={{ false: colors.border, true: colors.accentMuted }}
        thumbColor={value ? colors.accent : colors.textMuted} />
    </View>
  );

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}><AppText variant="body">‹ Geri</AppText></Pressable>
        <AppText variant="title">Sosyal gizlilik</AppText>
        <AppText variant="bodySmall" muted>Profilini ve hangi aktivitelerinin sosyal akışta görüneceğini yönet.</AppText>
      </View>
      {query.isLoading || !settings ? <View style={styles.center}><ActivityIndicator color={colors.accent} /></View> : (
        <View style={styles.list}>
          {renderToggle('Gizli profil', 'Takip isteklerini onaylaman gerekir.', settings.isPrivate, value => change({ isPrivate: value }))}
          {renderToggle('İzleme aktiviteleri', 'İzlediğin film ve bölümler.', settings.showWatched, value => change({ showWatched: value }))}
          {renderToggle('Puanlar', 'Film ve dizi puanların.', settings.showRatings, value => change({ showRatings: value }))}
          {renderToggle('Favoriler', 'Favorilerine eklediklerin.', settings.showFavorites, value => change({ showFavorites: value }))}
          {renderToggle('Yorumlar', 'Yayınladığın değerlendirmeler.', settings.showReviews, value => change({ showReviews: value }))}
          <AppText variant="subtitle" style={styles.sectionTitle}>Engellediğin kullanıcılar</AppText>
          {blockedUsers.isLoading ? <ActivityIndicator color={colors.accent} /> : blockedUsers.data?.length ? blockedUsers.data.map(user => (
            <View key={user.userId} style={styles.row}>
              <View style={styles.copy}>
                <AppText variant="body">{user.displayName}</AppText>
                <AppText variant="caption" muted>@{user.userName}</AppText>
              </View>
              <Pressable disabled={unblock.isPending} onPress={() => unblock.mutate(user.userId)}>
                <AppText variant="caption" style={styles.unblock}>Engeli kaldır</AppText>
              </Pressable>
            </View>
          )) : <AppText variant="caption" muted>Engellediğin kullanıcı yok.</AppText>}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  header: { padding: spacing.lg, gap: spacing.md },
  list: { paddingHorizontal: spacing.lg },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.lg, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  copy: { flex: 1, gap: spacing.xs },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  sectionTitle: { marginTop: spacing.xl },
  unblock: { color: colors.accent },
});
