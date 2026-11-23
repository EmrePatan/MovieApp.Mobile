import { useCallback, useRef } from 'react';
import { type AccessibilityActionEvent, Pressable, StyleSheet, View } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { AppText } from '@/components/common/AppText';
import { SocialUserListRow } from '@/features/social/components/SocialUserListRow';
import { formatNotificationRelativeTime } from '@/features/notifications/utils/format-notification-relative-time';
import { colors } from '@/theme/colors';
import { layout } from '@/theme/layout';
import { premiumSheet } from '@/theme/premium-sheet';
import { borderRadius, spacing } from '@/theme/spacing';
import type { DirectConversationListItem } from '../types';
import { describeChatMessagePreview } from '../utils/chat-title-share';

const DELETE_ACTION_SIZE = 40;

interface ConversationRowProps {
  item: DirectConversationListItem;
  currentUserId?: string | null;
  onPress: () => void;
  onDelete?: () => void;
}

export function ConversationRow({ item, currentUserId, onPress, onDelete }: ConversationRowProps) {
  const { t } = useTranslation();
  const swipeableRef = useRef<Swipeable>(null);
  const preview = item.lastMessage
    ? item.lastMessage.senderId === currentUserId
      ? `${t('messages.youPrefix')} ${describeChatMessagePreview(item.lastMessage.body, t('extras.sharedTitle'))}`
      : describeChatMessagePreview(item.lastMessage.body, t('extras.sharedTitle'))
    : t('messages.noPreview');
  const relativeTime = item.lastMessage
    ? formatNotificationRelativeTime(item.lastMessage.createdAt)
    : '';
  const meta = relativeTime ? `${preview} · ${relativeTime}` : preview;
  const unreadLabel =
    item.unreadCount > 9 ? '9+' : item.unreadCount > 0 ? String(item.unreadCount) : null;

  const handleDelete = useCallback(() => {
    swipeableRef.current?.close();
    onDelete?.();
  }, [onDelete]);

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
        accessibilityLabel={t('messages.deleteConversation')}
        onPress={handleDelete}
        style={({ pressed }) => [styles.deleteAction, pressed && styles.pressed]}
      >
        <Ionicons name="trash-outline" size={18} color={premiumSheet.mutedGold} />
      </Pressable>
    );
  }, [handleDelete, onDelete, t]);

  const rowContent = (
    <SocialUserListRow
      userId={item.otherUser.id}
      displayName={item.otherUser.displayName}
      userName={item.otherUser.userName}
      avatarUrl={item.otherUser.avatarUrl}
      meta={meta}
      onPress={onPress}
      trailing={
        unreadLabel ? (
          <View style={styles.badge} accessibilityLabel={t('messages.unreadCount', { count: unreadLabel })}>
            <AppText style={styles.badgeText}>{unreadLabel}</AppText>
          </View>
        ) : undefined
      }
    />
  );

  if (!onDelete) {
    return rowContent;
  }

  return (
    <Swipeable
      ref={swipeableRef}
      friction={2}
      overshootRight={false}
      rightThreshold={DELETE_ACTION_SIZE / 2}
      activeOffsetX={[-24, 24]}
      failOffsetY={[-12, 12]}
      renderRightActions={renderRightActions}
      childrenContainerStyle={styles.swipeableContent}
    >
      <View
        accessibilityActions={[{ name: 'delete', label: t('messages.deleteConversation') }]}
        onAccessibilityAction={handleAccessibilityAction}
      >
        {rowContent}
      </View>
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  swipeableContent: {
    backgroundColor: colors.background,
  },
  pressed: {
    opacity: 0.85,
  },
  badge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accent,
  },
  badgeText: {
    color: colors.background,
    fontSize: 11,
    fontWeight: '700',
  },
  deleteAction: {
    width: DELETE_ACTION_SIZE,
    height: DELETE_ACTION_SIZE,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(210, 164, 81, 0.12)',
    borderWidth: 1,
    borderColor: premiumSheet.goldBorder,
    marginRight: layout.screenPaddingHorizontal,
    borderRadius: borderRadius.full,
  },
});
