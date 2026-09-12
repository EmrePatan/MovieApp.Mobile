import { useCallback } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { isApiError } from '@/api/errors';
import { useAuth } from '@/auth/useAuth';
import { AppButton } from '@/components/buttons/AppButton';
import { AppText } from '@/components/common/AppText';
import { ErrorView } from '@/components/common/ErrorView';
import { Screen } from '@/components/common/Screen';
import { ProfileMenuRow, ProfileSection } from '@/features/profile/components/ProfileSection';
import { ProfileStatisticsGrid } from '@/features/profile/components/ProfileStatisticsGrid';
import { useCurrentProfile } from '@/features/profile/hooks/useCurrentProfile';
import { useProfileStatistics } from '@/features/profile/hooks/useProfileStatistics';
import { formatIsoDate } from '@/utils/format';
import { borderRadius, spacing } from '@/theme/spacing';
import { colors } from '@/theme/colors';

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
        <AppText variant="title">Profile</AppText>

        <View style={styles.accountCard}>
          <AppText variant="subtitle">{profile?.displayName ?? 'MovieApp member'}</AppText>
          <AppText variant="bodySmall" muted>
            {profile?.email ?? '—'}
          </AppText>
          {profile?.userName ? (
            <AppText variant="caption" muted style={styles.username}>
              @{profile.userName}
            </AppText>
          ) : null}
          {profile?.createdAt ? (
            <AppText variant="caption" muted>
              Member since {formatIsoDate(profile.createdAt.slice(0, 10))}
            </AppText>
          ) : null}
        </View>

        <ProfileSection title="Statistics" variant="plain">
          {statisticsQuery.isLoading && !statisticsQuery.data ? (
            <AppText variant="bodySmall" muted>
              Loading statistics...
            </AppText>
          ) : statisticsQuery.isError ? (
            <ErrorView
              message={
                isApiError(statisticsQuery.error)
                  ? statisticsQuery.error.userMessage
                  : 'Unable to load statistics.'
              }
              onRetry={() => void statisticsQuery.refetch()}
              retryLabel="Retry"
            />
          ) : statisticsQuery.data ? (
            <ProfileStatisticsGrid statistics={statisticsQuery.data} />
          ) : null}
        </ProfileSection>

        <ProfileSection title="Library">
          <ProfileMenuRow
            label="Watchlists"
            subtitle="Your personal lists"
            onPress={() => router.push('/(tabs)/watchlist')}
          />
          <ProfileMenuRow
            label="Watch History"
            subtitle="Recently watched content"
            onPress={() => router.push('/watch-history')}
          />
        </ProfileSection>

        <ProfileSection title="Account Settings">
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
    gap: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  accountCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.xs,
  },
  username: {
    marginTop: spacing.xs,
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
