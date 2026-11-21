import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppText } from '@/components/common/AppText';
import { SocialUserListRow } from '@/features/social/components/SocialUserListRow';
import { formatNotificationRelativeTime } from '@/features/notifications/utils/format-notification-relative-time';
import { colors } from '@/theme/colors';
import type { DirectConversationListItem } from '../types';

interface ConversationRowProps {
  item: DirectConversationListItem;
  currentUserId?: string | null;
  onPress: () => void;
}

export function ConversationRow({ item, currentUserId, onPress }: ConversationRowProps) {
  const { t } = useTranslation();
  const preview = item.lastMessage
    ? item.lastMessage.senderId === currentUserId
      ? `${t('messages.youPrefix')} ${item.lastMessage.body}`
      : item.lastMessage.body
    : t('messages.noPreview');
  const relativeTime = item.lastMessage
    ? formatNotificationRelativeTime(item.lastMessage.createdAt)
    : '';
  const meta = relativeTime ? `${preview} · ${relativeTime}` : preview;
  const unreadLabel =
    item.unreadCount > 9 ? '9+' : item.unreadCount > 0 ? String(item.unreadCount) : null;

  return (
    <SocialUserListRow
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
}

const styles = StyleSheet.create({
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
});
