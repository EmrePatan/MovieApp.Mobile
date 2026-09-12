import { memo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { ContentTypeBadge } from '@/components/content/ContentTypeBadge';
import { AppText } from '@/components/common/AppText';
import { PosterImage } from '@/components/common/PosterImage';
import type { HomeItem } from '../types';
import { formatContentType, formatRating } from '@/utils/format';
import { interaction } from '@/theme/interaction';
import { layout } from '@/theme/layout';
import { spacing } from '@/theme/spacing';

interface HomeContentCardProps {
  item: HomeItem;
  onPress?: (item: HomeItem) => void;
}

export const HomeContentCard = memo(function HomeContentCard({
  item,
  onPress,
}: HomeContentCardProps) {
  const accessibilityLabel = `${item.title}, ${formatContentType(item.contentType)}, rating ${formatRating(item.voteAverage)}`;

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
          <ContentTypeBadge type={item.contentType} />
          <AppText variant="caption" muted>
            ★ {formatRating(item.voteAverage)}
          </AppText>
        </View>
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
    justifyContent: 'space-between',
    gap: spacing.xs,
  },
});

export const HOME_CARD_WIDTH = layout.posterCarousel.width;
