import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';
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
import { spacing } from '@/theme/spacing';
import { interaction } from '@/theme/interaction';

const POSTER_WIDTH = 64;
const POSTER_HEIGHT = 96;

interface MyCommentRowProps {
  item: UserReviewListItem;
  onPress: (item: UserReviewListItem) => void;
}

export const MyCommentRow = memo(function MyCommentRow({ item, onPress }: MyCommentRowProps) {
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

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${item.title}, ${metadata}`}
      onPress={() => onPress(item)}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <CatalogImage
        path={item.posterPath}
        width={POSTER_WIDTH}
        height={POSTER_HEIGHT}
        accessibilityLabel={item.title}
      />
      <View style={styles.body}>
        <AppText variant="body" style={styles.title} numberOfLines={1}>
          {item.title}
        </AppText>
        <AppText variant="caption" muted numberOfLines={1}>
          {metadata}
        </AppText>
        {starRating != null && ratingLabel != null ? (
          <View style={styles.ratingRow}>
            <ReviewStarRow starRating={starRating} size={13} />
            <AppText variant="caption" muted style={styles.ratingLabel}>
              {ratingLabel}
            </AppText>
          </View>
        ) : null}
        {preview.length > 0 ? (
          <AppText variant="bodySmall" muted numberOfLines={3} style={styles.preview}>
            {preview}
          </AppText>
        ) : null}
        <AppText variant="caption" muted style={styles.date}>
          {dateLabel}
        </AppText>
      </View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderSubtle,
  },
  pressed: {
    opacity: interaction.subtlePressedOpacity,
  },
  body: {
    flex: 1,
    gap: spacing.xs,
    paddingTop: 2,
  },
  title: {
    fontWeight: '600',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: 2,
  },
  ratingLabel: {
    fontWeight: '500',
  },
  preview: {
    lineHeight: 20,
    marginTop: spacing.xs,
  },
  date: {
    marginTop: spacing.xs,
  },
});
