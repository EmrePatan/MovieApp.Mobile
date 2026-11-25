import { useMemo, useState, type ReactNode } from 'react';
import { ActivityIndicator, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { GlassSurface } from '@/components/common/GlassSurface';
import { UserAvatar } from '@/components/common/UserAvatar';
import { AchievementLevelBadge } from '@/features/achievements/components/AchievementLevelBadge';
import { ImageViewerModal } from '@/features/gallery/components/ImageViewerModal';
import type { GalleryImage } from '@/features/gallery/types';
import {
  PROFILE_AVATAR_SIZE,
  ProfileAvatarRing,
  ProfileIdentityHeader,
} from '@/features/profile/components/ProfileIdentityHeader';
import type { SocialProfile, SocialProfileStatistics } from '../types';
import { resolveSocialProfileCoverUri } from '../utils/resolve-social-profile-cover';
import { colors } from '@/theme/colors';
import { layout } from '@/theme/layout';

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
  /** Extra info row under the buttons (e.g. the taste-match line). */
  identityTrailing?: ReactNode;
  onFollowersPress: () => void;
  onFollowingPress: () => void;
  onReviewsPress?: () => void;
}

/** Someone else's profile: the shared profile header plus follow/message actions. */
export function SocialProfileHeader({
  profile,
  statistics,
  fallbackPosterPath,
  canEditCover = false,
  coverBusy = false,
  onEditCover,
  onBack,
  actions,
  identityTrailing,
  onFollowersPress,
  onFollowingPress,
  onReviewsPress,
}: SocialProfileHeaderProps) {
  const { t, i18n } = useTranslation();
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

  const handleNote = useMemo(() => {
    if (profile.followsViewer) {
      return profile.followStatus === 'Accepted' ? t('social.mutualFollow') : t('social.followsYou');
    }
    return new Date(profile.createdAt).toLocaleDateString(i18n.language, {
      month: 'long',
      year: 'numeric',
    });
  }, [i18n.language, profile.createdAt, profile.followStatus, profile.followsViewer, t]);

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
    <>
      <ProfileIdentityHeader
        coverUri={coverUri}
        isCustomPhotoCover={isCustomPhotoCover}
        horizontalPadding={layout.screenPaddingHorizontal}
        topLeft={
          onBack ? (
            <GlassSurface style={styles.chromeGlass}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t('social.back')}
                onPress={onBack}
                hitSlop={8}
                style={({ pressed }) => [styles.chromeHit, pressed && styles.pressed]}
              >
                <Ionicons name="chevron-back" size={18} color={colors.textPrimary} />
              </Pressable>
            </GlassSurface>
          ) : null
        }
        topRight={
          canEditCover && onEditCover ? (
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
          ) : null
        }
        avatar={
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('social.viewAvatar')}
            disabled={avatarImages.length === 0}
            onPress={() => setAvatarViewerOpen(true)}
            style={styles.avatarHit}
          >
            <ProfileAvatarRing>
              <UserAvatar
                displayName={profile.displayName}
                effectiveAvatarUrl={profile.avatarUrl}
                size={PROFILE_AVATAR_SIZE}
                textVariant="subtitle"
                accessibilityLabel={profile.displayName}
              />
            </ProfileAvatarRing>
          </Pressable>
        }
        displayName={profile.displayName}
        seal={<AchievementLevelBadge
            points={profile.achievementPoints}
            recent={profile.recentAchievements}
          />}
        handle={`@${profile.userName}`}
        handleNote={handleNote}
        isPrivate={profile.isPrivate}
        bio={profile.bio?.trim() || null}
        socialLinks={profile.socialLinks}
        hideEmptySocialLinks
        counts={counts}
        actions={actions}
        extraLines={identityTrailing}
        statistics={statistics}
      />
      <ImageViewerModal
        visible={avatarViewerOpen}
        images={avatarImages}
        initialIndex={0}
        onClose={() => setAvatarViewerOpen(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
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
  avatarHit: {
    alignSelf: 'flex-start',
    borderRadius: 999,
  },
  pressed: {
    opacity: 0.88,
  },
});
