import { memo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { ContentTypeBadge } from '@/components/content/ContentTypeBadge';
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
}

export const RecommendationCard = memo(function RecommendationCard({
  item,
  onPress,
}: RecommendationCardProps) {
  const year = formatCatalogYear(item.releaseDate, item.year);
  const accessibilityLabel = `${item.title}, ${formatContentType(item.type)}${year ? `, ${year}` : ''}, rating ${formatRating(item.voteAverage)}${item.reason ? `, ${item.reason}` : ''}`;

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
        accessibilityLabel={`${item.title} poster`}
        elevated
      />
      <View style={styles.meta}>
        <AppText variant="bodySmall" numberOfLines={2} style={styles.title}>
          {item.title}
        </AppText>
        <View style={styles.row}>
          <ContentTypeBadge type={item.type} />
          {year ? (
            <AppText variant="caption" muted>
              {year}
            </AppText>
          ) : null}
          <AppText variant="caption" muted>
            ★ {formatRating(item.voteAverage)}
          </AppText>
        </View>
        {item.reason ? (
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
    minHeight: 40,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
});
