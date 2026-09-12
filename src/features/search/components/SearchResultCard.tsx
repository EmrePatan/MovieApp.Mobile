import { memo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { ContentTypeBadge } from '@/components/content/ContentTypeBadge';
import { AppText } from '@/components/common/AppText';
import { PosterImage } from '@/components/common/PosterImage';
import type { SearchResultItem } from '../types';
import { formatCatalogYear, formatContentType, formatRating } from '@/utils/format';
import { interaction } from '@/theme/interaction';
import { layout } from '@/theme/layout';
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
  const accessibilityLabel = `${item.title}, ${formatContentType(item.type)}${year ? `, ${year}` : ''}, rating ${formatRating(item.voteAverage)}`;

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
        <AppText variant="body" numberOfLines={2}>
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
        {item.overview ? (
          <AppText variant="bodySmall" muted numberOfLines={2}>
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
    gap: spacing.md,
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingVertical: spacing.sm,
  },
  pressed: {
    opacity: interaction.pressedOpacity,
  },
  meta: {
    flex: 1,
    gap: spacing.xs,
    paddingVertical: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
});
