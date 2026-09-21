import { Ionicons } from '@expo/vector-icons';
import { usePathname, useRouter, useSegments } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { AppText } from '@/components/common/AppText';
import { handlePrimaryTabPress } from '@/features/navigation/primary-tab-press';
import { resolveBottomNavVisibility } from '@/features/navigation/bottom-nav-visibility';
import {
  resolveActivePrimaryTab,
  type PrimaryTabId,
} from '@/features/navigation/primary-tab-routes';
import { getTabBarStyle, tabBarLabelStyle } from '@/features/navigation/tab-bar-style';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

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

export function PrimaryTabBar() {
  const router = useRouter();
  const pathname = usePathname();
  const segments = useSegments();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  if (resolveBottomNavVisibility(segments) === 'hide') {
    return null;
  }

  const activeTab = resolveActivePrimaryTab(pathname);

  const handleTabPress = (tabId: PrimaryTabId) => {
    handlePrimaryTabPress({
      tabId,
      pathname,
      activeTab,
      router,
    });
  };

  return (
    <View style={[styles.container, getTabBarStyle(insets)]}>
      {PRIMARY_TABS.map((tab) => {
        const isActive = activeTab === tab.id;
        const color = isActive ? colors.accent : colors.textMuted;

        return (
          <Pressable
            key={tab.id}
            accessibilityRole="button"
            accessibilityState={{ selected: isActive }}
            onPress={() => handleTabPress(tab.id)}
            style={styles.tabButton}
          >
            <Ionicons name={tab.icon} size={22} color={color} />
            <AppText style={[tabBarLabelStyle, styles.label, { color }]}>{t(tab.labelKey)}</AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: spacing.xs,
  },
  label: {
    marginTop: spacing.xs,
  },
});
