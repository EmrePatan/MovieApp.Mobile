import { memo, useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { AppText } from '@/components/common/AppText';
import { PosterImage } from '@/components/common/PosterImage';
import type { HomeItem } from '../types';
import {
  formatCatalogYear,
  formatContentType,
  formatRating,
} from '@/utils/format';
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
  const metadataLine = useMemo(() => {
    const parts = [
      formatContentType(item.contentType),
      formatCatalogYear(item.releaseDate, null),
      item.voteAverage > 0 ? `★ ${formatRating(item.voteAverage)}` : null,
    ].filter(Boolean);

    return parts.join(' · ');
  }, [item.contentType, item.releaseDate, item.voteAverage]);

  const accessibilityLabel = `${item.title}, ${metadataLine || formatContentType(item.contentType)}`;

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
        {metadataLine ? (
          <AppText variant="caption" muted numberOfLines={1} style={styles.metadata}>
            {metadataLine}
          </AppText>
        ) : null}
      </View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  card: {
    width: layout.posterCarousel.width,
    marginRight: layout.cardGap,
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
  metadata: {
    letterSpacing: 0.1,
  },
});

export const HOME_CARD_WIDTH = layout.posterCarousel.width;
