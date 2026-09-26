import { Ionicons } from '@expo/vector-icons';
import { BottomTabBarHeightCallbackContext } from 'expo-router/build/react-navigation/bottom-tabs/utils/BottomTabBarHeightCallbackContext';
import { usePathname, useRouter, useSegments } from 'expo-router';
import { useCallback, useContext, useMemo } from 'react';
import { Pressable, StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import type { EdgeInsets } from 'react-native-safe-area-context';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { AppText } from '@/components/common/AppText';
import { handlePrimaryTabPress } from '@/features/navigation/primary-tab-press';
import { resolveBottomNavVisibility } from '@/features/navigation/bottom-nav-visibility';
import {
  resolveActivePrimaryTab,
  type PrimaryTabId,
} from '@/features/navigation/primary-tab-routes';
import {
  resolveTabBarLayoutMetrics,
  resolveTabBarPressHitSlop,
  TAB_BAR_ICON_SIZE,
  TAB_BAR_LABEL_GAP,
  TAB_BAR_ROW_HEIGHT,
} from '@/features/navigation/tab-bar-layout-metrics';
import { getTabBarStyle, tabBarLabelStyle } from '@/features/navigation/tab-bar-style';
import { colors } from '@/theme/colors';

type TabConfig = {
  id: PrimaryTabId;
  labelKey: 'tabs.home' | 'tabs.discover' | 'tabs.library' | 'tabs.insights';
  icon: keyof typeof Ionicons.glyphMap;
};

const PRIMARY_TABS: TabConfig[] = [
  { id: 'home', labelKey: 'tabs.home', icon: 'home-outline' },
  { id: 'discover', labelKey: 'tabs.discover', icon: 'compass-outline' },
  { id: 'library', labelKey: 'tabs.library', icon: 'albums-outline' },
  { id: 'insights', labelKey: 'tabs.insights', icon: 'sparkles-outline' },
];

interface PrimaryTabBarProps {
  /** Insets from React Navigation tabBar render props (preferred on device). */
  insets?: EdgeInsets;
}

export function PrimaryTabBar({ insets: navigationInsets }: PrimaryTabBarProps = {}) {
  const router = useRouter();
  const pathname = usePathname();
  const segments = useSegments();
  const hookInsets = useSafeAreaInsets();
  const insets = navigationInsets ?? hookInsets;
  const { t } = useTranslation();
  const onTabBarHeightChange = useContext(BottomTabBarHeightCallbackContext);
  const layoutMetrics = useMemo(() => resolveTabBarLayoutMetrics(insets), [insets]);
  const tabPressHitSlop = useMemo(
    () => resolveTabBarPressHitSlop(insets, layoutMetrics.labelBottomToShellBottom),
    [insets, layoutMetrics.labelBottomToShellBottom],
  );

  const handleTabBarLayout = useCallback(
    (event: LayoutChangeEvent) => {
      onTabBarHeightChange?.(event.nativeEvent.layout.height);
    },
    [onTabBarHeightChange],
  );

  if (resolveBottomNavVisibility(segments) === 'hide') {
    return null;
  }

  const highlightedTab = resolveActivePrimaryTab(pathname);

  const handleTabPress = (tabId: PrimaryTabId) => {
    handlePrimaryTabPress({
      tabId,
      pathname,
      highlightedTab,
      router,
    });
  };

  return (
    <View
      onLayout={handleTabBarLayout}
      style={[styles.shell, getTabBarStyle(insets)]}
    >
      <View style={[styles.tabRow, { height: layoutMetrics.rowHeight }]}>
        {PRIMARY_TABS.map((tab) => {
          const isActive = highlightedTab === tab.id;
          const color = isActive ? colors.accent : colors.textMuted;

          return (
            <Pressable
              key={tab.id}
              accessibilityRole="button"
              accessibilityState={{ selected: isActive }}
              onPress={() => handleTabPress(tab.id)}
              hitSlop={tabPressHitSlop}
              style={styles.tabButton}
            >
              <Ionicons name={tab.icon} size={TAB_BAR_ICON_SIZE} color={color} />
              <AppText style={[tabBarLabelStyle, styles.label, { color }]}>{t(tab.labelKey)}</AppText>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    justifyContent: 'flex-end',
  },
  tabRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    minHeight: TAB_BAR_ROW_HEIGHT,
  },
  label: {
    marginTop: TAB_BAR_LABEL_GAP,
  },
});
