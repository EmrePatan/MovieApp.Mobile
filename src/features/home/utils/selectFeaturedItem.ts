import type { HomeItem, HomeSection, HomeSectionType } from '../types';

const FEATURED_SECTION_PRIORITY: HomeSectionType[] = [
  'ContinueWatching',
  'RecommendedForYou',
  'Trending',
];

function findFirstItemInSection(
  sections: HomeSection[],
  type: HomeSectionType,
): HomeItem | null {
  const section = sections.find(
    (candidate) => candidate.type === type && candidate.items.length > 0,
  );

  return section?.items[0] ?? null;
}

function findFirstAvailableItem(sections: HomeSection[]): HomeItem | null {
  for (const section of sections) {
    if (section.items.length > 0) {
      return section.items[0];
    }
  }

  return null;
}

export function selectFeaturedSourceSectionType(
  sections: HomeSection[],
): HomeSectionType | null {
  if (sections.length === 0) {
    return null;
  }

  for (const type of FEATURED_SECTION_PRIORITY) {
    const section = sections.find(
      (candidate) => candidate.type === type && candidate.items.length > 0,
    );

    if (section) {
      return section.type;
    }
  }

  return sections.find((section) => section.items.length > 0)?.type ?? null;
}

export function selectFeaturedItem(sections: HomeSection[]): HomeItem | null {
  if (sections.length === 0) {
    return null;
  }

  for (const type of FEATURED_SECTION_PRIORITY) {
    const item = findFirstItemInSection(sections, type);
    if (item) {
      return item;
    }
  }

  return findFirstAvailableItem(sections);
}
