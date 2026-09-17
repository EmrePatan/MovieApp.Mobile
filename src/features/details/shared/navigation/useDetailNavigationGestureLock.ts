import { useCallback } from 'react';
import { useFocusEffect, useNavigation } from 'expo-router';

/**
 * Temporarily disables the native stack back-swipe on the focused catalog
 * detail screen while the user is interacting with the inline rating control.
 */
export function useDetailNavigationGestureLock(
  interactionLocked: boolean,
  enabled: boolean,
) {
  const navigation = useNavigation();

  useFocusEffect(
    useCallback(() => {
      if (!enabled) {
        return;
      }

      navigation.setOptions({ gestureEnabled: !interactionLocked });

      return () => {
        navigation.setOptions({ gestureEnabled: true });
      };
    }, [enabled, interactionLocked, navigation]),
  );
}
