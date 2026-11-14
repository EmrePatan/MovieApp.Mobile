import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { SplashScreen } from 'expo-router';
import { useAuth } from '@/auth/useAuth';
import { useLocalePreference } from '@/features/locale/hooks/useLocalePreference';
import { ForcedUpdateBlockingView } from '@/features/app-config/components/ForcedUpdateBlockingView';
import { MaintenanceBlockingView } from '@/features/app-config/components/MaintenanceBlockingView';
import { useAppConfig } from '@/features/app-config/hooks/useAppConfig';
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
  const { isStartupResolved, blocking } = useAppConfig();
  const [iconFontsReady, setIconFontsReady] = useState(false);
  const [showBrandedSplash, setShowBrandedSplash] = useState(true);
  // State initializer avoids reading a ref during render (React 19 lint/runtime rules).
  const [brandedSplashOpacity] = useState(() => new Animated.Value(1));
  const hasHiddenNativeSplashRef = useRef(false);
  const brandedSplashShownAtRef = useRef<number | null>(null);
  const dismissTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      // The icon font is a visual enhancement, not a startup dependency.
      await preloadStartupIconFonts().catch((error) => {
        console.warn('[Startup] Icon font preload rejected; continuing with fallback glyphs.', error);
      });

      if (!cancelled) {
        setIconFontsReady(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const isBlockingStartup = blocking === 'maintenance' || blocking === 'forced';
  const shouldReveal =
    canRevealApplicationUi(iconFontsReady, authIsLoading) &&
    localeHydrated &&
    isStartupResolved &&
    !isBlockingStartup;

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
    if (!isStartupResolved) {
      return;
    }

    if (isBlockingStartup) {
      hideNativeSplashOnce();
      return;
    }

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
  }, [dismissBrandedSplash, hideNativeSplashOnce, isBlockingStartup, isStartupResolved, shouldReveal]);

  useEffect(() => {
    return () => {
      if (dismissTimerRef.current) {
        clearTimeout(dismissTimerRef.current);
      }
    };
  }, []);

  return (
    <View style={styles.root}>
      {isStartupResolved && blocking === 'maintenance' ? (
        <View style={styles.blockingOverlay}>
          <MaintenanceBlockingView />
        </View>
      ) : null}
      {isStartupResolved && blocking === 'forced' ? (
        <View style={styles.blockingOverlay}>
          <ForcedUpdateBlockingView />
        </View>
      ) : null}
      {shouldReveal && !showBrandedSplash ? children : null}
      {showBrandedSplash && !isBlockingStartup ? (
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
  blockingOverlay: {
    ...StyleSheet.absoluteFill,
    zIndex: 20,
  },
});
