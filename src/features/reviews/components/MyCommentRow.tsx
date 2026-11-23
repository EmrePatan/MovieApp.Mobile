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
import { ReviewRichBody } from './ReviewRichBody';
import { formatReviewDate } from '../utils/review-format';
import { buildMyCommentMetadataLabel } from '../utils/my-comment-format';
import type { UserReviewListItem } from '../types/my-comments';
import { parseSocialCommentContent } from '@/features/social/utils/social-comment-media';
import { authTypography } from '@/features/auth/auth-typography';
import { colors } from '@/theme/colors';
import { glass } from '@/theme/glass';
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
  const textOnly = parseSocialCommentContent(preview).text;
  const canExpand = likelyExceedsCollapsedLines(textOnly, MY_COMMENT_PREVIEW_LINE_COUNT);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${item.title}, ${metadata}`}
      onPress={() => onPress(item)}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <View style={styles.top}>
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
            <AppText style={styles.title} numberOfLines={2}>
              {item.title}
            </AppText>
            <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
          </View>
          <AppText variant="caption" muted numberOfLines={1} style={styles.metadata}>
            {metadata}
          </AppText>
          {starRating != null && ratingLabel != null ? (
            <View style={styles.ratingPill} accessibilityLabel={ratingLabel}>
              <ReviewStarRow starRating={starRating} size={13} />
              <AppText style={styles.ratingValue}>{Math.round(starRating * 10) / 10}</AppText>
            </View>
          ) : null}
        </View>
      </View>

      {preview.length > 0 ? (
        <View style={styles.quote}>
          <AppText style={styles.quoteMark} accessibilityElementsHidden>
            {'“'}
          </AppText>
          <View style={styles.quoteBody}>
            <ReviewRichBody
              content={preview}
              plain
              textVariant="bodySmall"
              mediaSize="quote"
              numberOfLines={
                expanded ? undefined : canExpand ? MY_COMMENT_PREVIEW_LINE_COUNT : undefined
              }
            />
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
        </View>
      ) : null}

      <View style={styles.stub}>
        <View style={styles.stubLine} />
        <AppText variant="caption" muted style={styles.date}>
          {dateLabel}
        </AppText>
      </View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  row: {
    width: '100%',
    alignSelf: 'stretch',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: 22,
    backgroundColor: glass.panel,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: glass.hairline,
  },
  pressed: {
    opacity: interaction.subtlePressedOpacity,
  },
  top: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: spacing.md,
  },
  posterFrame: {
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
    backgroundColor: glass.panel,
    borderWidth: 1,
    borderColor: glass.accentBorder,
  },
  body: {
    flex: 1,
    flexShrink: 1,
    alignSelf: 'stretch',
    gap: 4,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
  },
  title: {
    flex: 1,
    fontFamily: authTypography.wordmarkSemibold,
    fontSize: 18,
    lineHeight: 23,
    color: colors.textPrimary,
  },
  metadata: {
    letterSpacing: 0.15,
    color: colors.textMuted,
  },
  ratingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: spacing.sm,
    marginTop: 'auto',
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 5,
    borderRadius: borderRadius.full,
    backgroundColor: glass.accentFill,
    borderWidth: 1,
    borderColor: glass.accentBorder,
  },
  ratingValue: {
    color: colors.accentStrong,
    fontWeight: '800',
    fontSize: 13,
    lineHeight: 16,
    fontVariant: ['tabular-nums'],
  },
  quote: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 16,
    backgroundColor: 'rgba(236, 210, 150, 0.06)',
  },
  quoteMark: {
    fontFamily: authTypography.wordmarkSemibold,
    fontSize: 34,
    lineHeight: 38,
    height: 30,
    color: colors.accentStrong,
  },
  quoteBody: {
    flex: 1,
    minWidth: 0,
  },
  expandButton: {
    alignSelf: 'flex-start',
    marginTop: spacing.xs,
  },
  expandLabel: {
    color: colors.accentStrong,
    fontWeight: '700',
    fontSize: 11,
  },
  expandPressed: {
    opacity: interaction.subtlePressedOpacity,
  },
  stub: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  stubLine: {
    flex: 1,
    height: 0,
    borderTopWidth: 1,
    borderStyle: 'dashed',
    borderColor: glass.hairline,
  },
  date: {
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 0.2,
  },
});
