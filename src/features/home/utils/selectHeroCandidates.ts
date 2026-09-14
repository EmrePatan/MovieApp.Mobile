import type { HomeItem, HomeSection, HomeSectionType } from '../types';

export const HERO_MAX_CANDIDATES = 5;
export const HERO_RECOMMENDED_CAP = 3;

const HERO_SOURCE_TYPES: HomeSectionType[] = ['RecommendedForYou', 'Trending', 'Popular'];

export interface HeroCandidate {
  item: HomeItem;
  sourceType: HomeSectionType;
}

export function createHomeContentKey(item: Pick<HomeItem, 'contentType' | 'id'>): string {
  return `${item.contentType}:${item.id}`;
}

function getSectionItems(sections: HomeSection[], type: HomeSectionType): HomeItem[] {
  return sections.find((section) => section.type === type && section.items.length > 0)?.items ?? [];
}

export function selectHeroCandidates(sections: HomeSection[]): HeroCandidate[] {
  const usedKeys = new Set<string>();
  const candidates: HeroCandidate[] = [];

  const tryAdd = (item: HomeItem, sourceType: HomeSectionType): boolean => {
    if (candidates.length >= HERO_MAX_CANDIDATES) {
      return false;
    }

    const key = createHomeContentKey(item);
    if (usedKeys.has(key)) {
      return false;
    }

    usedKeys.add(key);
    candidates.push({ item, sourceType });
    return true;
  };

  const recommendedItems = getSectionItems(sections, 'RecommendedForYou');
  for (const item of recommendedItems) {
    const recommendedCount = candidates.filter(
      (candidate) => candidate.sourceType === 'RecommendedForYou',
    ).length;

    if (recommendedCount >= HERO_RECOMMENDED_CAP) {
      break;
    }

    tryAdd(item, 'RecommendedForYou');
  }

  if (!candidates.some((candidate) => candidate.sourceType === 'Trending')) {
    for (const item of getSectionItems(sections, 'Trending')) {
      if (tryAdd(item, 'Trending')) {
        break;
      }
    }
  }

  if (
    candidates.length < HERO_MAX_CANDIDATES &&
    !candidates.some((candidate) => candidate.sourceType === 'Popular')
  ) {
    for (const item of getSectionItems(sections, 'Popular')) {
      if (tryAdd(item, 'Popular')) {
        break;
      }
    }
  }

  for (const sourceType of ['Trending', 'Popular'] as const) {
    for (const item of getSectionItems(sections, sourceType)) {
      if (candidates.length >= HERO_MAX_CANDIDATES) {
        break;
      }

      tryAdd(item, sourceType);
    }
  }

  return candidates;
}

export function isHeroEligibleSectionType(type: HomeSectionType): boolean {
  return HERO_SOURCE_TYPES.includes(type);
}
