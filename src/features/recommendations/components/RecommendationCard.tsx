import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';
import { AppText } from '@/components/common/AppText';
import { PosterImage } from '@/components/common/PosterImage';
import type { RecommendationItem } from '../types';
import { formatCatalogYear, formatContentType, formatRating } from '@/utils/format';
import { interaction } from '@/theme/interaction';
import { layout } from '@/theme/layout';
import { spacing } from '@/theme/spacing';

interface RecommendationCardProps {
  item: RecommendationItem;
  onPress?: (item: RecommendationItem) => void;
  showReason?: boolean;
}

export const RecommendationCard = memo(function RecommendationCard({
  item,
  onPress,
  showReason = true,
}: RecommendationCardProps) {
  const { t } = useTranslation();
  const year = formatCatalogYear(item.releaseDate, item.year);
  const metadataLine = useMemo(() => {
    const parts = [
      formatContentType(item.type),
      year,
      item.voteAverage > 0 ? `★ ${formatRating(item.voteAverage)}` : null,
    ].filter(Boolean);

    return parts.join(' · ');
  }, [item.type, item.voteAverage, year]);

  const accessibilityDetails = [
    formatContentType(item.type),
    year,
    t('common.communityRatingAccessibility', { rating: formatRating(item.voteAverage) }),
    showReason ? item.reason : null,
  ]
    .filter(Boolean)
    .join(', ');
  const accessibilityLabel = t('common.itemWithDetails', {
    title: item.title,
    details: accessibilityDetails,
  });

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={() => onPress?.(item)}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <PosterImage
        uri={item.posterUrl}
        width={layout.posterCarousel.width}
        height={layout.posterCarousel.height}
        accessibilityLabel={t('common.posterAccessibility', { title: item.title })}
        elevated
      />
      <View style={styles.meta}>
        <AppText variant="bodySmall" numberOfLines={2} style={styles.title}>
          {item.title}
        </AppText>
        {metadataLine ? (
          <AppText variant="caption" muted numberOfLines={1} style={styles.metadata}>
            {metadataLine}
          </AppText>
        ) : null}
        {showReason && item.reason ? (
          <AppText variant="caption" muted numberOfLines={2}>
            {item.reason}
          </AppText>
        ) : null}
      </View>
    </Pressable>
  );
});

export const RECOMMENDATION_CARD_WIDTH = layout.posterCarousel.width;

const styles = StyleSheet.create({
  card: {
    width: layout.posterCarousel.width,
    marginRight: spacing.md,
  },
  pressed: {
    opacity: interaction.pressedOpacity,
  },
  meta: {
    marginTop: spacing.sm,
    gap: spacing.xs,
  },
  title: {
    flexShrink: 1,
  },
  metadata: {
    letterSpacing: 0.1,
  },
});
