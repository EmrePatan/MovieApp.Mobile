import { memo, useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { AppText } from '@/components/common/AppText';
import { PosterImage } from '@/components/common/PosterImage';
import type { SearchResultItem } from '../types';
import {
  formatCatalogYear,
  formatContentType,
  formatRating,
} from '@/utils/format';
import { interaction } from '@/theme/interaction';
import { layout } from '@/theme/layout';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

interface SearchResultCardProps {
  item: SearchResultItem;
  onPress?: (item: SearchResultItem) => void;
}

export const SearchResultCard = memo(function SearchResultCard({
  item,
  onPress,
}: SearchResultCardProps) {
  const year = formatCatalogYear(item.releaseDate, item.year);

  const metadataLine = useMemo(() => {
    const parts = [
      formatContentType(item.type),
      year,
      item.voteAverage > 0 ? `★ ${formatRating(item.voteAverage)}` : null,
    ].filter(Boolean);

    return parts.join(' · ');
  }, [item.type, item.voteAverage, year]);

  const accessibilityLabel = `${item.title}, ${metadataLine || formatContentType(item.type)}`;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={() => onPress?.(item)}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <PosterImage
        uri={item.posterUrl}
        width={layout.posterList.width}
        height={layout.posterList.height}
        accessibilityLabel={`${item.title} poster`}
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
        {item.overview ? (
          <AppText variant="caption" muted numberOfLines={2} style={styles.overview}>
            {item.overview}
          </AppText>
        ) : null}
      </View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  pressed: {
    opacity: interaction.pressedOpacity,
    backgroundColor: colors.surface,
  },
  meta: {
    flex: 1,
    gap: spacing.xs,
    paddingTop: spacing.xs,
    minHeight: layout.posterList.height - spacing.xs,
    justifyContent: 'center',
  },
  title: {
    color: colors.textPrimary,
  },
  metadata: {
    letterSpacing: 0.1,
  },
  overview: {
    lineHeight: 16,
  },
});
