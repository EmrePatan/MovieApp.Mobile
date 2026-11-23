import { memo, useCallback, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  type AccessibilityActionEvent,
  ActivityIndicator,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/common/AppText';
import { CatalogImage } from '@/features/details/shared/components/CatalogImage';
import { BrowsePosterFrame } from '@/features/browse-quick-actions/components/BrowsePosterFrame';
import {
  buildBrowseQuickActionsTarget,
  useBrowsePosterQuickActions,
} from '@/features/browse-quick-actions/hooks/useBrowsePosterQuickActions';
import { translateContentType } from '@/i18n/catalog-labels';
import type { LibraryItem } from '@/features/watchlists/utils/library-items';
import { formatRating } from '@/utils/format';
import { resolveImageUri } from '@/utils/image-url';
import type { LibraryRemoveIcon } from '../types';
import { colors } from '@/theme/colors';
import { glass } from '@/theme/glass';
import { borderRadius, spacing } from '@/theme/spacing';
import { layout } from '@/theme/layout';
import { POSTER_CARD_ROLE } from '@/utils/poster-card-role';

const SWIPE_REMOVE_ACTION_SIZE = 40;

interface LibraryContentCardProps {
  item: LibraryItem;
  isRemoving?: boolean;
  removeIcon?: LibraryRemoveIcon;
  removeAccessibilityLabel?: string;
  removalMode?: 'button' | 'swipe';
  onPress?: (item: LibraryItem) => void;
  onRemove?: (item: LibraryItem) => void;
}

function formatContentType(type: LibraryItem['type']): string {
  return translateContentType(type);
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
  removalMode = 'button',
  onPress,
  onRemove,
}: LibraryContentCardProps) {
  const { t } = useTranslation();
  const swipeableRef = useRef<Swipeable>(null);
  const year = formatYear(item);
  const quickTarget = useMemo(
    () =>
      buildBrowseQuickActionsTarget({
        contentId: item.id,
        contentType: item.type,
        title: item.title,
        posterUrl: resolveImageUri(item.posterPath, 'w300'),
        releaseDate: item.airDate,
        voteAverage: item.voteAverage,
      }),
    [item.airDate, item.id, item.posterPath, item.title, item.type, item.voteAverage],
  );
  const { isWatched, watchedBusy, onLongPress, onToggleWatched } =
    useBrowsePosterQuickActions(quickTarget);
  const accessibilityDetails = [
    formatContentType(item.type),
    year,
    t('common.communityRatingAccessibility', { rating: formatRating(item.voteAverage) }),
  ]
    .filter(Boolean)
    .join(', ');
  const accessibilityLabel = t('common.itemWithDetails', {
    title: item.title,
    details: accessibilityDetails,
  });
  const removeActionLabel = t('common.removeFromList', {
    title: item.title,
    listName: removeAccessibilityLabel,
  });
  const usesSwipeRemove = Boolean(onRemove) && removalMode === 'swipe';

  const handleRemove = useCallback(() => {
    if (isRemoving) {
      return;
    }

    swipeableRef.current?.close();
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

  const renderSwipeRemoveAction = useCallback(() => {
    if (!onRemove) {
      return null;
    }

    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={removeActionLabel}
        disabled={isRemoving}
        onPress={handleRemove}
        style={({ pressed }) => [
          styles.swipeRemoveAction,
          pressed && !isRemoving && styles.pressed,
        ]}
      >
        {isRemoving ? (
          <ActivityIndicator color={colors.accent} size="small" />
        ) : (
          <Ionicons name="trash-outline" size={18} color={colors.accent} />
        )}
      </Pressable>
    );
  }, [handleRemove, isRemoving, onRemove, removeActionLabel]);

  const cardContent = (
    <>
      <Pressable
        accessibilityRole={POSTER_CARD_ROLE}
        accessibilityLabel={accessibilityLabel}
        accessibilityActions={
          usesSwipeRemove || onRemove
            ? [{ name: 'remove', label: removeActionLabel }]
            : undefined
        }
        onAccessibilityAction={
          usesSwipeRemove || onRemove ? handleAccessibilityAction : undefined
        }
        onPress={() => onPress?.(item)}
        onLongPress={onLongPress}
        delayLongPress={380}
        style={({ pressed }) => [styles.content, pressed && styles.pressed]}
      >
        <BrowsePosterFrame
          watched={isWatched}
          busy={watchedBusy}
          onToggleWatched={onToggleWatched}
        >
          <CatalogImage
            path={item.posterPath}
            width={layout.posterList.width}
            height={layout.posterList.height}
            accessibilityLabel={t('common.posterAccessibility', { title: item.title })}
          />
        </BrowsePosterFrame>
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
      {onRemove && removalMode === 'button' ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={removeActionLabel}
          disabled={isRemoving}
          onPress={handleRemove}
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
    </>
  );

  if (usesSwipeRemove) {
    return (
      <Swipeable
        ref={swipeableRef}
        friction={2}
        overshootRight={false}
        rightThreshold={SWIPE_REMOVE_ACTION_SIZE / 2}
        activeOffsetX={[-24, 24]}
        failOffsetY={[-12, 12]}
        renderRightActions={renderSwipeRemoveAction}
        containerStyle={styles.swipeRow}
        childrenContainerStyle={styles.swipeContent}
      >
        <View style={styles.card}>{cardContent}</View>
      </Swipeable>
    );
  }

  return <View style={styles.card}>{cardContent}</View>;
});

const styles = StyleSheet.create({
  swipeRow: {
    minHeight: layout.posterList.height + spacing.sm * 2,
  },
  swipeContent: {
    backgroundColor: colors.background,
  },
  // Each library title is a soft glass card, like the feed and notification cards.
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginHorizontal: layout.screenPaddingHorizontal,
    marginVertical: spacing.xs,
    padding: spacing.sm,
    borderRadius: 20,
    backgroundColor: glass.panel,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: glass.hairline,
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
    backgroundColor: glass.panelElevated,
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
    backgroundColor: glass.panelElevated,
  },
  swipeRemoveAction: {
    width: SWIPE_REMOVE_ACTION_SIZE,
    height: SWIPE_REMOVE_ACTION_SIZE,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.accentTint12,
    borderWidth: 1,
    borderColor: colors.borderAccent,
    marginRight: spacing.md,
    borderRadius: borderRadius.full,
  },
});
