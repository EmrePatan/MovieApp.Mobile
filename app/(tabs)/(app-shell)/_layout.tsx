import { Stack } from 'expo-router';
import { BrowseQuickActionsProvider } from '@/features/browse-quick-actions/BrowseQuickActionsProvider';
import { ratedDetailStackScreenOptions } from '@/features/details/shared/navigation/detail-stack-options';
import { colors } from '@/theme/colors';

export default function AppShellLayout() {
  return (
    <BrowseQuickActionsProvider>
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="home" />
      <Stack.Screen name="discover" />
      <Stack.Screen name="social" />
      <Stack.Screen name="social/[activityId]" />
      <Stack.Screen name="social-notifications" />
      <Stack.Screen name="social-requests" />
      <Stack.Screen name="social-search" />
      <Stack.Screen name="social-profile/[userId]" />
      <Stack.Screen name="social-people/[userId]" />
      <Stack.Screen name="social-privacy" />
      <Stack.Screen name="library" />
      <Stack.Screen name="insights" />
      <Stack.Screen name="search" />
      <Stack.Screen name="discover-browse" />
      <Stack.Screen name="advanced-discover" />
      <Stack.Screen name="streaming-discover" />
      <Stack.Screen name="streaming-platforms" />
      <Stack.Screen name="discover-genres" />
      <Stack.Screen name="now-in-theaters" />
      <Stack.Screen name="on-tv-this-week" />
      <Stack.Screen name="world-cinema" />
      <Stack.Screen name="favorites" />
      <Stack.Screen name="following" />
      <Stack.Screen name="upcoming" />
      <Stack.Screen name="watch-history" />
      <Stack.Screen name="watchlist" />
      <Stack.Screen name="notifications" />
      <Stack.Screen name="messages" />
      <Stack.Screen name="pick-something" />
      <Stack.Screen name="ai-recommendations" />
      <Stack.Screen name="movie" options={ratedDetailStackScreenOptions} />
      <Stack.Screen name="tv" options={ratedDetailStackScreenOptions} />
      <Stack.Screen name="person" />
      <Stack.Screen name="collection" />
    </Stack>
    </BrowseQuickActionsProvider>
  );
}
