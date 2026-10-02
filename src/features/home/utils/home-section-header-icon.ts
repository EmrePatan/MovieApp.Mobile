import type { Ionicons } from '@expo/vector-icons';
import type { HomeSectionType } from '../types';

/**
 * Header icons that Discover preview rails carried before they moved to Home.
 * Trending, Recommended, Coming Up, and the Keşfet-only rails never had one.
 */
const HOME_SECTION_HEADER_ICONS: Partial<
  Record<HomeSectionType, keyof typeof Ionicons.glyphMap>
> = {
  NowInTheaters: 'film-outline',
  OnTvThisWeek: 'calendar-outline',
};

export function resolveHomeSectionHeaderIcon(
  type: HomeSectionType,
): keyof typeof Ionicons.glyphMap | undefined {
  return HOME_SECTION_HEADER_ICONS[type];
}
