import { memo, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  type AccessibilityActionEvent,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { AppText } from '@/components/common/AppText';
import { CatalogImage } from '@/features/details/shared/components/CatalogImage';
import { formatNotificationRelativeTime } from '../utils/format-notification-relative-time';
import type { NotificationItem } from '../types';
import { colors } from '@/theme/colors';
import { layout } from '@/theme/layout';
import { borderRadius, spacing } from '@/theme/spacing';

const POSTER_WIDTH = 48;
const POSTER_HEIGHT = 72;
const DELETE_ACTION_WIDTH = 88;

interface NotificationRowProps {
  item: NotificationItem;
  onPress?: (item: NotificationItem) => void;
  onDelete?: (item: NotificationItem) => void;
}

export const NotificationRow = memo(function NotificationRow({
  item,
  onPress,
  onDelete,
}: NotificationRowProps) {
  const { t } = useTranslation();
  const swipeableRef = useRef<Swipeable>(null);
  const isUnread = item.readAtUtc == null;
  const relativeTime = formatNotificationRelativeTime(item.createdAtUtc);
  const accessibilityLabel = t('notifications.row.accessibility', {
    unreadPrefix: isUnread ? t('notifications.row.unreadPrefix') : '',
    title: item.title,
    body: item.body,
    relativeTime,
  });

  const handleDelete = useCallback(() => {
    swipeableRef.current?.close();
    onDelete?.(item);
  }, [item, onDelete]);

  const handleAccessibilityAction = useCallback(
    (event: AccessibilityActionEvent) => {
      if (event.nativeEvent.actionName === 'delete') {
        handleDelete();
      }
    },
    [handleDelete],
  );

  const renderRightActions = useCallback(() => {
    if (!onDelete) {
      return null;
    }

    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('notifications.row.delete')}
        onPress={handleDelete}
        style={({ pressed }) => [styles.deleteAction, pressed && styles.pressed]}
      >
        <AppText variant="bodySmall" style={styles.deleteActionLabel}>
          {t('common.delete')}
        </AppText>
      </Pressable>
    );
  }, [handleDelete, onDelete, t]);

  const rowContent = (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityActions={onDelete ? [{ name: 'delete', label: t('notifications.row.delete') }] : undefined}
      onAccessibilityAction={onDelete ? handleAccessibilityAction : undefined}
      onPress={() => onPress?.(item)}
      style={({ pressed }) => [styles.mainPressable, pressed && styles.pressed]}
    >
      <View style={styles.posterWrap}>
        <CatalogImage
          path={item.posterPath}
          width={POSTER_WIDTH}
          height={POSTER_HEIGHT}
          accessibilityLabel={t('common.posterAccessibility', { title: item.title })}
        />
        {isUnread ? <View style={styles.unreadDot} accessibilityLabel={t('notifications.row.unreadDot')} /> : null}
      </View>
      <View style={styles.content}>
        <View style={styles.titleRow}>
          <AppText
            variant="body"
            numberOfLines={1}
            style={[styles.title, isUnread && styles.titleUnread]}
          >
            {item.title}
          </AppText>
          {relativeTime ? (
            <AppText variant="caption" muted numberOfLines={1}>
              {relativeTime}
            </AppText>
          ) : null}
        </View>
        <AppText variant="bodySmall" muted numberOfLines={2}>
          {item.body}
        </AppText>
      </View>
    </Pressable>
  );

  if (!onDelete) {
    return <View style={styles.row}>{rowContent}</View>;
  }

  return (
    <Swipeable
      ref={swipeableRef}
      friction={2}
      overshootRight={false}
      rightThreshold={DELETE_ACTION_WIDTH / 2}
      activeOffsetX={[-24, 24]}
      failOffsetY={[-12, 12]}
      renderRightActions={renderRightActions}
      containerStyle={styles.row}
      childrenContainerStyle={styles.swipeableContent}
    >
      {rowContent}
    </Swipeable>
  );
});

const styles = StyleSheet.create({
  row: {
    minHeight: POSTER_HEIGHT + spacing.sm * 2,
  },
  swipeableContent: {
    backgroundColor: colors.background,
  },
  mainPressable: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingVertical: spacing.sm,
  },
  pressed: {
    opacity: 0.85,
  },
  posterWrap: {
    position: 'relative',
  },
  unreadDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.accent,
    borderWidth: 2,
    borderColor: colors.background,
  },
  content: {
    flex: 1,
    gap: spacing.xs,
    paddingTop: spacing.xs,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  title: {
    flex: 1,
    flexShrink: 1,
  },
  titleUnread: {
    fontWeight: '600',
  },
  deleteAction: {
    width: DELETE_ACTION_WIDTH,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.dangerMuted,
    marginVertical: spacing.sm,
    marginRight: layout.screenPaddingHorizontal,
    borderRadius: borderRadius.md,
  },
  deleteActionLabel: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
});
