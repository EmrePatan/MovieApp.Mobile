import { memo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { AppText } from '@/components/common/AppText';
import { CatalogImage } from '@/features/details/shared/components/CatalogImage';
import type { LibraryCategory, LibraryItem } from '../types/library';
import {
  buildLibraryGridAccessibilityLabel,
  resolveLibraryStatusPresentation,
} from '../utils/library-status-presentation';
import { LibraryStatusIndicator } from './LibraryStatusIndicator';
import { colors } from '@/theme/colors';
import { borderRadius, spacing } from '@/theme/spacing';

interface LibraryGridCardProps {
  item: LibraryItem;
  category: LibraryCategory;
  width: number;
  height: number;
  onPress: (item: LibraryItem) => void;
}

export const LibraryGridCard = memo(function LibraryGridCard({
  item,
  category,
  width,
  height,
  onPress,
}: LibraryGridCardProps) {
  const presentation = resolveLibraryStatusPresentation(item);
  const accessibilityLabel = buildLibraryGridAccessibilityLabel(item, presentation, category);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={() => onPress(item)}
      style={({ pressed }) => [styles.card, { width }, pressed && styles.pressed]}
    >
      <View style={[styles.posterWrap, { height }]}>
        <CatalogImage
          path={item.posterUrl}
          width={width}
          height={height}
          accessibilityLabel={`${item.title} poster`}
        />
        {category === 'watching' ? (
          <LibraryStatusIndicator
            status={presentation.status}
            progressPercentage={presentation.progressPercentage}
            display="poster-progress"
          />
        ) : (
          <LibraryStatusIndicator status={presentation.status} display="badge" />
        )}
      </View>
      {category === 'watching' && presentation.detail ? (
        <AppText variant="caption" muted numberOfLines={1} style={styles.watchingDetail}>
          {presentation.detail}
        </AppText>
      ) : null}
    </Pressable>
  );
});

const styles = StyleSheet.create({
  card: {
    gap: spacing.xs,
  },
  posterWrap: {
    position: 'relative',
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  watchingDetail: {
    lineHeight: 14,
  },
  pressed: {
    opacity: 0.85,
  },
});
