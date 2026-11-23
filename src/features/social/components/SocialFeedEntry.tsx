import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/common/AppText';
import { UserAvatar } from '@/components/common/UserAvatar';
import { CatalogImage } from '@/features/details/shared/components/CatalogImage';
import { backendScoreToStarRating, formatStarRatingDisplay } from '@/features/ratings/utils/star-rating';
import { authTypography } from '@/features/auth/auth-typography';
import { glass } from '@/theme/glass';
import { layout } from '@/theme/layout';
import { borderRadius, spacing } from '@/theme/spacing';
import { shouldShowOriginalTitle } from '@/utils/format';
import { resolveImageUri } from '@/utils/image-url';
import { socialFeedTheme } from './social-feed-theme';
import {
  SOCIAL_AVATAR_FEED_ROW,
  SOCIAL_POSTER_FEED,
  socialFeedSpacing,
  socialUi,
} from './social-ui-tokens';

interface SocialFeedEntryProps {
  displayName: string;
  avatarUrl: string | null;
  timeLabel: string;
  title: string;
  originalTitle?: string | null;
  metaChips?: string[];
  posterPath: string | null | undefined;
  ratingScore?: number | null;
  body: ReactNode;
  engagement: ReactNode;
  titleOpenLabel: string;
  onProfilePress: () => void;
  onOpenTitle: () => void;
  onMenuPress?: () => void;
  menuLabel?: string;
  /** `flat` = continuous stream (default feed); `card` = boxed shell if needed elsewhere. */
  chrome?: 'card' | 'flat';
}

/**
 * Premium Modern Social feed post:
 * header → text/media → compact catalog reference → engagement
 */
export function SocialFeedEntry({
  displayName,
  avatarUrl,
  timeLabel,
  title,
  originalTitle,
  metaChips,
  posterPath,
  ratingScore,
  body,
  engagement,
  titleOpenLabel,
  onProfilePress,
  onOpenTitle,
  onMenuPress,
  menuLabel,
  chrome = 'flat',
}: SocialFeedEntryProps) {
  const showStars = ratingScore !== null && ratingScore !== undefined;
  const starRating = showStars ? backendScoreToStarRating(ratingScore!) : null;
  const ratingA11y =
    starRating != null ? `${formatStarRatingDisplay(starRating)} / 5` : undefined;
  const chips = (metaChips ?? []).map((chip) => chip.trim()).filter(Boolean);
  const isFlat = chrome === 'flat';
  const showOriginal = shouldShowOriginalTitle(title, originalTitle);
  const hasCatalogMeta = chips.length > 0;
  const ratingLabel = starRating != null ? formatStarRatingDisplay(starRating) : null;
  const glowUri = !isFlat && posterPath?.trim() ? resolveImageUri(posterPath, 'w300') : null;

  return (
    <View style={[styles.wrap, isFlat ? styles.wrapFlat : styles.wrapCard]}>
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
            colors={['rgba(8,8,10,0.30)', 'rgba(8,8,10,0.74)']}
            style={StyleSheet.absoluteFill}
          />
        </View>
      ) : null}
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={displayName}
          onPress={onProfilePress}
          hitSlop={4}
          style={({ pressed }) => [styles.avatarHit, pressed && socialUi.pressed]}
        >
          <UserAvatar
            displayName={displayName}
            effectiveAvatarUrl={avatarUrl}
            size={SOCIAL_AVATAR_FEED_ROW}
            textVariant="caption"
          />
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={displayName}
          onPress={onProfilePress}
          style={({ pressed }) => [styles.identityHit, pressed && socialUi.pressed]}
        >
          <AppText numberOfLines={1} style={styles.name}>
            {displayName}
          </AppText>
          {timeLabel ? (
            <AppText style={styles.time} numberOfLines={1}>
              {timeLabel}
            </AppText>
          ) : null}
        </Pressable>

        {ratingLabel ? (
          <View style={styles.ratingBadge} accessibilityRole="text" accessibilityLabel={ratingA11y}>
            <Ionicons name="star" size={12} color={socialFeedTheme.accent} />
            <AppText style={styles.ratingText}>{ratingLabel}</AppText>
          </View>
        ) : null}

        {onMenuPress ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={menuLabel}
            onPress={onMenuPress}
            hitSlop={8}
            style={({ pressed }) => [styles.menu, pressed && socialUi.pressed]}
          >
            <Ionicons name="ellipsis-horizontal" size={18} color={socialFeedTheme.textSecondary} />
          </Pressable>
        ) : (
          <View style={styles.menuSpacer} />
        )}
      </View>

      {body ? <View style={styles.body}>{body}</View> : null}

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={titleOpenLabel}
        onPress={onOpenTitle}
        style={({ pressed }) => [styles.titleCard, pressed && socialUi.pressed]}
      >
        <View style={styles.titlePoster}>
          <CatalogImage
            path={posterPath}
            width={SOCIAL_POSTER_FEED.width}
            height={SOCIAL_POSTER_FEED.height}
            accessibilityLabel={title}
            rounded={false}
          />
        </View>
        <View style={styles.titleCopy}>
          <AppText numberOfLines={2} style={styles.title}>
            {title}
          </AppText>
          {showOriginal ? (
            <AppText numberOfLines={1} style={styles.originalTitle}>
              {originalTitle}
            </AppText>
          ) : null}
          {hasCatalogMeta ? (
            <View
              style={styles.metaRow}
              accessibilityRole={starRating != null ? 'text' : undefined}
              accessibilityLabel={ratingA11y}
            >
              {chips.slice(0, 2).map((chip) => (
                <AppText key={chip} numberOfLines={1} style={styles.metaChip}>
                  {chip}
                </AppText>
              ))}
            </View>
          ) : null}
        </View>
        <View style={styles.chevronSlot}>
          <Ionicons name="chevron-forward" size={16} color={socialFeedTheme.textMuted} />
        </View>
      </Pressable>

      <View style={styles.engagement}>{engagement}</View>
    </View>
  );
}

export function SocialFeedBodyText({ text }: { text: string }) {
  if (!text.trim()) return null;
  return (
    <AppText style={styles.bodyText} numberOfLines={8}>
      {text}
    </AppText>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignSelf: 'stretch',
    gap: socialFeedSpacing.blockGap,
  },
  wrapFlat: {
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingVertical: socialFeedSpacing.rowPaddingVertical,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: socialFeedTheme.border,
    backgroundColor: 'transparent',
  },
  wrapCard: {
    marginHorizontal: layout.screenPaddingHorizontal,
    marginBottom: spacing.md,
    padding: spacing.md,
    borderRadius: 26,
    overflow: 'hidden',
    backgroundColor: glass.panel,
    borderWidth: 1,
    borderColor: glass.hairline,
  },
  glow: {
    ...StyleSheet.absoluteFill,
    opacity: 0.9,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: SOCIAL_AVATAR_FEED_ROW,
  },
  avatarHit: {
    width: SOCIAL_AVATAR_FEED_ROW,
    flexShrink: 0,
  },
  identityHit: {
    flex: 1,
    minWidth: 0,
    justifyContent: 'center',
    gap: 2,
  },
  name: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '700',
    color: socialFeedTheme.textPrimary,
  },
  time: {
    fontSize: 12,
    lineHeight: 16,
    color: socialFeedTheme.textMuted,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    height: 28,
    paddingHorizontal: spacing.sm + 2,
    borderRadius: 14,
    backgroundColor: 'rgba(212, 179, 106, 0.16)',
    borderWidth: 1,
    borderColor: 'rgba(236, 210, 150, 0.45)',
  },
  ratingText: {
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '700',
    color: socialFeedTheme.accent,
    fontVariant: ['tabular-nums'],
  },
  menu: {
    width: layout.touchTarget,
    height: layout.touchTarget,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: -spacing.sm,
    flexShrink: 0,
  },
  menuSpacer: {
    width: spacing.sm,
  },
  body: {
    gap: spacing.sm,
    maxWidth: '100%',
  },
  bodyText: {
    fontSize: 15,
    lineHeight: 22,
    color: socialFeedTheme.textPrimary,
  },
  titleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.sm,
    paddingRight: spacing.xs,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.34)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255, 255, 255, 0.10)',
    overflow: 'hidden',
  },
  titlePoster: {
    width: SOCIAL_POSTER_FEED.width,
    height: SOCIAL_POSTER_FEED.height,
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
    backgroundColor: socialFeedTheme.surfaceSecondary,
    flexShrink: 0,
  },
  titleCopy: {
    flex: 1,
    minWidth: 0,
    gap: 3,
    justifyContent: 'center',
  },
  chevronSlot: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  title: {
    fontFamily: authTypography.wordmarkSemibold,
    fontSize: 16,
    lineHeight: 21,
    color: socialFeedTheme.textPrimary,
  },
  originalTitle: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
    color: socialFeedTheme.textMuted,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
  },
  metaChip: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '600',
    color: socialFeedTheme.textSecondary,
    maxWidth: '70%',
  },
  engagement: {
    marginTop: spacing.xs / 2,
    paddingTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: glass.hairline,
  },
});
