import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { AppText } from '@/components/common/AppText';
import { CatalogImage } from '@/features/details/shared/components/CatalogImage';
import { ReviewStarRow } from '@/features/reviews/components/ReviewStarRow';
import { backendScoreToStarRating } from '@/features/ratings/utils/star-rating';
import { shouldShowOriginalTitle } from '@/utils/format';
import type { SocialFeedItem } from '../types';
import { socialContentTypeLabel } from '../utils/social-feed-embed';
import { borderRadius, spacing } from '@/theme/spacing';
import { socialFeedTheme } from './social-feed-theme';
import { socialUi } from './social-ui-tokens';

/** Compact 2:3 poster — secondary to the comment feed. */
const THUMB_W = 44;
const THUMB_H = 66;

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
        {showStars ? (
          <View style={styles.ratingRow}>
            <ReviewStarRow starRating={backendScoreToStarRating(activity.ratingScore!)} size={11} />
            {scoreLabel ? <AppText style={styles.score}>{scoreLabel}</AppText> : null}
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
    paddingVertical: spacing.sm,
    paddingLeft: spacing.sm,
    paddingRight: spacing.xs,
    borderRadius: borderRadius.md,
    backgroundColor: socialFeedTheme.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: socialFeedTheme.border,
    overflow: 'hidden',
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
    fontSize: 15,
    lineHeight: 19,
    fontWeight: '700',
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
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 1,
  },
  score: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
    color: socialFeedTheme.textMuted,
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
