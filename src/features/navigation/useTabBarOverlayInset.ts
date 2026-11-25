import { usePathname, useSegments } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { isTabBarOverlayActive } from '@/features/navigation/tab-bar-overlay';
import { resolveTabBarLayoutMetrics } from '@/features/navigation/tab-bar-layout-metrics';

/**
 * Bottom padding a primary tab screen needs so its last row clears the floating
 * dock. Zero when the dock is not overlaying the screen.
 */
export function useTabBarOverlayInset(): number {
  const pathname = usePathname();
  const segments = useSegments();
  const insets = useSafeAreaInsets();

  if (!isTabBarOverlayActive(pathname, segments)) {
    return 0;
  }

  return resolveTabBarLayoutMetrics(insets).totalHeight;
}
