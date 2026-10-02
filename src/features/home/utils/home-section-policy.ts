import type { HomeSection, HomeSectionType } from '../types';

/**
 * Home is a “what should I watch now” page.
 * Hot This Week feeds the hero only. Popular, New Releases, Top Rated,
 * Because You Watched, Continue Watching, and genre rails stay off Home.
 */
export const EXCLUDED_HOME_SECTION_TYPES = new Set<HomeSectionType>([
  'ContinueWatching',
  'Popular',
  'Genre',
  'BasedOnFavorites',
  'BecauseYouWatched',
  'HotThisWeek',
  'NewReleases',
  'TopRated',
]);

export const HOME_SECTION_ORDER: readonly HomeSectionType[] = [
  'RecommendedForYou',
  'ComingUp',
  'Trending',
  'OnTvThisWeek',
  'NowInTheaters',
];

export const PERSONALIZED_HOME_SECTION_ORDER: readonly HomeSectionType[] = HOME_SECTION_ORDER;

export const COLD_START_HOME_SECTION_ORDER: readonly HomeSectionType[] = HOME_SECTION_ORDER;

export const PERSONALIZED_HERO_SOURCE_ORDER: readonly HomeSectionType[] = ['HotThisWeek'];

export const COLD_START_HERO_SOURCE_ORDER: readonly HomeSectionType[] = ['HotThisWeek'];

export function isAllowedHomeSectionType(type: HomeSectionType, _isPersonalized: boolean): boolean {
  return !EXCLUDED_HOME_SECTION_TYPES.has(type);
}

export function applyHomeSectionPolicy(
  sections: HomeSection[],
  isPersonalized: boolean,
): HomeSection[] {
  const order = isPersonalized ? PERSONALIZED_HOME_SECTION_ORDER : COLD_START_HOME_SECTION_ORDER;

  const sectionsByType = new Map<HomeSectionType, HomeSection>();

  for (const section of sections) {
    if (!isAllowedHomeSectionType(section.type, isPersonalized) || section.items.length === 0) {
      continue;
    }

    sectionsByType.set(section.type, section);
  }

  const presented: HomeSection[] = [];

  for (const sectionType of order) {
    const section = sectionsByType.get(sectionType);
    if (!section) {
      continue;
    }

    presented.push({
      ...section,
      displayOrder: presented.length + 1,
    });
  }

  return presented;
}
