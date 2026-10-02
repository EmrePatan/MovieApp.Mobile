import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/common/AppText';
import { homeHeaderStyles } from './home-header-styles';
import { HomeHeaderIconButton } from './HomeHeaderIconButton';
import { HomeHeaderProfileAvatar } from './HomeHeaderProfileAvatar';
import {
  openSearch,
  type SearchReturnOrigin,
} from '@/features/navigation/search-navigation';
import { LibraryInlineSearchInput } from '@/features/library/components/LibraryInlineSearchInput';
import { useOptionalLibraryHubSearch } from '@/features/library/context/LibraryHubSearchContext';
import { openLibraryStackScreen } from '@/features/library/navigation/library-stack-navigation';
import { useUnreadNotificationCount } from '@/features/notifications/hooks/useUnreadNotificationCount';
import { colors } from '@/theme/colors';
import { interaction } from '@/theme/interaction';

const TAB_RETURN_HREFS: Record<SearchReturnOrigin, `/(tabs)/${string}`> = {
  home: '/(tabs)/home',
  discover: '/(tabs)/discover',
  library: '/(tabs)/library',
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
  const unreadCountQuery = useUnreadNotificationCount();
  const unreadCount = unreadCountQuery.data?.unreadCount ?? 0;
  const badgeLabel = formatUnreadBadgeCount(unreadCount);
  const notificationsAccessibilityLabel =
    badgeLabel == null
      ? t('common.openNotifications')
      : t('common.openNotificationsUnread', { count: badgeLabel });
  const iconSize = overlay ? 20 : 23;
  const headerActionIconColor = overlay ? colors.accentStrong : colors.accent;
  const isLibraryOrigin = searchOrigin === 'library';
  const libraryHubSearch = useOptionalLibraryHubSearch();
  const searchPlaceholder = isLibraryOrigin
    ? t('library.hub.searchPlaceholder')
    : t('home.search.placeholder');
  const openTabSearch = () => {
    openSearch(router, searchOrigin);
  };

  return (
    <View
      style={[
        homeHeaderStyles.headerBar,
        overlay && homeHeaderStyles.headerBarOverlay,
      ]}
    >
      {isLibraryOrigin && libraryHubSearch ? (
        <LibraryInlineSearchInput
          overlay={overlay}
          value={libraryHubSearch.searchInput}
          onChangeText={libraryHubSearch.setSearchInput}
          onClear={libraryHubSearch.clearSearch}
        />
      ) : (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('home.search.accessibility')}
          onPress={openTabSearch}
          style={({ pressed }) => [
            homeHeaderStyles.searchSection,
            pressed && { opacity: interaction.subtlePressedOpacity },
          ]}
        >
          <Ionicons name="search-outline" size={iconSize} color={colors.textMuted} />
          <AppText variant="bodySmall" numberOfLines={1} style={homeHeaderStyles.searchPlaceholder}>
            {searchPlaceholder}
          </AppText>
        </Pressable>
      )}
      <View style={homeHeaderStyles.actionDivider} />
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
      <View style={homeHeaderStyles.actionDivider} />
      <HomeHeaderProfileAvatar
        overlay={overlay}
        compact
        onPress={() => router.push('/(tabs)/profile')}
      />
    </View>
  );
}
