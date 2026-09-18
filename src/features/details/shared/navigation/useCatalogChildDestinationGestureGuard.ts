import { useCallback } from 'react';
import { useFocusEffect, useNavigation } from 'expo-router';
import { setCatalogDetailGestureEnabled } from './catalog-detail-gesture-navigation';

/**
 * Catalog child screens (reviews, credits, gallery) must pop within the nested
 * `[id]` stack. Disable the root `movie` / `tv` interactive-pop while they are
 * focused so edge back-swipe does not skip catalog detail and return to tabs.
 */
export function useCatalogChildDestinationGestureGuard() {
  const navigation = useNavigation();

  useFocusEffect(
    useCallback(() => {
      setCatalogDetailGestureEnabled(navigation, false);

      return () => {
        setCatalogDetailGestureEnabled(navigation, true);
      };
    }, [navigation]),
  );
}
