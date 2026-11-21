import { type ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { UserAvatar } from '@/components/common/UserAvatar';
import {
  resolveSocialProfileCoverUri,
  SOCIAL_PROFILE_COVER_FALLBACK,
} from '../utils/resolve-social-profile-cover';
import { socialFeedPremiumStyles } from './social-feed-premium-styles';
import { socialUi } from './social-ui-tokens';
import { colors } from '@/theme/colors';
import { borderRadius, spacing } from '@/theme/spacing';

const COVER_HEIGHT = 200;
const AVATAR_SIZE = 88;
const POSTER_BLUR = 36;

interface SocialProfileHeroProps {
  displayName: string;
  avatarUrl: string | null;
  coverImageUrl?: string | null;
  coverPosterPath?: string | null;
  fallbackPosterPath?: string | null;
  canEditCover?: boolean;
  /** Keeps the edit control below overlaid navigation chrome. */
  coverChromeTop?: number;
  onEditCover?: () => void;
  actions?: ReactNode;
}

export function SocialProfileHero({
  displayName,
  avatarUrl,
  coverImageUrl,
  coverPosterPath,
  fallbackPosterPath,
  canEditCover = false,
  coverChromeTop,
  onEditCover,
  actions,
}: SocialProfileHeroProps) {
  const { t } = useTranslation();
  const customCoverUri = coverImageUrl?.trim() || null;
  const posterCoverUri = customCoverUri
    ? null
    : resolveSocialProfileCoverUri(null, coverPosterPath, fallbackPosterPath);

  return (
    <View style={styles.wrap}>
      <View style={styles.coverFrame}>
        {customCoverUri ? (
          <Image
            source={{ uri: customCoverUri }}
            style={styles.coverImage}
            contentFit="cover"
            contentPosition="center"
            cachePolicy="memory-disk"
            accessibilityLabel=""
          />
        ) : posterCoverUri ? (
          <>
            <Image
              source={{ uri: posterCoverUri }}
              style={styles.coverImage}
              contentFit="cover"
              contentPosition="top"
              blurRadius={POSTER_BLUR}
              cachePolicy="memory-disk"
              accessibilityLabel=""
            />
            <LinearGradient
              colors={['rgba(6,6,10,0.15)', 'rgba(6,6,10,0.55)', colors.background]}
              style={styles.coverImage}
              pointerEvents="none"
            />
          </>
        ) : (
          <LinearGradient colors={SOCIAL_PROFILE_COVER_FALLBACK} style={styles.coverImage} />
        )}
          <LinearGradient
          colors={['transparent', 'rgba(6,6,10,0.2)', colors.background]}
          style={styles.scrim}
          pointerEvents="none"
        />
      </View>
      {canEditCover && onEditCover ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('social.profileCoverEdit')}
          onPress={onEditCover}
          style={({ pressed }) => [
            styles.editBtn,
            coverChromeTop != null ? { top: coverChromeTop } : null,
            pressed && socialUi.pressed,
          ]}
        >
          <Ionicons name="camera-outline" size={18} color={colors.textPrimary} />
        </Pressable>
      ) : null}
      {actions ? <View style={styles.actionSlot}>{actions}</View> : null}
      <View style={styles.avatarSlot}>
        <View style={socialFeedPremiumStyles.avatarRing}>
          <UserAvatar
            displayName={displayName}
            effectiveAvatarUrl={avatarUrl}
            size={AVATAR_SIZE}
            textVariant="subtitle"
            accessibilityLabel={displayName}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    height: COVER_HEIGHT + AVATAR_SIZE / 2,
    marginBottom: spacing.xs,
    position: 'relative',
  },
  coverFrame: {
    width: '100%',
    height: COVER_HEIGHT,
    overflow: 'hidden',
    backgroundColor: '#0a0a0e',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderAccent,
  },
  coverImage: {
    ...StyleSheet.absoluteFill,
    width: '100%',
    height: COVER_HEIGHT,
  },
  scrim: {
    ...StyleSheet.absoluteFill,
    height: COVER_HEIGHT,
  },
  editBtn: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    width: 44,
    height: 44,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.2)',
    zIndex: 2,
  },
  avatarSlot: {
    position: 'absolute',
    left: spacing.md,
    top: COVER_HEIGHT - AVATAR_SIZE / 2,
    zIndex: 2,
  },
  actionSlot: {
    position: 'absolute',
    right: spacing.md,
    top: COVER_HEIGHT - 22,
    zIndex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
});