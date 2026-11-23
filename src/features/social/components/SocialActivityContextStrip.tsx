import { Pressable, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { AppText } from '@/components/common/AppText';
import { CatalogImage } from '@/features/details/shared/components/CatalogImage';
import { resolveImageUri } from '@/utils/image-url';
import { shouldShowOriginalTitle } from '@/utils/format';
import type { SocialFeedItem } from '../types';
import { socialContentTypeLabel } from '../utils/social-feed-embed';
import { authTypography } from '@/features/auth/auth-typography';
import { glass } from '@/theme/glass';
import { borderRadius, spacing } from '@/theme/spacing';
import { socialFeedTheme } from './social-feed-theme';
import { socialUi } from './social-ui-tokens';

/** Compact 2:3 poster — secondary to the comment feed. */
const THUMB_W = 60;
const THUMB_H = 90;

interface SocialActivityContextStripProps {
  activity: SocialFeedItem;
  onPress: () => void;
}

export function SocialActivityContextStrip({ activity, onPress }: SocialActivityContextStripProps) {
  const { t } = useTranslation();
  const title = activity.targetTitle || t('social.contentFallback');
  const showStars = activity.ratingScore !== null && activity.ratingScore !== undefined;
  const showOriginal = shouldShowOriginalTitle(title, activity.targetOriginalTitle);
  const metaSecondary =
    activity.targetSubtitle?.trim() || socialContentTypeLabel(activity.targetContentType, t);
  const metaLine = `${activity.displayName} · ${metaSecondary}`;
  const glowUri = activity.posterPath?.trim() ? resolveImageUri(activity.posterPath, 'w300') : null;
  const scoreLabel =
    showStars && activity.ratingScore != null
      ? `${Number(activity.ratingScore).toFixed(1)}/10`
      : null;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      onPress={onPress}
      style={({ pressed }) => [styles.strip, pressed && socialUi.pressed]}
    >
      {glowUri ? (
        <View pointerEvents="none" style={styles.glow} accessibilityElementsHidden>
          <Image
            source={{ uri: glowUri }}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
            blurRadius={45}
            cachePolicy="memory-disk"
          />
          <LinearGradient
            colors={['rgba(8,8,10,0.30)', 'rgba(8,8,10,0.78)']}
            style={StyleSheet.absoluteFill}
          />
        </View>
      ) : null}
      <View style={styles.poster}>
        <CatalogImage
          path={activity.posterPath}
          width={THUMB_W}
          height={THUMB_H}
          accessibilityLabel={title}
          rounded={false}
        />
      </View>
      <View style={styles.copy}>
        <AppText numberOfLines={2} style={styles.title}>
          {title}
        </AppText>
        {showOriginal ? (
          <AppText numberOfLines={1} style={styles.original}>
            {activity.targetOriginalTitle}
          </AppText>
        ) : null}
        <AppText numberOfLines={1} style={styles.meta}>
          {metaLine}
        </AppText>
        {showStars && scoreLabel ? (
          <View style={styles.ratingBadge}>
            <Ionicons name="star" size={12} color={socialFeedTheme.accent} />
            <AppText style={styles.score}>{scoreLabel}</AppText>
          </View>
        ) : null}
      </View>
      <View style={styles.chevron} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        <Ionicons name="chevron-forward" size={16} color={socialFeedTheme.textMuted} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  strip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    paddingLeft: spacing.md,
    paddingRight: spacing.xs,
    borderRadius: 24,
    backgroundColor: glass.panel,
    borderWidth: 1,
    borderColor: glass.hairline,
    overflow: 'hidden',
  },
  glow: {
    ...StyleSheet.absoluteFill,
    opacity: 0.9,
  },
  poster: {
    width: THUMB_W,
    height: THUMB_H,
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
    backgroundColor: socialFeedTheme.surfaceSecondary,
    flexShrink: 0,
  },
  copy: {
    flex: 1,
    minWidth: 0,
    gap: 3,
    justifyContent: 'center',
  },
  title: {
    fontFamily: authTypography.wordmarkSemibold,
    fontSize: 19,
    lineHeight: 24,
    color: socialFeedTheme.textPrimary,
  },
  original: {
    fontSize: 12,
    lineHeight: 16,
    color: socialFeedTheme.textMuted,
    fontWeight: '500',
  },
  meta: {
    fontSize: 12,
    lineHeight: 16,
    color: socialFeedTheme.textSecondary,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
    height: 24,
    marginTop: 2,
    paddingHorizontal: spacing.sm,
    borderRadius: 12,
    backgroundColor: 'rgba(212, 179, 106, 0.16)',
    borderWidth: 1,
    borderColor: 'rgba(236, 210, 150, 0.45)',
  },
  score: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
    color: socialFeedTheme.accent,
    fontVariant: ['tabular-nums'],
  },
  chevron: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
});
