import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/auth/AuthProvider';
import { queryClient } from '@/api/query-client';
import { useProtectedRoute } from '@/hooks/useProtectedRoute';
import { LoadingView } from '@/components/loading/LoadingView';
import { useAuth } from '@/auth/useAuth';
import { colors } from '@/theme/colors';

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
        <Stack.Screen name="movie/[id]" />
        <Stack.Screen name="tv/[id]/index" />
        <Stack.Screen name="tv/[id]/season/[seasonNumber]" />
        <Stack.Screen name="tv/[id]/season/[seasonNumber]/episode/[episodeNumber]" />
        <Stack.Screen name="watch-history" />
        <Stack.Screen name="discover" />
        <Stack.Screen name="profile" />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RootNavigator />
      </AuthProvider>
    </QueryClientProvider>
  );
}
