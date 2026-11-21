import { Ionicons } from '@expo/vector-icons';
import { BottomTabBarHeightCallbackContext } from 'expo-router/build/react-navigation/bottom-tabs/utils/BottomTabBarHeightCallbackContext';
import { usePathname, useRouter, useSegments } from 'expo-router';
import { useCallback, useContext, useMemo } from 'react';
import { Platform, Pressable, StyleSheet, View, type LayoutChangeEvent } from 'react-native';
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
import { TAB_BAR_LABEL_MINIMUM_FONT_SCALE } from '@/features/navigation/tab-bar-label-layout';
import {
  resolvePrimaryTabBarInsets,
  resolveTabBarLayoutMetrics,
  resolveTabBarPressHitSlop,
  TAB_BAR_ROW_HEIGHT,
} from '@/features/navigation/tab-bar-layout-metrics';
import { getTabBarStyle, tabBarLabelStyle } from '@/features/navigation/tab-bar-style';

/**
 * Black Titanium dock palette — local to PrimaryTabBar only.
 * Spec: #0B0B0E / #151519 / #29292E / #898991 / #B9A276 / #EAE8E4
 */
const dock = {
  background: '#0B0B0E',
  elevated: '#151519',
  border: '#29292E',
  inactive: '#898991',
  activeAccent: '#B9A276',
  activeLabel: '#B9A276',
} as const;

type TabConfig = {
  id: PrimaryTabId;
  labelKey: 'tabs.home' | 'tabs.discover' | 'tabs.social' | 'tabs.profile' | 'tabs.insights';
  icon: keyof typeof Ionicons.glyphMap;
};

/** Exact order: Ana Sayfa · Keşfet · Akış · Profil · İstatistikler */
const PRIMARY_TABS: TabConfig[] = [
  { id: 'home', labelKey: 'tabs.home', icon: 'home-outline' },
  { id: 'discover', labelKey: 'tabs.discover', icon: 'compass-outline' },
  { id: 'social', labelKey: 'tabs.social', icon: 'people-outline' },
  { id: 'library', labelKey: 'tabs.profile', icon: 'person-outline' },
  { id: 'insights', labelKey: 'tabs.insights', icon: 'stats-chart-outline' },
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
  const insets = useMemo(
    () => resolvePrimaryTabBarInsets(navigationInsets, hookInsets),
    [hookInsets, navigationInsets],
  );
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
      style={[
        styles.shell,
        getTabBarStyle(insets),
        styles.dockSurface,
        {
          borderTopLeftRadius: layoutMetrics.dockTopRadius,
          borderTopRightRadius: layoutMetrics.dockTopRadius,
        },
      ]}
    >
      <View
        style={[
          styles.tabRow,
          {
            height: layoutMetrics.rowHeight,
            paddingHorizontal: layoutMetrics.rowPaddingHorizontal,
          },
        ]}
      >
        {PRIMARY_TABS.map((tab) => {
          const isActive = highlightedTab === tab.id;
          const iconColor = isActive ? dock.activeAccent : dock.inactive;
          const labelColor = isActive ? dock.activeLabel : dock.inactive;

          return (
            <Pressable
              key={tab.id}
              accessibilityRole="button"
              accessibilityState={{ selected: isActive }}
              accessibilityLabel={t(tab.labelKey)}
              onPress={() => handleTabPress(tab.id)}
              hitSlop={tabPressHitSlop}
              style={[styles.tabButton, { minHeight: layoutMetrics.rowHeight }]}
            >
              <View
                style={[
                  styles.tabInner,
                  {
                    paddingHorizontal: layoutMetrics.contentInsetHorizontal,
                    borderRadius: layoutMetrics.activeRadius,
                  },
                  isActive && styles.tabInnerActive,
                ]}
              >
                <Ionicons
                  name={tab.icon}
                  size={layoutMetrics.iconSize}
                  color={iconColor}
                />
                <AppText
                  variant="caption"
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  minimumFontScale={TAB_BAR_LABEL_MINIMUM_FONT_SCALE}
                  maxFontSizeMultiplier={1.2}
                  style={[
                    tabBarLabelStyle,
                    styles.label,
                    {
                      color: labelColor,
                      marginTop: layoutMetrics.labelGap,
                      fontSize: layoutMetrics.labelFontSize,
                      lineHeight: layoutMetrics.labelLineHeight,
                    },
                  ]}
                >
                  {t(tab.labelKey)}
                </AppText>
              </View>
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
  dockSurface: {
    backgroundColor: dock.background,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: dock.border,
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOpacity: 0.18,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: -2 },
      },
      android: {
        elevation: 6,
      },
      default: {},
    }),
  },
  tabRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    width: '100%',
  },
  tabButton: {
    flex: 1,
    alignItems: 'stretch',
    justifyContent: 'center',
    minHeight: TAB_BAR_ROW_HEIGHT,
    minWidth: 0,
  },
  tabInner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'stretch',
    width: '100%',
  },
  tabInnerActive: {
    backgroundColor: dock.elevated,
  },
  label: {
    alignSelf: 'stretch',
    width: '100%',
    maxWidth: '100%',
    textAlign: 'center',
    fontWeight: '500',
  },
});
