import { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  type AccessibilityActionEvent,
  ActivityIndicator,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
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
  onRemove?: (item: LibraryItem) => void;
  removeAccessibilityLabel?: string;
  isRemoving?: boolean;
}

export const LibraryGridCard = memo(function LibraryGridCard({
  item,
  category,
  width,
  height,
  onPress,
  onRemove,
  removeAccessibilityLabel,
  isRemoving = false,
}: LibraryGridCardProps) {
  const { t } = useTranslation();
  const presentation = resolveLibraryStatusPresentation(item);
  const accessibilityLabel = buildLibraryGridAccessibilityLabel(item, presentation, category);
  const resolvedListName = removeAccessibilityLabel ?? t('library.watchlistDetail.removeFromThisList');
  const removeActionLabel = t('common.removeFromList', {
    title: item.title,
    listName: resolvedListName,
  });

  const handleRemove = useCallback(() => {
    if (isRemoving) {
      return;
    }

    onRemove?.(item);
  }, [isRemoving, item, onRemove]);

  const handleAccessibilityAction = useCallback(
    (event: AccessibilityActionEvent) => {
      if (event.nativeEvent.actionName === 'remove') {
        handleRemove();
      }
    },
    [handleRemove],
  );

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityActions={onRemove ? [{ name: 'remove', label: removeActionLabel }] : undefined}
      onAccessibilityAction={onRemove ? handleAccessibilityAction : undefined}
      onPress={() => onPress(item)}
      onLongPress={onRemove ? handleRemove : undefined}
      delayLongPress={400}
      style={({ pressed }) => [styles.card, { width }, pressed && styles.pressed]}
    >
      <View style={[styles.posterWrap, { height }]}>
        <CatalogImage
          path={item.posterUrl}
          width={width}
          height={height}
          accessibilityLabel={t('common.posterAccessibility', { title: item.title })}
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
        {isRemoving ? (
          <View style={styles.removingOverlay}>
            <ActivityIndicator color={colors.accent} />
          </View>
        ) : null}
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
  removingOverlay: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.overlay,
  },
});
