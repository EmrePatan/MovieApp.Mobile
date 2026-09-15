import { memo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { AppText } from '@/components/common/AppText';
import { CatalogImage } from '@/features/details/shared/components/CatalogImage';
import { formatNotificationRelativeTime } from '../utils/format-notification-relative-time';
import type { NotificationItem } from '../types';
import { colors } from '@/theme/colors';
import { layout } from '@/theme/layout';
import { spacing } from '@/theme/spacing';

const POSTER_WIDTH = 48;
const POSTER_HEIGHT = 72;

interface NotificationRowProps {
  item: NotificationItem;
  onPress?: (item: NotificationItem) => void;
}

export const NotificationRow = memo(function NotificationRow({
  item,
  onPress,
}: NotificationRowProps) {
  const isUnread = item.readAtUtc == null;
  const relativeTime = formatNotificationRelativeTime(item.createdAtUtc);
  const accessibilityLabel = `${isUnread ? 'Unread, ' : ''}${item.title}. ${item.body}. ${relativeTime}`;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={() => onPress?.(item)}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <View style={styles.posterWrap}>
        <CatalogImage
          path={item.posterPath}
          width={POSTER_WIDTH}
          height={POSTER_HEIGHT}
          accessibilityLabel={`${item.title} poster`}
        />
        {isUnread ? <View style={styles.unreadDot} accessibilityLabel="Unread" /> : null}
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
});

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingVertical: spacing.sm,
    minHeight: POSTER_HEIGHT + spacing.sm * 2,
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
});
