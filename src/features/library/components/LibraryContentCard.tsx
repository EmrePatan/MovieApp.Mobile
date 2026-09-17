import { memo } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/common/AppText';
import { CatalogImage } from '@/features/details/shared/components/CatalogImage';
import type { LibraryItem } from '@/features/watchlists/utils/library-items';
import { formatRating } from '@/utils/format';
import type { LibraryRemoveIcon } from '../types';
import { colors } from '@/theme/colors';
import { borderRadius, spacing } from '@/theme/spacing';
import { layout } from '@/theme/layout';

interface LibraryContentCardProps {
  item: LibraryItem;
  isRemoving?: boolean;
  removeIcon?: LibraryRemoveIcon;
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

function resolveRemoveIconName(icon: LibraryRemoveIcon): keyof typeof Ionicons.glyphMap {
  if (icon === 'heart') {
    return 'heart';
  }

  if (icon === 'close') {
    return 'close';
  }

  return 'bookmark';
}

export const LibraryContentCard = memo(function LibraryContentCard({
  item,
  isRemoving = false,
  removeIcon = 'bookmark',
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
          width={layout.posterList.width}
          height={layout.posterList.height}
          accessibilityLabel={`${item.title} poster`}
        />
        <View style={styles.meta}>
          <AppText variant="body" numberOfLines={2} style={styles.title}>
            {item.title}
          </AppText>
          <View style={styles.metaRow}>
            <View style={styles.typeBadge}>
              <AppText variant="caption" style={styles.typeBadgeText}>
                {formatContentType(item.type)}
              </AppText>
            </View>
            {year ? (
              <AppText variant="caption" muted>
                {year}
              </AppText>
            ) : null}
            <AppText variant="caption" muted style={styles.rating}>
              ★ {formatRating(item.voteAverage)}
            </AppText>
          </View>
        </View>
      </Pressable>
      {onRemove ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Remove ${item.title} from ${removeAccessibilityLabel}`}
          disabled={isRemoving}
          onPress={() => onRemove(item)}
          style={({ pressed }) => [
            styles.removeButton,
            pressed && !isRemoving && styles.removePressed,
          ]}
        >
          {isRemoving ? (
            <ActivityIndicator color={colors.textMuted} size="small" />
          ) : (
            <Ionicons
              name={resolveRemoveIconName(removeIcon)}
              size={20}
              color={removeIcon === 'heart' ? colors.accent : colors.textMuted}
            />
          )}
        </Pressable>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingVertical: spacing.sm,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'center',
    minHeight: layout.posterList.height,
  },
  pressed: {
    opacity: 0.85,
  },
  meta: {
    flex: 1,
    gap: spacing.xs,
    justifyContent: 'center',
  },
  title: {
    lineHeight: 20,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  typeBadge: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  typeBadgeText: {
    color: colors.textSecondary,
    textTransform: 'uppercase',
    fontSize: 10,
    letterSpacing: 0.4,
  },
  rating: {
    marginLeft: 'auto',
  },
  removeButton: {
    width: layout.touchTarget,
    height: layout.touchTarget,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.full,
  },
  removePressed: {
    backgroundColor: colors.surfaceElevated,
  },
});
