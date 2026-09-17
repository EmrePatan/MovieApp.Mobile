import { useLayoutEffect } from 'react';
import { useNavigation } from 'expo-router';

/**
 * Temporarily disables the native stack back-swipe while the user is
 * interacting with the inline rating control.
 */
export function useDetailNavigationGestureLock(interactionLocked: boolean) {
  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({ gestureEnabled: !interactionLocked });
  }, [interactionLocked, navigation]);

  useLayoutEffect(() => {
    return () => {
      navigation.setOptions({ gestureEnabled: true });
    };
  }, [navigation]);
}
