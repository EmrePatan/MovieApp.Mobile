import { memo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { CatalogImage } from '@/features/details/shared/components/CatalogImage';
import type { LibraryItem } from '../types/library';
import { resolveLibraryStatusPresentation } from '../utils/library-status-presentation';
import { LibraryStatusIndicator } from './LibraryStatusIndicator';
import { colors } from '@/theme/colors';
import { borderRadius, spacing } from '@/theme/spacing';

interface LibraryGridCardProps {
  item: LibraryItem;
  width: number;
  height: number;
  onPress: (item: LibraryItem) => void;
}

export const LibraryGridCard = memo(function LibraryGridCard({
  item,
  width,
  height,
  onPress,
}: LibraryGridCardProps) {
  const presentation = resolveLibraryStatusPresentation(item);
  const accessibilityLabel = `${item.title}, ${presentation.label}`;

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
      </View>
      <LibraryStatusIndicator
        status={presentation.status}
        label={presentation.label}
        detail={presentation.detail}
        progressPercentage={presentation.progressPercentage}
      />
    </Pressable>
  );
});

const styles = StyleSheet.create({
  card: {
    gap: spacing.xs,
  },
  posterWrap: {
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  pressed: {
    opacity: 0.85,
  },
});
