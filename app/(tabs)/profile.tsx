import { useCallback } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { createIosRefreshControl } from '@/components/refresh/createIosRefreshControl';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { isApiError } from '@/api/errors';
import { useAuth } from '@/auth/useAuth';
import { AppButton } from '@/components/buttons/AppButton';
import { AppText } from '@/components/common/AppText';
import { ErrorView } from '@/components/common/ErrorView';
import { Screen } from '@/components/common/Screen';
import { ProfileHero } from '@/features/profile/components/ProfileHero';
import { ProfileMenuRow, ProfileSection } from '@/features/profile/components/ProfileSection';
import { useLocalePreference } from '@/features/locale/hooks/useLocalePreference';
import { useRegionalPreference } from '@/features/regions/hooks/useRegionalPreference';
import { getRegionLabel } from '@/features/regions/region-options';
import { getLanguageLabel } from '@/i18n/locale-tags';
import { useCurrentProfile } from '@/features/profile/hooks/useCurrentProfile';
import { spacing } from '@/theme/spacing';

export default function ProfileScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { logout } = useAuth();
  const profileQuery = useCurrentProfile();
  const { region: userRegion } = useRegionalPreference();
  const { language } = useLocalePreference();

  const profile = profileQuery.data;
  const isRefreshing = profileQuery.isRefetching && !profileQuery.isLoading;

  const handleRefresh = useCallback(() => {
    void profileQuery.refetch();
  }, [profileQuery]);

  const handleLogout = useCallback(() => {
    void logout();
  }, [logout]);

  if (profileQuery.isLoading && !profile) {
    return (
      <Screen>
        <View style={styles.loadingContainer}>
          <AppText variant="bodySmall" muted>
            {t('profile.loadingProfile')}
          </AppText>
        </View>
      </Screen>
    );
  }

  if (profileQuery.isError && !profile) {
    const message = isApiError(profileQuery.error)
      ? profileQuery.error.userMessage
      : t('profile.loadProfileError');

    return (
      <Screen>
        <View style={styles.errorContainer}>
          <ErrorView message={message} onRetry={() => void profileQuery.refetch()} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={createIosRefreshControl({
          refreshing: isRefreshing,
          onRefresh: handleRefresh,
        })}
      >
        {profile ? <ProfileHero profile={profile} /> : null}

        <ProfileSection title={t('profile.preferences')}>
          <ProfileMenuRow
            label={t('profile.language')}
            subtitle={t('profile.languageSubtitle', {
              language: getLanguageLabel(language, language),
            })}
            onPress={() => router.push('/profile/language')}
          />
          <ProfileMenuRow
            label={t('profile.region')}
            subtitle={t('profile.regionSubtitle', { region: getRegionLabel(userRegion) })}
            onPress={() => router.push('/profile/region')}
          />
        </ProfileSection>

        <ProfileSection title={t('profile.app')}>
          <ProfileMenuRow
            label={t('profile.about')}
            subtitle={t('profile.aboutMenuSubtitle')}
            onPress={() => router.push('/profile/about')}
          />
        </ProfileSection>

        <ProfileSection title={t('profile.account')}>
          <ProfileMenuRow
            label={t('profile.editProfile')}
            onPress={() => router.push('/profile/edit')}
          />
          <ProfileMenuRow
            label={t('profile.changeEmail')}
            onPress={() => router.push('/profile/email')}
          />
          <ProfileMenuRow
            label={t('profile.changePassword')}
            onPress={() => router.push('/profile/password')}
          />
          <ProfileMenuRow
            label={t('profile.deleteAccount')}
            destructive
            onPress={() => router.push('/profile/delete-account')}
          />
        </ProfileSection>

        <AppButton title={t('profile.signOut')} variant="ghost" onPress={handleLogout} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    gap: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
  },
});
