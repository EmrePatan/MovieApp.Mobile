import { memo } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/common/AppText';
import { CatalogImage } from '@/features/details/shared/components/CatalogImage';
import { formatRating } from '@/utils/format';
import type { LibraryItem } from '../utils/library-items';
import { colors } from '@/theme/colors';
import { borderRadius, spacing } from '@/theme/spacing';

const POSTER_WIDTH = 72;
const POSTER_HEIGHT = 108;

interface LibraryContentCardProps {
  item: LibraryItem;
  isRemoving?: boolean;
  removeAccessibilityLabel?: string;
  onPress?: (item: LibraryItem) => void;
  onRemove?: (item: LibraryItem) => void;
}

function formatContentType(type: LibraryItem['type']): string {
  return type === 'movie' ? 'Movie' : 'TV';
}

function formatYear(item: LibraryItem): string | null {
  return item.airDate ? item.airDate.slice(0, 4) : null;
}

export const LibraryContentCard = memo(function LibraryContentCard({
  item,
  isRemoving = false,
  removeAccessibilityLabel = 'watchlist',
  onPress,
  onRemove,
}: LibraryContentCardProps) {
  const year = formatYear(item);
  const accessibilityLabel = `${item.title}, ${formatContentType(item.type)}${year ? `, ${year}` : ''}, rating ${formatRating(item.voteAverage)}`;

  return (
    <View style={styles.card}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        onPress={() => onPress?.(item)}
        style={({ pressed }) => [styles.content, pressed && styles.pressed]}
      >
        <CatalogImage
          path={item.posterPath}
          width={POSTER_WIDTH}
          height={POSTER_HEIGHT}
          accessibilityLabel={`${item.title} poster`}
        />
        <View style={styles.meta}>
          <AppText variant="body" numberOfLines={2}>
            {item.title}
          </AppText>
          <View style={styles.row}>
            <View style={styles.badge}>
              <AppText variant="caption" style={styles.badgeText}>
                {formatContentType(item.type)}
              </AppText>
            </View>
            {year ? (
              <AppText variant="caption" muted>
                {year}
              </AppText>
            ) : null}
            <AppText variant="caption" muted>
              ★ {formatRating(item.voteAverage)}
            </AppText>
          </View>
        </View>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Remove ${item.title} from ${removeAccessibilityLabel}`}
        disabled={isRemoving}
        onPress={() => onRemove?.(item)}
        style={styles.removeButton}
      >
        {isRemoving ? (
          <ActivityIndicator color={colors.textMuted} size="small" />
        ) : (
          <Ionicons name="trash-outline" size={20} color={colors.textMuted} />
        )}
      </Pressable>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'center',
  },
  pressed: {
    opacity: 0.85,
  },
  meta: {
    flex: 1,
    gap: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  badge: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  badgeText: {
    color: colors.textSecondary,
    textTransform: 'uppercase',
  },
  removeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
