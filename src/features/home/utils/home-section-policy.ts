import type { HomeSection, HomeSectionType } from '../types';

export const EXCLUDED_HOME_SECTION_TYPES = new Set<HomeSectionType>([
  'ContinueWatching',
  'Popular',
  'Genre',
  'BasedOnFavorites',
  'NewReleases',
  'TopRated',
]);

export const PERSONALIZED_HOME_SECTION_ORDER: readonly HomeSectionType[] = [
  'RecommendedForYou',
  'BecauseYouWatched',
];

export const COLD_START_HOME_SECTION_ORDER: readonly HomeSectionType[] = ['Trending'];

export const PERSONALIZED_HERO_SOURCE_ORDER: readonly HomeSectionType[] = ['RecommendedForYou'];

export const COLD_START_HERO_SOURCE_ORDER: readonly HomeSectionType[] = [];

export function isAllowedHomeSectionType(
  type: HomeSectionType,
  isPersonalized: boolean,
): boolean {
  if (EXCLUDED_HOME_SECTION_TYPES.has(type)) {
    return false;
  }

  if (isPersonalized && type === 'Trending') {
    return false;
  }

  return true;
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
