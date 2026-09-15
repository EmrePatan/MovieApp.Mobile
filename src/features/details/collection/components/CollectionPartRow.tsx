import { memo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/common/AppText';
import { PosterImage } from '@/components/common/PosterImage';
import type { CollectionPart } from '../types';
import { formatCatalogYear, formatRating, formatVoteCount } from '@/utils/format';
import { colors } from '@/theme/colors';
import { borderRadius, spacing } from '@/theme/spacing';
import { interaction } from '@/theme/interaction';
import { layout } from '@/theme/layout';

interface CollectionPartRowProps {
  part: CollectionPart;
  onPress?: (part: CollectionPart) => void;
}

const POSTER_WIDTH = 72;
const POSTER_HEIGHT = Math.round(POSTER_WIDTH * 1.5);

export const CollectionPartRow = memo(function CollectionPartRow({
  part,
  onPress,
}: CollectionPartRowProps) {
  const year = formatCatalogYear(part.releaseDate, null);
  const ratingLine = `${formatRating(part.voteAverage)} · ${formatVoteCount(part.voteCount)} votes`;
  const accessibilityLabel = `${part.title}${year ? `, ${year}` : ''}, rated ${formatRating(part.voteAverage)}`;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={() => onPress?.(part)}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      testID={`collection-part-${part.id}`}
    >
      <PosterImage
        uri={part.posterPath}
        width={POSTER_WIDTH}
        height={POSTER_HEIGHT}
        accessibilityLabel={`${part.title} poster`}
        elevated
      />
      <View style={styles.meta}>
        <View style={styles.titleRow}>
          <AppText variant="body" numberOfLines={2} style={styles.title}>
            {part.title}
          </AppText>
          <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
        </View>
        <View style={styles.row}>
          {year ? (
            <AppText variant="caption" muted>
              {year}
            </AppText>
          ) : null}
          <AppText variant="caption" muted>
            {ratingLine}
          </AppText>
        </View>
      </View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    minHeight: layout.touchTarget,
  },
  pressed: {
    opacity: interaction.pressedOpacity,
  },
  meta: {
    flex: 1,
    gap: spacing.xs,
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
  },
  title: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
});
