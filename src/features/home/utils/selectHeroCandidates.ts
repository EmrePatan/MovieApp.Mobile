import type { HomeItem, HomeSection, HomeSectionType } from '../types';
import {
  COLD_START_HERO_SOURCE_ORDER,
  PERSONALIZED_HERO_SOURCE_ORDER,
} from './home-section-policy';

export const HERO_MAX_CANDIDATES = 10;

const HERO_ELIGIBLE_SECTION_TYPES: HomeSectionType[] = ['HotThisWeek'];

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

function getHeroSourceOrder(isPersonalized: boolean): readonly HomeSectionType[] {
  return isPersonalized ? PERSONALIZED_HERO_SOURCE_ORDER : COLD_START_HERO_SOURCE_ORDER;
}

export function selectHeroCandidates(
  sections: HomeSection[],
  isPersonalized: boolean,
): HeroCandidate[] {
  const usedKeys = new Set<string>();
  const candidates: HeroCandidate[] = [];
  const sourceOrder = getHeroSourceOrder(isPersonalized);

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

  const addFromSection = (sourceType: HomeSectionType) => {
    for (const item of getSectionItems(sections, sourceType)) {
      if (!tryAdd(item, sourceType)) {
        break;
      }
    }
  };

  for (const sourceType of sourceOrder) {
    addFromSection(sourceType);
  }

  return candidates;
}

export function isHeroEligibleSectionType(type: HomeSectionType): boolean {
  return HERO_ELIGIBLE_SECTION_TYPES.includes(type);
}
