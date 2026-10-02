import type { Ionicons } from '@expo/vector-icons';
import type { HomeSectionType } from '../types';

/**
 * Icons for Home rail headers that actually render.
 * Hot This Week is the hero, not a titled rail. Popular, Top Rated, New Releases,
 * and the other excluded types stay off Home and have no header icon.
 */
const HOME_SECTION_HEADER_ICONS: Partial<
  Record<HomeSectionType, keyof typeof Ionicons.glyphMap>
> = {
  RecommendedForYou: 'heart-outline',
  ComingUp: 'time-outline',
  Trending: 'flame-outline',
  OnTvThisWeek: 'calendar-outline',
  NowInTheaters: 'film-outline',
};

export function resolveHomeSectionHeaderIcon(
  type: HomeSectionType,
): keyof typeof Ionicons.glyphMap | undefined {
  return HOME_SECTION_HEADER_ICONS[type];
}
