import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { SplashScreen } from 'expo-router';
import { useAuth } from '@/auth/useAuth';
import {
  canRevealApplicationUi,
  preloadStartupIconFonts,
} from './startup-readiness';

interface AppStartupGateProps {
  children: ReactNode;
}

export function AppStartupGate({ children }: AppStartupGateProps) {
  const { isLoading: authIsLoading } = useAuth();
  const [iconFontsReady, setIconFontsReady] = useState(false);
  const hasHiddenSplashRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      await preloadStartupIconFonts();

      if (!cancelled) {
        setIconFontsReady(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const shouldReveal = canRevealApplicationUi(iconFontsReady, authIsLoading);

  const hideSplashOnce = useCallback(() => {
    if (!shouldReveal || hasHiddenSplashRef.current) {
      return;
    }

    hasHiddenSplashRef.current = true;
    void SplashScreen.hideAsync();
  }, [shouldReveal]);

  useEffect(() => {
    hideSplashOnce();
  }, [hideSplashOnce]);

  const handleLayout = useCallback(() => {
    hideSplashOnce();
  }, [hideSplashOnce]);

  if (!shouldReveal) {
    return null;
  }

  return (
    <View style={styles.root} onLayout={handleLayout}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
