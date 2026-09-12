import type { HomeItem, HomeSection, HomeSectionType } from '../types';
import {
  selectFeaturedItem,
  selectFeaturedSourceSectionType,
} from './selectFeaturedItem';

export interface PresentedHomeFeed {
  featuredItem: HomeItem | null;
  featuredSourceType: HomeSectionType | null;
  sections: HomeSection[];
}

export function presentHomeSections(sections: HomeSection[]): PresentedHomeFeed {
  const featuredItem = selectFeaturedItem(sections);
  const featuredSourceType = selectFeaturedSourceSectionType(sections);

  const presentedSections = sections
    .map((section) => {
      if (!featuredItem || section.type !== featuredSourceType) {
        return section;
      }

      return {
        ...section,
        items: section.items.filter((item) => item.id !== featuredItem.id),
      };
    })
    .filter((section) => section.items.length > 0);

  return {
    featuredItem,
    featuredSourceType,
    sections: presentedSections,
  };
}
