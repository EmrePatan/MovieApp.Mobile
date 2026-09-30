import type { HomeSection } from '../types';

/** Synthetic FlatList row that reserves the Recommended For You rail position while loading. */
export const HOME_RECOMMENDED_LOADING_SECTION_TYPE = '__HomeRecommendedForYouLoading__';

export function isHomeRecommendedLoadingSection(section: HomeSection): boolean {
  return section.type === HOME_RECOMMENDED_LOADING_SECTION_TYPE;
}

export function createRecommendedForYouLoadingSection(): HomeSection {
  return {
    type: HOME_RECOMMENDED_LOADING_SECTION_TYPE,
    title: '',
    items: [],
    displayOrder: 0,
  };
}

export function buildHomeListSections(
  sections: HomeSection[],
  showPersonalizedLoadingSlot: boolean,
): HomeSection[] {
  if (!showPersonalizedLoadingSlot) {
    return sections;
  }

  return [createRecommendedForYouLoadingSection(), ...sections];
}
