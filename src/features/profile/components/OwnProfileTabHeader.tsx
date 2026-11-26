import { useMemo } from 'react';
import { ActivityIndicator, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { GlassSurface } from '@/components/common/GlassSurface';
import { UserAvatar } from '@/components/common/UserAvatar';
import { useAuth } from '@/auth/useAuth';
import { OwnAchievementLevelBadge } from '@/features/achievements/components/AchievementLevelBadge';
import { useCurrentProfile } from '@/features/profile/hooks/useCurrentProfile';
import { useProfileAvatarEditor } from '@/features/profile/hooks/useProfileAvatarEditor';
import {
  PROFILE_AVATAR_SIZE,
  ProfileAvatarRing,
  ProfileIdentityHeader,
} from '@/features/profile/components/ProfileIdentityHeader';
import { useOwnProfileCover } from '@/features/profile/hooks/useOwnProfileCover';
import {
  useSocialProfile,
  useSocialProfileStatistics,
} from '@/features/social/hooks/useSocialQueries';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

const ACTION_SIZE = 40;

export function OwnProfileTabHeader() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { user } = useAuth();
  const userId = user?.id ?? '';
  const profileQuery = useSocialProfile(userId);
  const statistics = useSocialProfileStatistics(userId);
  const currentProfile = useCurrentProfile();
  const { openAvatarActions, isAvatarBusy } = useProfileAvatarEditor(currentProfile.data);

  const profile = profileQuery.data;
  const displayName = profile?.displayName ?? user?.displayName ?? '';
  const userName = profile?.userName ?? user?.userName ?? '';
  const avatarUrl = profile?.avatarUrl ?? user?.effectiveAvatarUrl ?? null;
  const { coverUri, isCustomPhotoCover } = useOwnProfileCover();

  const memberSinceLabel = useMemo(() => {
    const createdAt = profile?.createdAt ?? currentProfile.data?.createdAt;
    if (!createdAt) return null;
    const date = new Date(createdAt).toLocaleDateString(i18n.language, {
      month: 'long',
      year: 'numeric',
    });
    return { date, full: t('profile.memberSince', { date }) };
  }, [currentProfile.data?.createdAt, i18n.language, profile?.createdAt, t]);

  const bio = (profile?.bio ?? currentProfile.data?.bio)?.trim() || null;
  const socialLinks = profile?.socialLinks ?? currentProfile.data?.socialLinks ?? null;

  if (!displayName) return null;

  const openPeople = (type: 'followers' | 'following') => {
    if (!profile?.id) return;
    router.push(`/(tabs)/(app-shell)/social-people/${profile.id}?type=${type}`);
  };

  const counts = profile
    ? [
        {
          key: 'followers',
          value: profile.followersCount,
          label: t('social.followersCountLabel'),
          onPress: () => openPeople('followers'),
        },
        {
          key: 'following',
          value: profile.followingCount,
          label: t('social.followingCountLabel'),
          onPress: () => openPeople('following'),
        },
        ...(statistics.data
          ? [
              {
                key: 'reviews',
                value: statistics.data.reviewsCount,
                label: t('social.reviewCount'),
                onPress: () => router.push('/my-comments'),
              },
            ]
          : []),
      ]
    : [];

  return (
    <ProfileIdentityHeader
      testID="own-profile-program-card"
      bleed
      horizontalPadding={spacing.lg}
      coverUri={coverUri}
      isCustomPhotoCover={isCustomPhotoCover}
      topRight={
        <>
          <GlassSurface style={styles.actionGlass}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('profile.editProfile')}
              onPress={() => router.push('/profile/edit')}
              style={({ pressed }) => [styles.actionHit, pressed && styles.pressed]}
            >
              <Ionicons name="create-outline" size={18} color={colors.textPrimary} />
            </Pressable>
          </GlassSurface>
          <GlassSurface style={styles.actionGlass}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('profile.signInSecurityTitle')}
              onPress={() => router.push('/(tabs)/profile')}
              style={({ pressed }) => [styles.actionHit, pressed && styles.pressed]}
            >
              <Ionicons name="settings-outline" size={18} color={colors.textPrimary} />
            </Pressable>
          </GlassSurface>
        </>
      }
      avatar={
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('profile.avatarEditTitle')}
          onPress={openAvatarActions}
          disabled={isAvatarBusy}
          style={({ pressed }) => [styles.avatarHit, pressed && styles.pressed]}
        >
          <ProfileAvatarRing>
            <UserAvatar
              displayName={displayName}
              effectiveAvatarUrl={avatarUrl}
              size={PROFILE_AVATAR_SIZE}
              textVariant="subtitle"
              accessibilityLabel={displayName}
            />
            <GlassSurface style={styles.avatarBadge}>
              {isAvatarBusy ? (
                <ActivityIndicator color={colors.textPrimary} size="small" />
              ) : (
                <Ionicons name="camera" size={12} color={colors.textPrimary} />
              )}
            </GlassSurface>
          </ProfileAvatarRing>
        </Pressable>
      }
      displayName={displayName}
      seal={<OwnAchievementLevelBadge />}
      handle={userName ? `@${userName}` : ''}
      handleNote={memberSinceLabel?.date ?? null}
      bio={bio}
      socialLinks={socialLinks}
      counts={counts}
      statistics={statistics.data}
    />
  );
}

const styles = StyleSheet.create({
  actionGlass: {
    width: ACTION_SIZE,
    height: ACTION_SIZE,
    borderRadius: ACTION_SIZE / 2,
  },
  actionHit: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarHit: {
    alignSelf: 'flex-start',
    borderRadius: 999,
  },
  avatarBadge: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.88,
  },
});
