import { useMemo, useState } from 'react';
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
import { UserAvatar } from '@/components/common/UserAvatar';
import { useAuth } from '@/auth/useAuth';
import { useAuthFonts } from '@/features/auth/useAuthFonts';
import { authTypography } from '@/features/auth/auth-typography';
import { useCurrentProfile } from '@/features/profile/hooks/useCurrentProfile';
import { useProfileAvatarEditor } from '@/features/profile/hooks/useProfileAvatarEditor';
import { ProfileCountStrip } from '@/features/profile/components/ProfileCountStrip';
import { OwnProfileCinemaStats } from '@/features/profile/components/OwnProfileCinemaStats';
import { ProfileSocialLinksRow } from '@/features/profile/components/ProfileSocialLinksRow';
import { filledSocialLinks } from '@/features/profile/utils/profile-social-links';
import { SocialProfileCoverPickerSheet } from '@/features/social/components/SocialProfileCoverPickerSheet';
import { useSocialProfileCoverEditor } from '@/features/social/hooks/useSocialProfileCoverEditor';
import { useSocialProfile, useSocialProfileStatistics } from '@/features/social/hooks/useSocialQueries';
import { resolveProfileLibraryTitles } from '@/features/social/utils/resolve-profile-library-titles';
import { resolveSocialProfileCoverUri } from '@/features/social/utils/resolve-social-profile-cover';
import { colors } from '@/theme/colors';
import { glass } from '@/theme/glass';
import { layout } from '@/theme/layout';
import { spacing } from '@/theme/spacing';

const GRID_COLUMNS = 3;
const GRID_GAP = spacing.sm;
const TAB_BAR_CLEARANCE = 84;
const HUB_CHROME_CLEARANCE = 56;
const IDENTITY_BLOCK_ESTIMATE = 168;
const AVATAR_SIZE = 72;

function resolveCoverHeight(windowWidth: number, windowHeight: number, topInset: number, bottomInset: number) {
  const itemWidth =
    (windowWidth - spacing.lg * 2 - GRID_GAP * (GRID_COLUMNS - 1)) / GRID_COLUMNS;
  const rowHeight = itemWidth / layout.posterAspectRatio;
  const twoPosterRows = rowHeight * 2 + GRID_GAP;
  const budget =
    windowHeight
    - topInset
    - bottomInset
    - TAB_BAR_CLEARANCE
    - HUB_CHROME_CLEARANCE
    - twoPosterRows
    - IDENTITY_BLOCK_ESTIMATE;

  return Math.round(Math.min(132, Math.max(96, budget)));
}

export function OwnProfileTabHeader() {
  useAuthFonts();
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const { user } = useAuth();
  const userId = user?.id ?? '';
  const profileQuery = useSocialProfile(userId);
  const statistics = useSocialProfileStatistics(userId);
  const currentProfile = useCurrentProfile();
  const coverEditor = useSocialProfileCoverEditor(userId);
  const { openAvatarActions, isAvatarBusy } = useProfileAvatarEditor(currentProfile.data);
  const [coverPickerVisible, setCoverPickerVisible] = useState(false);

  const coverHeight = useMemo(
    () => resolveCoverHeight(width, height, insets.top, insets.bottom),
    [height, insets.bottom, insets.top, width],
  );
  const avatarOverlap = Math.round(AVATAR_SIZE / 2);

  const profile = profileQuery.data;
  const displayName = profile?.displayName ?? user?.displayName ?? '';
  const userName = profile?.userName ?? user?.userName ?? '';
  const avatarUrl = profile?.avatarUrl ?? user?.effectiveAvatarUrl ?? null;
  const shelfPosters = useMemo(() => {
    const items = resolveProfileLibraryTitles(statistics.data);
    return items
      .map((item) => item.posterPath)
      .filter((path): path is string => Boolean(path?.trim()));
  }, [statistics.data]);
  const coverUri = resolveSocialProfileCoverUri(
    profile?.coverImageUrl,
    profile?.coverPosterPath,
    shelfPosters[0] ?? null,
  );
  const isCustomPhotoCover = Boolean(profile?.coverImageUrl?.trim())
    && coverUri === profile?.coverImageUrl?.trim();

  const memberSinceLabel = useMemo(() => {
    const createdAt = profile?.createdAt ?? currentProfile.data?.createdAt;
    if (!createdAt) return null;
    const date = new Date(createdAt).toLocaleDateString(i18n.language, {
      month: 'long',
      year: 'numeric',
    });
    return t('profile.memberSince', { date });
  }, [currentProfile.data?.createdAt, i18n.language, profile?.createdAt, t]);

  const bio = (profile?.bio ?? currentProfile.data?.bio)?.trim() || null;
  const socialLinks = profile?.socialLinks ?? currentProfile.data?.socialLinks ?? null;
  const hasSocialLinks = filledSocialLinks(socialLinks).length > 0;

  if (!displayName) return null;

  const openPeople = (type: 'followers' | 'following') => {
    if (!profile?.id) return;
    router.push(`/(tabs)/(app-shell)/social-people/${profile.id}?type=${type}`);
  };

  return (
    <View style={styles.stage} testID="own-profile-program-card">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('social.profileCoverEdit')}
        onPress={() => setCoverPickerVisible(true)}
        disabled={coverEditor.isBusy}
        style={[styles.coverBleed, { height: coverHeight }]}
      >
        {coverUri ? (
          <Image
            source={{ uri: coverUri }}
            style={StyleSheet.absoluteFill}
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
          colors={['rgba(10,10,15,0.05)', 'rgba(10,10,15,0.35)', colors.background]}
          locations={[0.15, 0.55, 1]}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />
        <View style={styles.coverEdit}>
          {coverEditor.isBusy ? (
            <ActivityIndicator color={colors.textPrimary} size="small" />
          ) : (
            <Ionicons name="camera-outline" size={16} color={colors.textPrimary} />
          )}
        </View>
      </Pressable>

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
              <View style={styles.avatarBadge}>
                {isAvatarBusy ? (
                  <ActivityIndicator color={colors.textPrimary} size="small" />
                ) : (
                  <Ionicons name="camera" size={11} color={colors.textPrimary} />
                )}
              </View>
            </View>
          </Pressable>

          <View style={styles.identityActions}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('profile.signInSecurityTitle')}
              onPress={() => router.push('/(tabs)/profile')}
              style={({ pressed }) => [styles.settingsBtn, pressed && styles.pressed]}
            >
              <Ionicons name="settings-outline" size={18} color={colors.textPrimary} />
            </Pressable>
          </View>
        </View>

        <AppText numberOfLines={1} style={styles.name}>
          {displayName}
        </AppText>
        {userName ? (
          <AppText numberOfLines={1} style={styles.handle}>
            @{userName}
          </AppText>
        ) : null}

        {profile ? (
          <ProfileCountStrip
            counts={[
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
                      onPress: () => router.push('/profile/my-comments'),
                    },
                  ]
                : []),
            ]}
          />
        ) : null}

        {bio ? (
          <AppText style={styles.bio} numberOfLines={4}>
            {bio}
          </AppText>
        ) : null}

        {hasSocialLinks || memberSinceLabel ? (
          <View style={styles.linksJoinedRow}>
            {hasSocialLinks ? <ProfileSocialLinksRow links={socialLinks} /> : null}
            {hasSocialLinks && memberSinceLabel ? <View style={styles.linksDivider} /> : null}
            {memberSinceLabel ? (
              <View style={styles.joined}>
                <Ionicons name="calendar-outline" size={12} color={colors.textMuted} />
                <AppText style={styles.joinedText}>{memberSinceLabel}</AppText>
              </View>
            ) : null}
          </View>
        ) : null}

        {statistics.data ? (
          <View style={styles.statsBlock}>
            <OwnProfileCinemaStats statistics={statistics.data} />
          </View>
        ) : null}
      </View>

      <SocialProfileCoverPickerSheet
        visible={coverPickerVisible}
        posterPaths={shelfPosters}
        isBusy={coverEditor.isBusy}
        onClose={() => setCoverPickerVisible(false)}
        onPickPhoto={() => {
          setCoverPickerVisible(false);
          void coverEditor.pickAndUploadPhoto();
        }}
        onPickPoster={(path) => {
          coverEditor.setPoster(path);
          setCoverPickerVisible(false);
        }}
        onRemoveCover={() => {
          coverEditor.removeCover();
          setCoverPickerVisible(false);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  stage: {
    marginHorizontal: -spacing.lg,
    marginBottom: spacing.sm,
  },
  coverBleed: {
    backgroundColor: '#120E16',
    overflow: 'hidden',
  },
  coverEdit: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.lg,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.16)',
  },
  body: {
    paddingHorizontal: spacing.lg,
    gap: 2,
  },
  identityRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
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
    right: 1,
    bottom: 1,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: glass.panelElevated,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderSubtle,
  },
  identityActions: {
    paddingBottom: 2,
  },
  settingsBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: glass.panelElevated,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderSubtle,
  },
  name: {
    fontFamily: authTypography.wordmarkSemibold,
    fontSize: 28,
    lineHeight: 34,
    color: colors.textPrimary,
    letterSpacing: -0.4,
  },
  handle: {
    fontSize: 13,
    lineHeight: 16,
    color: colors.textSecondary,
  },
  bio: {
    fontSize: 13,
    lineHeight: 18,
    color: colors.textSecondary,
    paddingTop: spacing.xs,
  },
  linksJoinedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.sm,
    paddingTop: spacing.sm,
  },
  linksDivider: {
    width: StyleSheet.hairlineWidth,
    alignSelf: 'stretch',
    minHeight: 14,
    backgroundColor: colors.borderSubtle,
  },
  joined: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  joinedText: {
    fontSize: 11,
    lineHeight: 14,
    color: colors.textSecondary,
  },
  statsBlock: {
    paddingTop: spacing.md,
  },

  pressed: {
    opacity: 0.88,
  },
});
