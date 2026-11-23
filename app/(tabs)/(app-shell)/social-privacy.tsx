import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppSwitch } from '@/components/common/AppSwitch';
import { AppText } from '@/components/common/AppText';
import { SocialSubscreenHeader } from '@/features/social/components/SocialSubscreenHeader';
import { SocialUserListRow } from '@/features/social/components/SocialUserListRow';
import { useSocialBlockedUsers, useSocialPrivacy } from '@/features/social/hooks/useSocialQueries';
import { useUnblockSocialUser, useUpdateSocialPrivacy } from '@/features/social/hooks/useSocialMutations';
import type { SocialPrivacySettings } from '@/features/social/types';
import { authTypography } from '@/features/auth/auth-typography';
import { colors } from '@/theme/colors';
import { glass } from '@/theme/glass';
import { layout } from '@/theme/layout';
import { spacing } from '@/theme/spacing';

export default function SocialPrivacyScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const query = useSocialPrivacy();
  const blockedUsers = useSocialBlockedUsers();
  const unblock = useUnblockSocialUser();
  const update = useUpdateSocialPrivacy();
  const settings = query.data;

  const change = (patch: Partial<SocialPrivacySettings>) => {
    if (!settings || update.isPending) return;
    update.mutate({ ...settings, ...patch });
  };

  const renderToggle = (
    label: string,
    description: string,
    value: boolean,
    onChange: (value: boolean) => void,
  ) => (
    <View style={styles.row}>
      <View style={styles.copy}>
        <AppText style={styles.rowTitle}>{label}</AppText>
        <AppText style={styles.rowDesc}>{description}</AppText>
      </View>
      <AppSwitch
        accessibilityLabel={label}
        accessibilityHint={description}
        value={value}
        onValueChange={onChange}
        disabled={update.isPending}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <SocialSubscreenHeader
        title={t('social.privacyTitle')}
        subtitle={t('social.privacyDescription')}
        onBack={() => router.back()}
      />
      {query.isError ? (
        <View style={styles.center}>
          <AppText style={styles.empty}>{t('social.privacyLoadError')}</AppText>
          <Pressable onPress={() => void query.refetch()}>
            <AppText style={styles.link}>{t('common.retry')}</AppText>
          </Pressable>
        </View>
      ) : query.isLoading || !settings ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.accent} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.list}>
          {renderToggle(
            t('social.privateProfile'),
            t('social.privateProfileDescription'),
            settings.isPrivate,
            (value) => change({ isPrivate: value }),
          )}
          {renderToggle(
            t('social.watchedActivities'),
            t('social.watchedDescription'),
            settings.showWatched,
            (value) => change({ showWatched: value }),
          )}
          {renderToggle(
            t('social.ratings'),
            t('social.ratingsDescription'),
            settings.showRatings,
            (value) => change({ showRatings: value }),
          )}
          {renderToggle(
            t('social.favorites'),
            t('social.favoritesDescription'),
            settings.showFavorites,
            (value) => change({ showFavorites: value }),
          )}
          {renderToggle(
            t('social.reviews'),
            t('social.reviewsDescription'),
            settings.showReviews,
            (value) => change({ showReviews: value }),
          )}

          <AppText style={styles.sectionTitle}>{t('social.blockedUsers')}</AppText>
          {blockedUsers.isLoading ? (
            <ActivityIndicator color={colors.accent} />
          ) : blockedUsers.isError ? (
            <Pressable onPress={() => void blockedUsers.refetch()}>
              <AppText style={styles.link}>{t('common.retry')}</AppText>
            </Pressable>
          ) : blockedUsers.data?.length ? (
            <View style={styles.blockedList}>
              {blockedUsers.data.map((user) => (
                <SocialUserListRow
                  key={user.userId}
                  displayName={user.displayName}
                  userName={user.userName}
                  trailing={
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={`${t('social.unblock')} ${user.displayName}`}
                      disabled={unblock.isPending}
                      onPress={() => unblock.mutate(user.userId)}
                    >
                      <AppText style={styles.link}>{t('social.unblock')}</AppText>
                    </Pressable>
                  }
                />
              ))}
            </View>
          ) : (
            <AppText style={styles.empty}>{t('social.noBlockedUsers')}</AppText>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  list: {
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingBottom: spacing.xxl,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.sm,
    padding: spacing.md,
    borderRadius: 20,
    backgroundColor: glass.panel,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: glass.hairline,
  },
  copy: { flex: 1, gap: 4 },
  rowTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  rowDesc: {
    fontSize: 12,
    lineHeight: 16,
    color: colors.textMuted,
  },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  sectionTitle: {
    marginTop: spacing.xl,
    marginBottom: spacing.md,
    fontFamily: authTypography.wordmarkSemibold,
    fontSize: 20,
    color: colors.textPrimary,
  },
  blockedList: { gap: spacing.sm },
  empty: { color: colors.textMuted, fontSize: 13 },
  link: { color: colors.accent, fontWeight: '600', fontSize: 13 },
});
