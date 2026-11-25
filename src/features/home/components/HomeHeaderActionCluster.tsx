import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/common/AppText';
import { homeHeaderStyles } from './home-header-styles';
import { HomeHeaderIconButton } from './HomeHeaderIconButton';
import { useDirectMessageUnreadCount } from '@/features/messages/hooks/useMessageQueries';
import {
  openSearch,
  type SearchReturnOrigin,
} from '@/features/navigation/search-navigation';
import { openLibraryStackScreen } from '@/features/library/navigation/library-stack-navigation';
import { useCombinedUnreadNotificationCount } from '@/features/notifications/hooks/useCombinedUnreadNotificationCount';
import { colors } from '@/theme/colors';
import { interaction } from '@/theme/interaction';


const TAB_RETURN_HREFS: Record<SearchReturnOrigin, `/(tabs)/${string}`> = {
  home: '/(tabs)/home',
  discover: '/(tabs)/discover',
  library: '/(tabs)/library',
  social: '/(tabs)/social',
};

interface HomeHeaderActionClusterProps {
  overlay?: boolean;
  searchOrigin: SearchReturnOrigin;
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

export function HomeHeaderActionCluster({
  overlay = false,
  searchOrigin,
}: HomeHeaderActionClusterProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const { unreadCount } = useCombinedUnreadNotificationCount();
  const messageUnread = useDirectMessageUnreadCount();
  const messageUnreadCount = typeof messageUnread.data === 'number' ? messageUnread.data : 0;
  const badgeLabel = formatUnreadBadgeCount(unreadCount);
  const messageBadgeLabel = formatUnreadBadgeCount(messageUnreadCount);
  const notificationsAccessibilityLabel =
    badgeLabel == null
      ? t('common.openNotifications')
      : t('common.openNotificationsUnread', { count: badgeLabel });
  const messagesAccessibilityLabel =
    messageBadgeLabel == null
      ? t('common.openMessages')
      : t('common.openMessagesUnread', { count: messageBadgeLabel });
  const iconSize = overlay ? 20 : 23;
  /** Library + social: no search field and no trailing action icons. */
  const hideSearchAndActions = searchOrigin === 'library' || searchOrigin === 'social';
  const headerActionIconColor = overlay ? colors.accentStrong : colors.accent;

  return (
    <View
      style={[
        homeHeaderStyles.headerBar,
        searchOrigin === 'social' && homeHeaderStyles.headerBarQuiet,
        overlay && homeHeaderStyles.headerBarOverlay,
      ]}
    >
      {hideSearchAndActions ? (
        <View style={homeHeaderStyles.searchSection} />
      ) : (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('home.search.accessibility')}
          onPress={() => openSearch(router, searchOrigin)}
          style={({ pressed }) => [
            homeHeaderStyles.searchSection,
            pressed && { opacity: interaction.subtlePressedOpacity },
          ]}
        >
          <Ionicons name="search-outline" size={iconSize} color={colors.textMuted} />
          <AppText variant="bodySmall" numberOfLines={1} style={homeHeaderStyles.searchPlaceholder}>
            {t('home.search.placeholder')}
          </AppText>
        </Pressable>
      )}
      {!hideSearchAndActions ? (
        <>
          <View style={{ width: 4 }} />
          <HomeHeaderIconButton
            accessibilityLabel={notificationsAccessibilityLabel}
            badgeLabel={badgeLabel}
            overlay={overlay}
            compact
            onPress={() =>
              openLibraryStackScreen(router, '/notifications', TAB_RETURN_HREFS[searchOrigin])
            }
          >
            <Ionicons name="notifications-outline" size={iconSize} color={headerActionIconColor} />
          </HomeHeaderIconButton>
          <View style={{ width: 4 }} />
          <HomeHeaderIconButton
            accessibilityLabel={messagesAccessibilityLabel}
            badgeLabel={messageBadgeLabel}
            overlay={overlay}
            compact
            onPress={() =>
              openLibraryStackScreen(router, '/messages', TAB_RETURN_HREFS[searchOrigin])
            }
          >
            <Ionicons name="chatbox-outline" size={iconSize} color={headerActionIconColor} />
          </HomeHeaderIconButton>
        </>
      ) : null}
    </View>
  );
}
