import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { homeHeaderStyles } from './home-header-styles';
import { HomeHeaderIconButton } from './HomeHeaderIconButton';
import { HomeHeaderProfileAvatar } from './HomeHeaderProfileAvatar';
import { GlobalSearchIconButton } from '@/features/navigation/components/GlobalSearchEntry';
import { openLibraryStackScreen } from '@/features/library/navigation/library-stack-navigation';
import { useUnreadNotificationCount } from '@/features/notifications/hooks/useUnreadNotificationCount';
import { colors } from '@/theme/colors';

interface HomeHeaderActionClusterProps {
  overlay?: boolean;
}

function formatUnreadBadgeCount(unreadCount: number): string | null {
  if (unreadCount <= 0) {
    return null;
  }

  if (unreadCount > 9) {
    return '9+';
  }

  return String(unreadCount);
}

export function HomeHeaderActionCluster({ overlay = false }: HomeHeaderActionClusterProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const unreadCountQuery = useUnreadNotificationCount();
  const unreadCount = unreadCountQuery.data?.unreadCount ?? 0;
  const badgeLabel = formatUnreadBadgeCount(unreadCount);
  const notificationsAccessibilityLabel =
    badgeLabel == null
      ? t('common.openNotifications')
      : t('common.openNotificationsUnread', { count: badgeLabel });
  const iconSize = overlay ? 20 : 22;

  return (
    <View
      style={[
        homeHeaderStyles.actionCluster,
        overlay && homeHeaderStyles.actionClusterOverlay,
      ]}
    >
      <GlobalSearchIconButton origin="home" overlay={overlay} compact />
      <View style={homeHeaderStyles.actionDivider} />
      <HomeHeaderIconButton
        accessibilityLabel={notificationsAccessibilityLabel}
        badgeLabel={badgeLabel}
        overlay={overlay}
        compact
        onPress={() => openLibraryStackScreen(router, '/notifications', '/(tabs)/home')}
      >
        <Ionicons name="notifications-outline" size={iconSize} color={colors.textPrimary} />
      </HomeHeaderIconButton>
      <View style={homeHeaderStyles.actionDivider} />
      <HomeHeaderProfileAvatar
        overlay={overlay}
        compact
        onPress={() => router.push('/(tabs)/profile')}
      />
    </View>
  );
}
