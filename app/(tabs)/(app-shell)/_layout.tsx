import { Stack } from 'expo-router';
import { ratedDetailStackScreenOptions } from '@/features/details/shared/navigation/detail-stack-options';
import { colors } from '@/theme/colors';

export default function AppShellLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="home" />
      <Stack.Screen name="discover" />
      <Stack.Screen name="library" />
      <Stack.Screen name="insights" />
      <Stack.Screen name="search" />
      <Stack.Screen name="discover-browse" />
      <Stack.Screen name="advanced-discover" />
      <Stack.Screen name="streaming-discover" />
      <Stack.Screen name="now-in-theaters" />
      <Stack.Screen name="on-tv-this-week" />
      <Stack.Screen name="world-cinema" />
      <Stack.Screen name="favorites" />
      <Stack.Screen name="following" />
      <Stack.Screen name="upcoming" />
      <Stack.Screen name="watch-history" />
      <Stack.Screen name="notifications" />
      <Stack.Screen name="pick-something" />
      <Stack.Screen name="ai-recommendations" />
      <Stack.Screen name="movie" options={ratedDetailStackScreenOptions} />
      <Stack.Screen name="tv" options={ratedDetailStackScreenOptions} />
      <Stack.Screen name="person" />
      <Stack.Screen name="collection" />
    </Stack>
  );
}
