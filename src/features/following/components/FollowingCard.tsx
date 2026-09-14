import { memo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { ContentTypeBadge } from '@/components/content/ContentTypeBadge';
import { AppText } from '@/components/common/AppText';
import { PosterImage } from '@/components/common/PosterImage';
import type { FollowingCatalogItem } from '../types';
import { isFutureReleaseDate } from '@/utils/date';
import { formatCatalogYear, formatContentType, formatIsoDate } from '@/utils/format';
import { interaction } from '@/theme/interaction';
import { layout } from '@/theme/layout';
import { spacing } from '@/theme/spacing';

interface FollowingCardProps {
  item: FollowingCatalogItem;
  onPress?: (item: FollowingCatalogItem) => void;
}

export const FollowingCard = memo(function FollowingCard({
  item,
  onPress,
}: FollowingCardProps) {
  const year = formatCatalogYear(item.releaseDate, item.year);
  const comingDate =
    item.type === 'movie' && isFutureReleaseDate(item.releaseDate)
      ? formatIsoDate(item.releaseDate)
      : null;
  const accessibilityLabel = `${item.title}, ${formatContentType(item.type)}${year ? `, ${year}` : ''}${comingDate ? `, coming ${comingDate}` : ''}`;

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
        </View>
        {comingDate ? (
          <AppText variant="caption" muted numberOfLines={1}>
            Coming {comingDate}
          </AppText>
        ) : null}
      </View>
    </Pressable>
  );
});

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
