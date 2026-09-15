import type { HomeSection, HomeSectionType } from '../types';

export const EXCLUDED_HOME_SECTION_TYPES = new Set<HomeSectionType>([
  'ContinueWatching',
  'Popular',
  'Genre',
  'BasedOnFavorites',
  'BecauseYouWatched',
  'HotThisWeek',
]);

export const PERSONALIZED_HOME_SECTION_ORDER: readonly HomeSectionType[] = [
  'RecommendedForYou',
  'Trending',
  'TopRated',
  'NewReleases',
];

export const COLD_START_HOME_SECTION_ORDER: readonly HomeSectionType[] = [
  'Trending',
  'TopRated',
  'NewReleases',
];

export const PERSONALIZED_HERO_SOURCE_ORDER: readonly HomeSectionType[] = ['HotThisWeek'];

export const COLD_START_HERO_SOURCE_ORDER: readonly HomeSectionType[] = ['HotThisWeek'];

export function isAllowedHomeSectionType(
  type: HomeSectionType,
  _isPersonalized: boolean,
): boolean {
  return !EXCLUDED_HOME_SECTION_TYPES.has(type);
}

export function applyHomeSectionPolicy(
  sections: HomeSection[],
  isPersonalized: boolean,
): HomeSection[] {
  const order = isPersonalized
    ? PERSONALIZED_HOME_SECTION_ORDER
    : COLD_START_HOME_SECTION_ORDER;

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
