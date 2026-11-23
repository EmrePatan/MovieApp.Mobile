import { useMemo, useState, type ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from '@/components/common/AppText';
import { GlassSurface } from '@/components/common/GlassSurface';
import { UserAvatar } from '@/components/common/UserAvatar';
import { ImageViewerModal } from '@/features/gallery/components/ImageViewerModal';
import type { GalleryImage } from '@/features/gallery/types';
import { ProfileInlineCounts } from '@/features/profile/components/ProfileInlineCounts';
import { OwnProfileCinemaStats } from '@/features/profile/components/OwnProfileCinemaStats';
import { ProfileSocialLinksRow } from '@/features/profile/components/ProfileSocialLinksRow';
import { filledSocialLinks } from '@/features/profile/utils/profile-social-links';
import { COVER_ASPECT } from '@/features/profile/utils/cover-crop';
import type { SocialProfile, SocialProfileStatistics } from '../types';
import { resolveSocialProfileCoverUri } from '../utils/resolve-social-profile-cover';
import { authTypography } from '@/features/auth/auth-typography';
import { useAuthFonts } from '@/features/auth/useAuthFonts';
import { colors } from '@/theme/colors';
import { layout } from '@/theme/layout';
import { spacing } from '@/theme/spacing';

const AVATAR_SIZE = 76;
const CHROME_SIZE = 40;

interface SocialProfileHeaderProps {
  profile: SocialProfile;
  statistics?: SocialProfileStatistics;
  fallbackPosterPath?: string | null;
  canEditCover?: boolean;
  coverBusy?: boolean;
  onEditCover?: () => void;
  onBack?: () => void;
  actions?: ReactNode;
  onFollowersPress: () => void;
  onFollowingPress: () => void;
  onReviewsPress?: () => void;
}

/**
 * Someone else's profile, in the same Liquid Glass language as the own-profile tab:
 * full-bleed cover at the exact cover ratio, a ring avatar overlapping it, counts
 * inline, a scrollable links rail and glass stat tiles. Follow/message actions get
 * their own full-width row under the counts.
 */
export function SocialProfileHeader({
  profile,
  statistics,
  fallbackPosterPath,
  canEditCover = false,
  coverBusy = false,
  onEditCover,
  onBack,
  actions,
  onFollowersPress,
  onFollowingPress,
  onReviewsPress,
}: SocialProfileHeaderProps) {
  useAuthFonts();
  const { t, i18n } = useTranslation();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const coverImageHeight = Math.round(width / COVER_ASPECT);
  const coverHeight = insets.top + coverImageHeight;
  const avatarOverlap = Math.round(AVATAR_SIZE / 2);
  const [avatarViewerOpen, setAvatarViewerOpen] = useState(false);
  const avatarImages = useMemo<GalleryImage[]>(() => {
    const path = profile.avatarUrl?.trim();
    if (!path) return [];
    return [
      {
        filePath: path,
        width: null,
        height: null,
        aspectRatio: null,
        category: 'profile',
        language: null,
        voteAverage: 0,
        voteCount: 0,
      },
    ];
  }, [profile.avatarUrl]);

  const coverUri = resolveSocialProfileCoverUri(
    profile.coverImageUrl,
    profile.coverPosterPath,
    fallbackPosterPath,
  );
  const isCustomPhotoCover =
    Boolean(profile.coverImageUrl?.trim()) && coverUri === profile.coverImageUrl?.trim();

  const memberSinceLabel = useMemo(() => {
    const date = new Date(profile.createdAt).toLocaleDateString(i18n.language, {
      month: 'long',
      year: 'numeric',
    });
    return t('profile.memberSince', { date });
  }, [i18n.language, profile.createdAt, t]);

  const hasSocialLinks = filledSocialLinks(profile.socialLinks).length > 0;
  const bio = profile.bio?.trim() || null;

  const counts = [
    {
      key: 'followers',
      value: profile.followersCount,
      label: t('social.followersCountLabel'),
      onPress: onFollowersPress,
    },
    {
      key: 'following',
      value: profile.followingCount,
      label: t('social.followingCountLabel'),
      onPress: onFollowingPress,
    },
    ...(statistics
      ? [
          {
            key: 'reviews',
            value: statistics.reviewsCount,
            label: t('social.reviewCount'),
            onPress: onReviewsPress,
          },
        ]
      : []),
  ];

  return (
    <View style={styles.stage}>
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

      <View
        style={[styles.topChrome, { top: insets.top + spacing.sm }]}
        pointerEvents="box-none"
      >
        {onBack ? (
          <GlassSurface style={styles.chromeGlass}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('social.back')}
              onPress={onBack}
              hitSlop={8}
              style={({ pressed }) => [styles.chromeHit, pressed && styles.pressed]}
            >
              <Ionicons name="chevron-back" size={20} color={colors.textPrimary} />
            </Pressable>
          </GlassSurface>
        ) : (
          <View style={styles.chromeGlass} />
        )}
        {canEditCover && onEditCover ? (
          <GlassSurface style={styles.chromeGlass}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('social.profileCoverEdit')}
              onPress={onEditCover}
              disabled={coverBusy}
              style={({ pressed }) => [styles.chromeHit, pressed && styles.pressed]}
            >
              {coverBusy ? (
                <ActivityIndicator color={colors.textPrimary} size="small" />
              ) : (
                <Ionicons name="camera-outline" size={18} color={colors.textPrimary} />
              )}
            </Pressable>
          </GlassSurface>
        ) : null}
      </View>

      <View style={[styles.body, { marginTop: -avatarOverlap }]}>
        <View style={styles.identityRow}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('social.viewAvatar')}
            disabled={avatarImages.length === 0}
            onPress={() => setAvatarViewerOpen(true)}
            style={styles.avatarRing}
          >
            <UserAvatar
              displayName={profile.displayName}
              effectiveAvatarUrl={profile.avatarUrl}
              size={AVATAR_SIZE}
              textVariant="subtitle"
              accessibilityLabel={profile.displayName}
            />
          </Pressable>
          <ImageViewerModal
            visible={avatarViewerOpen}
            images={avatarImages}
            initialIndex={0}
            onClose={() => setAvatarViewerOpen(false)}
          />

          <View style={[styles.identityCopy, { paddingTop: avatarOverlap + spacing.xs }]}>
            <AppText numberOfLines={1} style={styles.name}>
              {profile.displayName}
            </AppText>
            <AppText numberOfLines={1} style={styles.handle}>
              @{profile.userName}
            </AppText>
          </View>
        </View>

        <ProfileInlineCounts counts={counts} />

        {actions ? <View style={styles.actions}>{actions}</View> : null}

        {bio ? (
          <AppText style={styles.bio} numberOfLines={4}>
            {bio}
          </AppText>
        ) : null}

        {hasSocialLinks || memberSinceLabel || profile.isPrivate ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.rail}
            contentContainerStyle={styles.railContent}
          >
            {hasSocialLinks ? <ProfileSocialLinksRow links={profile.socialLinks} /> : null}
            {memberSinceLabel ? (
              <GlassSurface style={styles.chip}>
                <Ionicons name="calendar-outline" size={13} color={colors.textSecondary} />
                <AppText style={styles.chipText} numberOfLines={1}>
                  {memberSinceLabel}
                </AppText>
              </GlassSurface>
            ) : null}
            {profile.isPrivate ? (
              <GlassSurface style={styles.chip}>
                <Ionicons name="lock-closed-outline" size={13} color={colors.textSecondary} />
                <AppText style={styles.chipText} numberOfLines={1}>
                  {t('social.privateProfile')}
                </AppText>
              </GlassSurface>
            ) : null}
          </ScrollView>
        ) : null}

        {statistics ? <OwnProfileCinemaStats statistics={statistics} /> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  stage: {
    marginBottom: spacing.sm,
  },
  coverBleed: {
    backgroundColor: '#120E16',
    overflow: 'hidden',
  },
  coverImage: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  topChrome: {
    position: 'absolute',
    left: layout.screenPaddingHorizontal,
    right: layout.screenPaddingHorizontal,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 2,
  },
  chromeGlass: {
    width: CHROME_SIZE,
    height: CHROME_SIZE,
    borderRadius: CHROME_SIZE / 2,
  },
  chromeHit: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    paddingHorizontal: layout.screenPaddingHorizontal,
  },
  identityRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  avatarRing: {
    borderRadius: 999,
    borderWidth: 2,
    borderColor: colors.accent,
    backgroundColor: colors.background,
    padding: 2,
  },
  identityCopy: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  name: {
    fontFamily: authTypography.wordmarkSemibold,
    fontSize: 26,
    lineHeight: 32,
    color: colors.textPrimary,
    letterSpacing: -0.4,
  },
  handle: {
    fontSize: 13,
    lineHeight: 16,
    color: colors.textSecondary,
  },
  actions: {
    marginTop: spacing.md,
  },
  bio: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.textSecondary,
    paddingTop: spacing.md,
  },
  rail: {
    marginTop: spacing.md,
    marginHorizontal: -layout.screenPaddingHorizontal,
    flexGrow: 0,
  },
  railContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: layout.screenPaddingHorizontal,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 34,
    paddingHorizontal: spacing.md,
    borderRadius: 17,
  },
  chipText: {
    fontSize: 12,
    lineHeight: 16,
    color: colors.textSecondary,
  },
  pressed: {
    opacity: 0.88,
  },
});
