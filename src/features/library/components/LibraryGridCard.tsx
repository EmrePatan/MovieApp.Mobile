import { memo, useCallback, useMemo } from 'react';
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
import { BrowsePosterFrame } from '@/features/browse-quick-actions/components/BrowsePosterFrame';
import {
  buildBrowseQuickActionsTarget,
  useBrowsePosterQuickActions,
} from '@/features/browse-quick-actions/hooks/useBrowsePosterQuickActions';
import type { LibraryCategory, LibraryItem } from '../types/library';
import {
  buildLibraryGridAccessibilityLabel,
  resolveLibraryStatusPresentation,
} from '../utils/library-status-presentation';
import { LibraryStatusIndicator } from './LibraryStatusIndicator';
import { resolveImageUri } from '@/utils/image-url';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

interface LibraryGridCardProps {
  item: LibraryItem;
  category: LibraryCategory;
  width: number;
  height: number;
  onPress: (item: LibraryItem) => void;
  onRemove?: (item: LibraryItem) => void;
  removeAccessibilityLabel?: string;
  isRemoving?: boolean;
  /** Long-press quick actions and the corner watched badge. Disable on the owner's own profile. */
  quickActionsEnabled?: boolean;
  /** Corner list-status badge (e.g. the blue watchlist bookmark). Off where the watched check replaces it. */
  showStatusBadge?: boolean;
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
  quickActionsEnabled = true,
  showStatusBadge = true,
}: LibraryGridCardProps) {
  const { t } = useTranslation();
  const presentation = resolveLibraryStatusPresentation(item);
  const accessibilityLabel = buildLibraryGridAccessibilityLabel(item, presentation, category);
  const resolvedListName = removeAccessibilityLabel ?? t('library.watchlistDetail.removeFromThisList');
  const removeActionLabel = t('common.removeFromList', {
    title: item.title,
    listName: resolvedListName,
  });
  const quickTarget = useMemo(
    () =>
      quickActionsEnabled
        ? buildBrowseQuickActionsTarget({
            contentId: item.id,
            contentType: item.type,
            title: item.title,
            posterUrl: resolveImageUri(item.posterUrl, 'w300'),
            year: item.year,
            voteAverage: item.voteAverage,
          })
        : null,
    [
      quickActionsEnabled,
      item.id,
      item.posterUrl,
      item.title,
      item.type,
      item.voteAverage,
      item.year,
    ],
  );
  const { isWatched, watchedBusy, onLongPress, onToggleWatched } =
    useBrowsePosterQuickActions(quickTarget);

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

  const posterContent = (
    <View style={[styles.posterWrap, { width, height }]}>
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
      ) : showStatusBadge ? (
        <LibraryStatusIndicator status={presentation.status} display="badge" />
      ) : null}
      {isRemoving ? (
        <View style={styles.removingOverlay}>
          <ActivityIndicator color={colors.accent} />
        </View>
      ) : null}
    </View>
  );

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityActions={onRemove ? [{ name: 'remove', label: removeActionLabel }] : undefined}
      onAccessibilityAction={onRemove ? handleAccessibilityAction : undefined}
      onPress={() => onPress(item)}
      onLongPress={onLongPress}
      delayLongPress={380}
      style={({ pressed }) => [styles.card, { width }, pressed && styles.pressed]}
    >
      {quickActionsEnabled ? (
        <BrowsePosterFrame
          watched={isWatched}
          busy={watchedBusy}
          onToggleWatched={onToggleWatched}
        >
          {posterContent}
        </BrowsePosterFrame>
      ) : (
        posterContent
      )}
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
    borderRadius: 14,
    overflow: 'hidden',
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
