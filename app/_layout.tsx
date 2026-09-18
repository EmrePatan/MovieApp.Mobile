import 'react-native-gesture-handler';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SplashScreen, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/auth/AuthProvider';
import { AppStartupGate } from '@/bootstrap/AppStartupGate';
import { RegionalPreferenceProvider } from '@/features/regions/RegionalPreferenceProvider';
import { queryClient } from '@/api/query-client';
import { useProtectedRoute } from '@/hooks/useProtectedRoute';
import { LoadingView } from '@/components/loading/LoadingView';
import { useAuth } from '@/auth/useAuth';
import { NotificationBootstrapProvider } from '@/features/notifications/services/notification-bootstrap';
import { ratedDetailStackScreenOptions } from '@/features/details/shared/navigation/detail-stack-options';
import { colors } from '@/theme/colors';

void SplashScreen.preventAutoHideAsync();

function RootNavigator() {
  const { isLoading } = useAuth();
  useProtectedRoute();

  if (isLoading) {
    return <LoadingView message="Starting MovieApp..." />;
  }

  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="movie" options={ratedDetailStackScreenOptions} />
        <Stack.Screen name="tv" options={ratedDetailStackScreenOptions} />
        <Stack.Screen name="person" />
        <Stack.Screen name="collection" />
        <Stack.Screen name="watch-history" />
        <Stack.Screen name="favorites" />
        <Stack.Screen name="watchlist/[id]" />
        <Stack.Screen name="following" />
        <Stack.Screen name="upcoming" />
        <Stack.Screen name="notifications" />
        <Stack.Screen name="search" options={{ gestureEnabled: true }} />
        <Stack.Screen name="discover-browse" />
        <Stack.Screen name="advanced-discover" />
        <Stack.Screen name="streaming-discover" />
        <Stack.Screen name="now-in-theaters" />
        <Stack.Screen name="on-tv-this-week" />
        <Stack.Screen name="world-cinema" />
        <Stack.Screen name="pick-something" />
        <Stack.Screen name="profile" options={{ gestureEnabled: true }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <RegionalPreferenceProvider>
          <AuthProvider>
            <AppStartupGate>
              <NotificationBootstrapProvider>
                <RootNavigator />
              </NotificationBootstrapProvider>
            </AppStartupGate>
          </AuthProvider>
        </RegionalPreferenceProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
