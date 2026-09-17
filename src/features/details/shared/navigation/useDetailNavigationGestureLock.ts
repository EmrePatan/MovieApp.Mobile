import { useCallback, useLayoutEffect } from 'react';
import { useFocusEffect, useNavigation } from 'expo-router';
import {
  resolveCatalogDetailGestureNavigation,
  setCatalogDetailGestureEnabled,
} from './catalog-detail-gesture-navigation';

/**
 * Temporarily disables the native stack back-swipe on the root catalog detail
 * screen while the user is interacting with the inline rating control.
 */
export function useDetailNavigationGestureLock(
  interactionLocked: boolean,
  enabled: boolean,
) {
  const navigation = useNavigation();
  const gestureNavigation = resolveCatalogDetailGestureNavigation(navigation);

  useLayoutEffect(() => {
    if (!enabled) {
      return;
    }

    gestureNavigation.setOptions({ gestureEnabled: !interactionLocked });
  }, [enabled, gestureNavigation, interactionLocked]);

  useFocusEffect(
    useCallback(() => {
      if (!enabled) {
        return undefined;
      }

      return () => {
        setCatalogDetailGestureEnabled(navigation, true);
      };
    }, [enabled, navigation]),
  );
}
