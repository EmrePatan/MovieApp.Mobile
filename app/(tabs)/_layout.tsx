import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getTabBarStyle, tabBarLabelStyle } from '@/features/navigation/tab-bar-style';
import { colors } from '@/theme/colors';

const hiddenTabScreenOptions = { href: null } as const;

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: getTabBarStyle(insets),
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: tabBarLabelStyle,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: t('tabs.home'),
          tabBarIcon: ({ color, size }) => <Ionicons name="home-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="discover"
        options={{
          title: t('tabs.discover'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="compass-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          title: t('tabs.library'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="albums-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="insights"
        options={{
          title: t('tabs.insights'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="sparkles-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen name="profile" options={hiddenTabScreenOptions} />
      <Tabs.Screen name="watchlist" options={hiddenTabScreenOptions} />
      <Tabs.Screen name="search" options={hiddenTabScreenOptions} />
      <Tabs.Screen name="discover-browse" options={hiddenTabScreenOptions} />
      <Tabs.Screen name="advanced-discover" options={hiddenTabScreenOptions} />
      <Tabs.Screen name="streaming-discover" options={hiddenTabScreenOptions} />
      <Tabs.Screen name="now-in-theaters" options={hiddenTabScreenOptions} />
      <Tabs.Screen name="on-tv-this-week" options={hiddenTabScreenOptions} />
      <Tabs.Screen name="world-cinema" options={hiddenTabScreenOptions} />
      <Tabs.Screen name="favorites" options={hiddenTabScreenOptions} />
      <Tabs.Screen name="following" options={hiddenTabScreenOptions} />
      <Tabs.Screen name="upcoming" options={hiddenTabScreenOptions} />
      <Tabs.Screen name="watch-history" options={hiddenTabScreenOptions} />
      <Tabs.Screen name="notifications" options={hiddenTabScreenOptions} />
      <Tabs.Screen name="pick-something" options={hiddenTabScreenOptions} />
      <Tabs.Screen name="ai-recommendations" options={hiddenTabScreenOptions} />
    </Tabs>
  );
}
