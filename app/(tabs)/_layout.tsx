import { Tabs } from 'expo-router';
import { PrimaryTabBar } from '@/features/navigation/PrimaryTabBar';

const hiddenTabScreenOptions = { href: null } as const;

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={() => <PrimaryTabBar />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen name="(app-shell)" options={{ headerShown: false }} />
      <Tabs.Screen name="profile" options={hiddenTabScreenOptions} />
    </Tabs>
  );
}
