import 'react-native-gesture-handler';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SplashScreen, Stack } from 'expo-router';
import { Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/auth/AuthProvider';
import { AppStartupGate } from '@/bootstrap/AppStartupGate';
import { LocalePreferenceProvider } from '@/features/locale/LocalePreferenceProvider';
import { RegionalPreferenceProvider } from '@/features/regions/RegionalPreferenceProvider';
import { queryClient } from '@/api/query-client';
import { useAuthDeepLinkNavigation } from '@/hooks/useAuthDeepLinkNavigation';
import { useProtectedRoute } from '@/hooks/useProtectedRoute';
import { LoadingView } from '@/components/loading/LoadingView';
import { useAuth } from '@/auth/useAuth';
import { NotificationBootstrapProvider } from '@/features/notifications/services/notification-bootstrap';
import { useTranslation } from 'react-i18next';
import { colors } from '@/theme/colors';

void SplashScreen.preventAutoHideAsync();

function RootNavigator() {
  const { t } = useTranslation();
  const { isLoading } = useAuth();
  useAuthDeepLinkNavigation();
  useProtectedRoute();

  if (isLoading) {
    return <LoadingView message={t('common.startingApp')} />;
  }

  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen
          name="(tabs)"
          options={
            Platform.OS === 'android' ? { animationTypeForReplace: 'push' } : undefined
          }
        />
        <Stack.Screen name="profile" options={{ gestureEnabled: true }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <LocalePreferenceProvider>
          <RegionalPreferenceProvider>
            <AuthProvider>
              <AppStartupGate>
                <NotificationBootstrapProvider>
                  <RootNavigator />
                </NotificationBootstrapProvider>
              </AppStartupGate>
            </AuthProvider>
          </RegionalPreferenceProvider>
        </LocalePreferenceProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
