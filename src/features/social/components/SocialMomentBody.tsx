import { memo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppText } from '@/components/common/AppText';
import { CatalogImage } from '@/features/details/shared/components/CatalogImage';
import {
  backendScoreToStarRating,
  formatStarRatingDisplay,
} from '@/features/ratings/utils/star-rating';
import type { SocialFeedItem } from '../types';
import { resolveExcerptPreview } from '../utils/resolve-excerpt-preview';
import { SOCIAL_POSTER, socialUi } from './social-ui-tokens';
import { colors } from '@/theme/colors';
import { borderRadius, spacing } from '@/theme/spacing';

interface SocialMomentBodyProps {
  item: Pick<
    SocialFeedItem,
    'posterPath' | 'targetTitle' | 'targetSubtitle' | 'ratingScore' | 'reviewExcerpt'
  >;
  onPress: () => void;
}

export const SocialMomentBody = memo(function SocialMomentBody({ item, onPress }: SocialMomentBodyProps) {
  const { t } = useTranslation();
  const title = item.targetTitle || t('social.contentFallback');
  const excerpt = resolveExcerptPreview(item.reviewExcerpt, t('reviews.spoilerHidden'));

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && socialUi.pressed]}
    >
      <View style={styles.poster}>
        <CatalogImage
          path={item.posterPath}
          width={SOCIAL_POSTER.width}
          height={SOCIAL_POSTER.height}
          accessibilityLabel={t('common.posterAccessibility', { title })}
        />
      </View>
      <View style={styles.copy}>
        <AppText variant="body" style={styles.title} numberOfLines={2}>
          {title}
        </AppText>
        {item.targetSubtitle ? (
          <AppText variant="caption" muted numberOfLines={2}>
            {item.targetSubtitle}
          </AppText>
        ) : null}
        {item.ratingScore !== null ? (
          <AppText variant="caption" style={styles.rating}>
            ★ {formatStarRatingDisplay(backendScoreToStarRating(item.ratingScore))}
          </AppText>
        ) : null}
        {excerpt ? (
          <AppText variant="bodySmall" muted numberOfLines={3} style={styles.quote}>
            {excerpt}
          </AppText>
        ) : null}
      </View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  poster: {
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
  },
  copy: {
    flex: 1,
    gap: spacing.xs,
    justifyContent: 'center',
  },
  title: {
    fontWeight: '600',
    lineHeight: 22,
  },
  rating: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  quote: {
    lineHeight: 20,
  },
});