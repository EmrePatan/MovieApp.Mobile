import { Ionicons } from '@expo/vector-icons';
import { BottomTabBarHeightCallbackContext } from 'expo-router/build/react-navigation/bottom-tabs/utils/BottomTabBarHeightCallbackContext';
import { usePathname, useRouter, useSegments } from 'expo-router';
import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  View,
  type LayoutChangeEvent,
} from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import type { EdgeInsets } from 'react-native-safe-area-context';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { AppText } from '@/components/common/AppText';
import { GlassSurface } from '@/components/common/GlassSurface';
import { colors } from '@/theme/colors';
import { hapticSelection } from '@/utils/haptics';
import { isTabBarOverlayActive } from '@/features/navigation/tab-bar-overlay';
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

/** Liquid Glass dock palette — local to PrimaryTabBar only. */
const dock = {
  background: colors.background,
  inactive: 'rgba(245, 245, 247, 0.62)',
  activeAccent: colors.accentStrong,
  activeLabel: '#FFFFFF',
} as const;

/** Float inset of the glass capsule inside the full-height shell. */
const GLASS_DOCK_INSET_H = 12;
const GLASS_DOCK_INSET_TOP = 2;
const GLASS_DOCK_MIN_BOTTOM = 2;
const GLASS_DOCK_BOTTOM_TRIM = 6;
const SLIDER_SPRING = { damping: 20, stiffness: 240, mass: 0.7 } as const;

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

  const highlightedTab = resolveActivePrimaryTab(pathname);
  const overlayActive = isTabBarOverlayActive(pathname, segments);
  const activeIndex = PRIMARY_TABS.findIndex((tab) => tab.id === highlightedTab);

  const [rowWidth, setRowWidth] = useState(0);
  const sliderWidth =
    rowWidth > 0 ? (rowWidth - layoutMetrics.rowPaddingHorizontal * 2) / PRIMARY_TABS.length : 0;
  const sliderX = useSharedValue(0);
  const sliderPlacedRef = useRef(false);

  useEffect(() => {
    if (sliderWidth <= 0 || activeIndex < 0) {
      return;
    }

    const target = activeIndex * sliderWidth;
    if (!sliderPlacedRef.current) {
      sliderPlacedRef.current = true;
      sliderX.value = target;
      return;
    }

    sliderX.value = withSpring(target, SLIDER_SPRING);
  }, [activeIndex, sliderWidth, sliderX]);

  const sliderStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: sliderX.value }],
    opacity: activeIndex < 0 || sliderWidth <= 0 ? 0 : 1,
  }));

  if (resolveBottomNavVisibility(segments) === 'hide') {
    return null;
  }

  const handleTabPress = (tabId: PrimaryTabId) => {
    if (tabId !== highlightedTab) {
      hapticSelection();
    }
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
        overlayActive ? styles.dockOverlay : styles.dockSurface,
      ]}
    >
      {overlayActive ? (
        <LinearGradient
          pointerEvents="none"
          colors={['rgba(5, 5, 8, 0)', 'rgba(5, 5, 8, 0.92)']}
          style={StyleSheet.absoluteFill}
        />
      ) : null}
      <GlassSurface
        pointerEvents="none"
        style={[
          styles.glassCapsule,
          {
            bottom: Math.max(
              layoutMetrics.paddingBottom - GLASS_DOCK_BOTTOM_TRIM,
              GLASS_DOCK_MIN_BOTTOM,
            ),
          },
        ]}
      />
      <View
        style={[
          styles.tabRow,
          {
            height: layoutMetrics.rowHeight,
            marginHorizontal: GLASS_DOCK_INSET_H,
            paddingHorizontal: layoutMetrics.rowPaddingHorizontal,
          },
        ]}
        onLayout={(event) => setRowWidth(event.nativeEvent.layout.width)}
      >
        <Animated.View
          pointerEvents="none"
          style={[
            styles.slider,
            {
              left: layoutMetrics.rowPaddingHorizontal,
              width: sliderWidth,
              borderRadius: layoutMetrics.activeRadius,
            },
            sliderStyle,
          ]}
        >
          <GlassSurface
            tone="accent"
            style={[StyleSheet.absoluteFill, { borderRadius: layoutMetrics.activeRadius }]}
          />
        </Animated.View>
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
  },
  dockOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
  },
  glassCapsule: {
    position: 'absolute',
    left: GLASS_DOCK_INSET_H,
    right: GLASS_DOCK_INSET_H,
    top: GLASS_DOCK_INSET_TOP,
    borderRadius: 999,
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOpacity: 0.35,
        shadowRadius: 14,
        shadowOffset: { width: 0, height: 6 },
      },
      default: {},
    }),
  },
  tabRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    alignSelf: 'stretch',
  },
  slider: {
    position: 'absolute',
    top: 0,
    bottom: 0,
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
  label: {
    alignSelf: 'stretch',
    width: '100%',
    maxWidth: '100%',
    textAlign: 'center',
    fontWeight: '500',
  },
});
