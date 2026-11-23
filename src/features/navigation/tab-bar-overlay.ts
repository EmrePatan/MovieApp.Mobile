import { PRIMARY_TAB_HREFS } from '@/features/navigation/primary-tab-routes';
import { resolveBottomNavVisibility } from '@/features/navigation/bottom-nav-visibility';

const PRIMARY_TAB_ROOT_PATHS: ReadonlySet<string> = new Set(Object.values(PRIMARY_TAB_HREFS));

/**
 * The glass dock floats over content only on the five primary tab roots. Every
 * other route keeps the dock in the layout flow so its scroll areas need no extra
 * bottom padding.
 */
export function isTabBarOverlayActive(pathname: string, segments: readonly string[]): boolean {
  return resolveBottomNavVisibility(segments) === 'show' && PRIMARY_TAB_ROOT_PATHS.has(pathname);
}
