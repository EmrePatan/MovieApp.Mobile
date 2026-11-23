import { useMemo, useState, type ReactNode } from 'react';
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
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from '@/components/common/AppText';
import { UserAvatar } from '@/components/common/UserAvatar';
import { ImageViewerModal } from '@/features/gallery/components/ImageViewerModal';
import type { GalleryImage } from '@/features/gallery/types';
import { ProfileCountStrip } from '@/features/profile/components/ProfileCountStrip';
import { OwnProfileCinemaStats } from '@/features/profile/components/OwnProfileCinemaStats';
import { ProfileSocialLinksRow } from '@/features/profile/components/ProfileSocialLinksRow';
import { filledSocialLinks } from '@/features/profile/utils/profile-social-links';
import type { SocialProfile, SocialProfileStatistics } from '../types';
import { resolveSocialProfileCoverUri } from '../utils/resolve-social-profile-cover';
import { authTypography } from '@/features/auth/auth-typography';
import { useAuthFonts } from '@/features/auth/useAuthFonts';
import { colors } from '@/theme/colors';
import { glass } from '@/theme/glass';
import { layout } from '@/theme/layout';
import { spacing } from '@/theme/spacing';

const AVATAR_SIZE = 72;

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
  const coverHeight = Math.round(Math.min(148, Math.max(112, width * 0.36)));
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
  const isCustomPhotoCover = Boolean(profile.coverImageUrl?.trim())
    && coverUri === profile.coverImageUrl?.trim();

  const memberSinceLabel = useMemo(() => {
    const date = new Date(profile.createdAt).toLocaleDateString(i18n.language, {
      month: 'long',
      year: 'numeric',
    });
    return t('profile.memberSince', { date });
  }, [i18n.language, profile.createdAt, t]);

  const hasSocialLinks = filledSocialLinks(profile.socialLinks).length > 0;
  const bio = profile.bio?.trim() || null;

  return (
    <View style={styles.stage}>
      <View style={[styles.coverBleed, { height: coverHeight }]}>
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

        <View style={[styles.topChrome, { paddingTop: insets.top + spacing.xs }]} pointerEvents="box-none">
          {onBack ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('social.back')}
              onPress={onBack}
              hitSlop={8}
              style={({ pressed }) => [styles.chromeBtn, pressed && styles.pressed]}
            >
              <Ionicons name="chevron-back" size={22} color={colors.textPrimary} />
            </Pressable>
          ) : (
            <View style={styles.chromeSpacer} />
          )}
          <AppText numberOfLines={1} style={styles.chromeTitle}>
            @{profile.userName}
          </AppText>
          {canEditCover && onEditCover ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('social.profileCoverEdit')}
              onPress={onEditCover}
              disabled={coverBusy}
              style={({ pressed }) => [styles.chromeBtn, pressed && styles.pressed]}
            >
              {coverBusy ? (
                <ActivityIndicator color={colors.textPrimary} size="small" />
              ) : (
                <Ionicons name="camera-outline" size={18} color={colors.textPrimary} />
              )}
            </Pressable>
          ) : (
            <View style={styles.chromeSpacer} />
          )}
        </View>
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
          {actions ? <View style={styles.actions}>{actions}</View> : null}
        </View>

        <AppText numberOfLines={2} style={styles.name}>
          {profile.displayName}
        </AppText>
        <AppText numberOfLines={1} style={styles.handle}>
          @{profile.userName}
        </AppText>

        <ProfileCountStrip
          counts={[
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
          ]}
        />

        {bio ? (
          <AppText style={styles.bio} numberOfLines={4}>
            {bio}
          </AppText>
        ) : null}

        {hasSocialLinks || memberSinceLabel ? (
          <View style={styles.linksJoinedRow}>
            {hasSocialLinks ? <ProfileSocialLinksRow links={profile.socialLinks} /> : null}
            {hasSocialLinks && memberSinceLabel ? <View style={styles.linksDivider} /> : null}
            {memberSinceLabel ? (
              <View style={styles.joined}>
                <Ionicons name="calendar-outline" size={12} color={colors.textMuted} />
                <AppText style={styles.joinedText}>{memberSinceLabel}</AppText>
              </View>
            ) : null}
          </View>
        ) : null}

        {profile.isPrivate ? (
          <View style={styles.privateRow}>
            <Ionicons name="lock-closed-outline" size={12} color={colors.textMuted} />
            <AppText style={styles.joinedText}>{t('social.privateProfile')}</AppText>
          </View>
        ) : null}

        {statistics ? (
          <View style={styles.statsBlock}>
            <OwnProfileCinemaStats statistics={statistics} />
          </View>
        ) : null}
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
  topChrome: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: layout.screenPaddingHorizontal,
    gap: spacing.sm,
    zIndex: 2,
  },
  chromeBtn: {
    width: layout.touchTarget,
    height: layout.touchTarget,
    borderRadius: layout.touchTarget / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: glass.panelElevated,
    borderWidth: 1,
    borderColor: glass.hairline,
  },
  chromeSpacer: {
    width: layout.touchTarget,
  },
  chromeTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  body: {
    paddingHorizontal: layout.screenPaddingHorizontal,
    gap: 2,
  },
  identityRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  avatarRing: {
    borderRadius: 999,
    borderWidth: 2,
    borderColor: colors.accent,
    backgroundColor: colors.background,
    padding: 2,
  },
  actions: {
    paddingBottom: 2,
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
  privateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingTop: 2,
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
