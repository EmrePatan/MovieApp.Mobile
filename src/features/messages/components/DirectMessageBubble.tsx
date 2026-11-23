import { StyleSheet, View } from 'react-native';
import { AppText } from '@/components/common/AppText';
import { formatNotificationRelativeTime } from '@/features/notifications/utils/format-notification-relative-time';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import type { DirectMessageItem } from '../types';
import { glass } from '@/theme/glass';

interface DirectMessageBubbleProps {
  message: DirectMessageItem;
  isMine: boolean;
}

export function DirectMessageBubble({ message, isMine }: DirectMessageBubbleProps) {
  const relativeTime = formatNotificationRelativeTime(message.createdAt);

  return (
    <View style={[styles.row, isMine ? styles.rowMine : styles.rowTheirs]}>
      <View style={[styles.bubble, isMine ? styles.bubbleMine : styles.bubbleTheirs]}>
        <AppText style={[styles.body, isMine ? styles.bodyMine : styles.bodyTheirs]}>{message.body}</AppText>
        {relativeTime ? (
          <AppText style={[styles.time, isMine ? styles.timeMine : styles.timeTheirs]}>{relativeTime}</AppText>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    paddingVertical: spacing.xs,
    flexDirection: 'row',
  },
  rowMine: {
    justifyContent: 'flex-end',
  },
  rowTheirs: {
    justifyContent: 'flex-start',
  },
  bubble: {
    maxWidth: '82%',
    borderRadius: 18,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: 4,
  },
  bubbleMine: {
    backgroundColor: colors.accent,
    borderBottomRightRadius: 6,
  },
  bubbleTheirs: {
    backgroundColor: glass.panelElevated,
    borderBottomLeftRadius: 6,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderSubtle,
  },
  body: {
    fontSize: 15,
    lineHeight: 21,
  },
  bodyMine: {
    color: colors.background,
  },
  bodyTheirs: {
    color: colors.textPrimary,
  },
  time: {
    fontSize: 11,
    alignSelf: 'flex-end',
  },
  timeMine: {
    color: 'rgba(5, 5, 8, 0.72)',
  },
  timeTheirs: {
    color: colors.textMuted,
  },
});
