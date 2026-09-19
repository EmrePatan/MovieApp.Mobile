import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { SplashScreen } from 'expo-router';
import { useAuth } from '@/auth/useAuth';
import { useLocalePreference } from '@/features/locale/hooks/useLocalePreference';
import { BrandedStartupSplash } from './BrandedStartupSplash';
import {
  BRANDED_SPLASH_BACKGROUND,
  BRANDED_SPLASH_FADE_MS,
  MIN_BRANDED_SPLASH_MS,
} from './startup-splash-timing';
import {
  canRevealApplicationUi,
  preloadStartupIconFonts,
} from './startup-readiness';

interface AppStartupGateProps {
  children: ReactNode;
}

export function AppStartupGate({ children }: AppStartupGateProps) {
  const { isLoading: authIsLoading } = useAuth();
  const { isHydrated: localeHydrated } = useLocalePreference();
  const [iconFontsReady, setIconFontsReady] = useState(false);
  const [showBrandedSplash, setShowBrandedSplash] = useState(true);
  const brandedSplashOpacity = useRef(new Animated.Value(1)).current;
  const hasHiddenNativeSplashRef = useRef(false);
  const brandedSplashShownAtRef = useRef<number | null>(null);
  const dismissTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  const shouldReveal = canRevealApplicationUi(iconFontsReady, authIsLoading) && localeHydrated;

  const hideNativeSplashOnce = useCallback(() => {
    if (hasHiddenNativeSplashRef.current) {
      return;
    }

    hasHiddenNativeSplashRef.current = true;
    brandedSplashShownAtRef.current = Date.now();
    void SplashScreen.hideAsync().catch(() => {
      // Keep startup resilient if native splash hide fails.
    });
  }, []);

  const dismissBrandedSplash = useCallback(() => {
    Animated.timing(brandedSplashOpacity, {
      toValue: 0,
      duration: BRANDED_SPLASH_FADE_MS,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) {
        setShowBrandedSplash(false);
      }
    });
  }, [brandedSplashOpacity]);

  const handleBrandedSplashLayout = useCallback(() => {
    hideNativeSplashOnce();
  }, [hideNativeSplashOnce]);

  useEffect(() => {
    if (!shouldReveal) {
      return;
    }

    if (brandedSplashShownAtRef.current === null) {
      hideNativeSplashOnce();
    }

    const shownAt = brandedSplashShownAtRef.current ?? Date.now();
    const remaining = Math.max(0, MIN_BRANDED_SPLASH_MS - (Date.now() - shownAt));

    dismissTimerRef.current = setTimeout(() => {
      dismissBrandedSplash();
    }, remaining);

    return () => {
      if (dismissTimerRef.current) {
        clearTimeout(dismissTimerRef.current);
        dismissTimerRef.current = null;
      }
    };
  }, [dismissBrandedSplash, hideNativeSplashOnce, shouldReveal]);

  useEffect(() => {
    return () => {
      if (dismissTimerRef.current) {
        clearTimeout(dismissTimerRef.current);
      }
    };
  }, []);

  return (
    <View style={styles.root}>
      {shouldReveal && !showBrandedSplash ? children : null}
      {showBrandedSplash ? (
        <Animated.View
          pointerEvents={shouldReveal ? 'none' : 'auto'}
          style={[styles.splashOverlay, { opacity: brandedSplashOpacity }]}
        >
          <BrandedStartupSplash onLayout={handleBrandedSplashLayout} />
        </Animated.View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: BRANDED_SPLASH_BACKGROUND,
  },
  splashOverlay: {
    ...StyleSheet.absoluteFill,
    zIndex: 10,
    backgroundColor: BRANDED_SPLASH_BACKGROUND,
  },
});
