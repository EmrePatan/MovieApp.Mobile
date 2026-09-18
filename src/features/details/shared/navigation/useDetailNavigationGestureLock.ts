import { useLayoutEffect } from 'react';
import { useNavigation } from 'expo-router';
import { setCatalogDetailRatingGestureLock } from './catalog-detail-gesture-navigation';

/**
 * Temporarily disables the native stack back-swipe on the root catalog detail
 * screen while the user is interacting with the inline rating control.
 */
export function useDetailNavigationGestureLock(
  interactionLocked: boolean,
  enabled: boolean,
) {
  const navigation = useNavigation();

  useLayoutEffect(() => {
    if (!enabled) {
      return;
    }

    setCatalogDetailRatingGestureLock(navigation, interactionLocked);
  }, [enabled, navigation, interactionLocked]);

}
