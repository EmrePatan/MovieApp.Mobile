import { useMemo } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from '@/components/common/AppText';
import { GlassSurface } from '@/components/common/GlassSurface';
import { UserAvatar } from '@/components/common/UserAvatar';
import { useAuth } from '@/auth/useAuth';
import { OwnAchievementLevelBadge } from '@/features/achievements/components/AchievementLevelBadge';
import { useAuthFonts } from '@/features/auth/useAuthFonts';
import { authTypography } from '@/features/auth/auth-typography';
import { useCurrentProfile } from '@/features/profile/hooks/useCurrentProfile';
import { useProfileAvatarEditor } from '@/features/profile/hooks/useProfileAvatarEditor';
import { ProfileInlineCounts } from '@/features/profile/components/ProfileInlineCounts';
import { OwnProfileCinemaStats } from '@/features/profile/components/OwnProfileCinemaStats';
import { ProfileSocialLinksRail } from '@/features/profile/components/ProfileSocialLinksRow';
import { filledSocialLinks } from '@/features/profile/utils/profile-social-links';
import { COVER_ASPECT } from '@/features/profile/utils/cover-crop';
import { useOwnProfileCover } from '@/features/profile/hooks/useOwnProfileCover';
import {
  useSocialProfile,
  useSocialProfileStatistics,
} from '@/features/social/hooks/useSocialQueries';
import { colors } from '@/theme/colors';
import { glass } from '@/theme/glass';
import { spacing } from '@/theme/spacing';

const AVATAR_SIZE = 76;
const ACTION_SIZE = 40;

export function OwnProfileTabHeader() {
  useAuthFonts();
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const { user } = useAuth();
  const userId = user?.id ?? '';
  const profileQuery = useSocialProfile(userId);
  const statistics = useSocialProfileStatistics(userId);
  const currentProfile = useCurrentProfile();
  const { openAvatarActions, isAvatarBusy } = useProfileAvatarEditor(currentProfile.data);

  const coverImageHeight = Math.round(windowWidth / COVER_ASPECT);
  const coverHeight = insets.top + coverImageHeight;
  const avatarOverlap = Math.round(AVATAR_SIZE / 2);

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
  const hasSocialLinks = filledSocialLinks(socialLinks).length > 0;

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
          icon: hasSocialLinks ? undefined : 'people-outline',
        },
        {
          key: 'following',
          value: profile.followingCount,
          label: t('social.followingCountLabel'),
          onPress: () => openPeople('following'),
          icon: hasSocialLinks ? undefined : 'person-outline',
        },
        ...(statistics.data
          ? [
              {
                key: 'reviews',
                value: statistics.data.reviewsCount,
                label: t('social.reviewCount'),
                onPress: () => router.push('/profile/my-comments'),
                icon: hasSocialLinks ? undefined : 'star-outline',
              },
            ]
          : []),
      ]
    : [];

  return (
    <View style={[styles.stage, { width: windowWidth }]} testID="own-profile-program-card">
      <View style={[styles.coverBleed, { height: coverHeight }]}>
        {coverUri ? (
          <Image
            source={{ uri: coverUri }}
            style={[styles.coverImage, { height: coverImageHeight }]}
            contentFit="cover"
            contentPosition={isCustomPhotoCover ? 'center' : 'top'}
            cachePolicy="memory-disk"
            accessibilityElementsHidden
          />
        ) : (
          <LinearGradient
            colors={['#2A1F18', '#141018', colors.background]}
            start={{ x: 0, y: 0.2 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
        )}
        <LinearGradient
          colors={['rgba(10,10,15,0.35)', 'rgba(10,10,15,0.15)', colors.background]}
          locations={[0, 0.4, 1]}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />
      </View>

      <View style={[styles.floatingActions, { top: insets.top + spacing.sm }]}>
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
      </View>

      <View style={[styles.body, { marginTop: -avatarOverlap }]}>
        <View style={styles.identityRow}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('profile.avatarEditTitle')}
            onPress={openAvatarActions}
            disabled={isAvatarBusy}
            style={({ pressed }) => [styles.avatarHit, pressed && styles.pressed]}
          >
            <View style={styles.avatarRing}>
              <UserAvatar
                displayName={displayName}
                effectiveAvatarUrl={avatarUrl}
                size={AVATAR_SIZE}
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
            </View>
          </Pressable>

          <View style={[styles.identityCopy, { paddingTop: avatarOverlap + spacing.xs }]}>
            <View style={styles.nameRow}>
              <AppText numberOfLines={1} style={styles.name}>
                {displayName}
              </AppText>
              <OwnAchievementLevelBadge />
            </View>
            {userName ? (
              <AppText numberOfLines={1} style={styles.handle}>
                @{userName}
              </AppText>
            ) : null}
            {memberSinceLabel ? (
              <View style={styles.joinedLine} accessible accessibilityLabel={memberSinceLabel.full}>
                <Ionicons name="calendar-outline" size={12} color={colors.textSecondary} />
                <AppText style={styles.joinedText} numberOfLines={1}>
                  {memberSinceLabel.date}
                </AppText>
              </View>
            ) : null}
          </View>
        </View>

        {bio ? (
          <AppText style={styles.bio} numberOfLines={4}>
            {bio}
          </AppText>
        ) : null}

        <ProfileInlineCounts
          counts={counts}
          spread={false}
          trailing={hasSocialLinks ? <ProfileSocialLinksRail links={socialLinks} /> : null}
        />

        {statistics.data ? <OwnProfileCinemaStats statistics={statistics.data} /> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  stage: {
    marginLeft: -spacing.lg,
    marginBottom: spacing.sm,
  },
  coverImage: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  coverBleed: {
    backgroundColor: '#120E16',
    overflow: 'hidden',
  },
  floatingActions: {
    position: 'absolute',
    right: spacing.lg,
    flexDirection: 'row',
    gap: spacing.sm,
  },
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
  body: {
    paddingHorizontal: spacing.lg,
  },
  identityRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  avatarHit: {
    borderRadius: 999,
  },
  avatarRing: {
    borderRadius: 999,
    borderWidth: 2,
    borderColor: colors.accent,
    backgroundColor: colors.background,
    padding: 2,
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
  identityCopy: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  name: {
    flexShrink: 1,
    fontFamily: authTypography.wordmarkSemibold,
    fontSize: 24,
    lineHeight: 30,
    color: colors.textPrimary,
    letterSpacing: -0.4,
  },
  handle: {
    fontSize: 13,
    lineHeight: 16,
    color: colors.textSecondary,
  },
  bio: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.textPrimary,
    opacity: 0.88,
    marginTop: spacing.md,
    paddingLeft: spacing.md,
    borderLeftWidth: 2,
    borderLeftColor: glass.accentBorder,
  },
  joinedLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 2,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  joinedText: {
    fontSize: 12,
    lineHeight: 16,
    color: colors.textSecondary,
  },
  pressed: {
    opacity: 0.88,
  },
});
