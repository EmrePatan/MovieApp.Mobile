import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/common/AppText';
import { CatalogImage } from '@/features/details/shared/components/CatalogImage';
import {
  backendScoreToStarRating,
  isValidBackendScore,
} from '@/features/ratings/utils/star-rating';
import { ReviewStarRow } from './ReviewStarRow';
import { formatReviewDate } from '../utils/review-format';
import { buildMyCommentMetadataLabel } from '../utils/my-comment-format';
import type { UserReviewListItem } from '../types/my-comments';
import { colors } from '@/theme/colors';
import { borderRadius, spacing } from '@/theme/spacing';
import { interaction } from '@/theme/interaction';

import {
  likelyExceedsCollapsedLines,
} from '../utils/review-content-length';
import { getMyCommentPosterSize } from '../utils/my-comments-layout';

const MY_COMMENT_PREVIEW_LINE_COUNT = 2;

interface MyCommentRowProps {
  item: UserReviewListItem;
  onPress: (item: UserReviewListItem) => void;
}

export const MyCommentRow = memo(function MyCommentRow({ item, onPress }: MyCommentRowProps) {
  const [expanded, setExpanded] = useState(false);
  const { width: screenWidth } = useWindowDimensions();
  const { width: posterWidth, height: posterHeight } = getMyCommentPosterSize(screenWidth);
  const { t } = useTranslation();
  const metadata = buildMyCommentMetadataLabel(
    item,
    t('profile.myComments.metadataMovie'),
    t('profile.myComments.metadataTv'),
  );
  const starRating =
    item.userRating != null && isValidBackendScore(item.userRating)
      ? backendScoreToStarRating(item.userRating)
      : null;
  const ratingLabel =
    starRating == null
      ? null
      : t('profile.myComments.ratingOutOfFive', { rating: Math.round(starRating) });
  const dateLabel = formatReviewDate(item.createdAt);
  const preview = item.content.trim();
  const canExpand = likelyExceedsCollapsedLines(preview, MY_COMMENT_PREVIEW_LINE_COUNT);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${item.title}, ${metadata}`}
      onPress={() => onPress(item)}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={[styles.posterFrame, { height: posterHeight }]}>
        <CatalogImage
          path={item.posterPath}
          width={posterWidth}
          height={posterHeight}
          accessibilityLabel={item.title}
        />
      </View>
      <View style={[styles.body, { minHeight: posterHeight }]}>
        <View style={styles.titleRow}>
          <AppText variant="body" style={styles.title} numberOfLines={1}>
            {item.title}
          </AppText>
          <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
        </View>
        <AppText variant="caption" muted numberOfLines={1} style={styles.metadata}>
          {metadata}
        </AppText>
        {starRating != null && ratingLabel != null ? (
          <View style={styles.ratingRow}>
            <ReviewStarRow starRating={starRating} size={14} />
            <AppText variant="caption" style={styles.ratingLabel}>
              {ratingLabel}
            </AppText>
          </View>
        ) : null}
        {preview.length > 0 ? (
          <View style={styles.previewBlock}>
            <AppText
              variant="bodySmall"
              muted
              numberOfLines={
                expanded ? undefined : canExpand ? MY_COMMENT_PREVIEW_LINE_COUNT : undefined
              }
              style={styles.preview}
            >
              {preview}
            </AppText>
            {canExpand ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={
                  expanded
                    ? t('common.showLessOfYourReview')
                    : t('profile.myComments.seeMoreAccessibility')
                }
                onPress={() => setExpanded((current) => !current)}
                hitSlop={4}
                style={({ pressed }) => [styles.expandButton, pressed && styles.expandPressed]}
                testID="my-comment-see-more"
              >
                <AppText variant="caption" style={styles.expandLabel}>
                  {expanded ? t('common.showLess') : t('profile.myComments.seeMore')}
                </AppText>
              </Pressable>
            ) : null}
          </View>
        ) : null}
        <AppText variant="caption" muted style={styles.date}>
          {dateLabel}
        </AppText>
      </View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  card: {
    width: '100%',
    alignSelf: 'stretch',
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: spacing.sm + 2,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderSubtle,
  },
  pressed: {
    opacity: interaction.subtlePressedOpacity,
    backgroundColor: colors.accentTint12,
    borderColor: colors.borderAccent,
  },
  posterFrame: {
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: borderRadius.sm,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderAccent,
    overflow: 'hidden',
  },
  body: {
    flex: 1,
    flexShrink: 1,
    alignSelf: 'stretch',
    gap: 3,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  title: {
    flex: 1,
    fontWeight: '600',
    letterSpacing: 0.1,
  },
  metadata: {
    letterSpacing: 0.15,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  ratingLabel: {
    color: colors.accentMuted,
    fontWeight: '600',
    fontSize: 12,
    lineHeight: 14,
  },
  previewBlock: {
    marginTop: spacing.sm,
    paddingLeft: spacing.sm,
    borderLeftWidth: 2,
    borderLeftColor: colors.accentTint18,
  },
  preview: {
    lineHeight: 20,
    fontStyle: 'italic',
  },
  expandButton: {
    alignSelf: 'flex-start',
    marginTop: spacing.xs,
  },
  expandLabel: {
    color: colors.accent,
    fontWeight: '600',
    fontSize: 11,
  },
  expandPressed: {
    opacity: interaction.subtlePressedOpacity,
  },
  date: {
    marginTop: 'auto',
    alignSelf: 'flex-end',
    paddingTop: spacing.sm,
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 0.2,
    textAlign: 'right',
  },
});
