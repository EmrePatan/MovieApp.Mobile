import { useCallback } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { isApiError } from '@/api/errors';
import { useAuth } from '@/auth/useAuth';
import { AppButton } from '@/components/buttons/AppButton';
import { AppText } from '@/components/common/AppText';
import { ErrorView } from '@/components/common/ErrorView';
import { Screen } from '@/components/common/Screen';
import { ProfileAnalyticsDashboard } from '@/features/profile/components/ProfileAnalyticsDashboard';
import { ProfileHero } from '@/features/profile/components/ProfileHero';
import { ProfileMenuRow, ProfileSection } from '@/features/profile/components/ProfileSection';
import { useCurrentProfile } from '@/features/profile/hooks/useCurrentProfile';
import { useProfileStatistics } from '@/features/profile/hooks/useProfileStatistics';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

export default function ProfileScreen() {
  const router = useRouter();
  const { logout } = useAuth();
  const profileQuery = useCurrentProfile();
  const statisticsQuery = useProfileStatistics();

  const profile = profileQuery.data;
  const isRefreshing =
    (profileQuery.isRefetching && !profileQuery.isLoading) ||
    (statisticsQuery.isRefetching && !statisticsQuery.isLoading);

  const handleRefresh = useCallback(() => {
    void profileQuery.refetch();
    void statisticsQuery.refetch();
  }, [profileQuery, statisticsQuery]);

  const handleLogout = useCallback(() => {
    void logout();
  }, [logout]);

  if (profileQuery.isLoading && !profile) {
    return (
      <Screen>
        <View style={styles.loadingContainer}>
          <AppText variant="bodySmall" muted>
            Loading profile...
          </AppText>
        </View>
      </Screen>
    );
  }

  if (profileQuery.isError && !profile) {
    const message = isApiError(profileQuery.error)
      ? profileQuery.error.userMessage
      : 'Unable to load your profile. Please try again.';

    return (
      <Screen>
        <View style={styles.errorContainer}>
          <ErrorView
            message={message}
            onRetry={() => void profileQuery.refetch()}
            retryLabel="Try Again"
          />
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor={colors.accent} />
        }
      >
        {profile ? <ProfileHero profile={profile} /> : null}

        {statisticsQuery.isLoading && !statisticsQuery.data ? (
          <AppText variant="bodySmall" muted>
            Loading your insights...
          </AppText>
        ) : statisticsQuery.isError ? (
          <ErrorView
            message={
              isApiError(statisticsQuery.error)
                ? statisticsQuery.error.userMessage
                : 'Unable to load your statistics.'
            }
            onRetry={() => void statisticsQuery.refetch()}
            retryLabel="Retry"
          />
        ) : statisticsQuery.data ? (
          <ProfileAnalyticsDashboard statistics={statisticsQuery.data} />
        ) : null}

        <ProfileSection title="Account">
          <ProfileMenuRow
            label="Edit profile"
            onPress={() => router.push('/profile/edit')}
          />
          <ProfileMenuRow
            label="Change email"
            onPress={() => router.push('/profile/email')}
          />
          <ProfileMenuRow
            label="Change password"
            onPress={() => router.push('/profile/password')}
          />
          <ProfileMenuRow
            label="Delete account"
            destructive
            onPress={() => router.push('/profile/delete-account')}
          />
        </ProfileSection>

        <AppButton title="Sign out" variant="ghost" onPress={handleLogout} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    gap: spacing.xl,
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
