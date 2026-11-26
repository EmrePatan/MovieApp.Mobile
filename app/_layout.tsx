import 'react-native-gesture-handler';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { DarkTheme, SplashScreen, Stack, ThemeProvider } from 'expo-router';
import { Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { QueryClientProvider } from '@tanstack/react-query';
import { preloadExternalRatingBrandAssets } from '@/features/external-ratings/config/external-rating-provider-brand-config';
import { AuthProvider } from '@/auth/AuthProvider';
import { AppConfigProvider } from '@/features/app-config/AppConfigProvider';
import { OptionalUpdateModal } from '@/features/app-config/components/OptionalUpdateModal';
import { AppStartupGate } from '@/bootstrap/AppStartupGate';
import { LocalePreferenceProvider } from '@/features/locale/LocalePreferenceProvider';
import { RegionalPreferenceProvider } from '@/features/regions/RegionalPreferenceProvider';
import { queryClient } from '@/api/query-client';
import { useAuthDeepLinkNavigation } from '@/hooks/useAuthDeepLinkNavigation';
import { useCatalogDeepLinkNavigation } from '@/hooks/useCatalogDeepLinkNavigation';
import { useProtectedRoute } from '@/hooks/useProtectedRoute';
import { LoadingView } from '@/components/loading/LoadingView';
import { useAuth } from '@/auth/useAuth';
import { useAuthFonts } from '@/features/auth/useAuthFonts';
import { NotificationBootstrapProvider } from '@/features/notifications/services/notification-bootstrap';
import { useTranslation } from 'react-i18next';
import { colors } from '@/theme/colors';

preloadExternalRatingBrandAssets();

void SplashScreen.preventAutoHideAsync();

// Without a navigation theme React Navigation falls back to its light DefaultTheme, whose white
// scene/card background showed as a white strip under the floating tab bar while a tab or stack
// transition was still painting the next screen.
const navigationTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: colors.accent,
    background: colors.background,
    card: colors.background,
    text: colors.textPrimary,
    border: colors.border,
  },
};

function RootNavigator() {
  const { t } = useTranslation();
  const { isLoading } = useAuth();
  useAuthFonts();
  useAuthDeepLinkNavigation();
  useCatalogDeepLinkNavigation();
  useProtectedRoute();

  if (isLoading) {
    return <LoadingView message={t('common.startingApp')} />;
  }

  return (
    <ThemeProvider value={navigationTheme}>
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
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    // Dark ground under every screen so a transition or keyboard gap never flashes the white window.
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.background }}>
      <QueryClientProvider client={queryClient}>
        <LocalePreferenceProvider>
          <RegionalPreferenceProvider>
            <AuthProvider>
              <AppConfigProvider>
                <AppStartupGate>
                  <NotificationBootstrapProvider>
                    <RootNavigator />
                    <OptionalUpdateModal />
                  </NotificationBootstrapProvider>
                </AppStartupGate>
              </AppConfigProvider>
            </AuthProvider>
          </RegionalPreferenceProvider>
        </LocalePreferenceProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
