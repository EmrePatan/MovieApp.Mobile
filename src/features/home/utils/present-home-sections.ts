import type { HomeItem, HomeSection, HomeSectionType } from '../types';
import { applyHomeSectionPolicy } from './home-section-policy';
import { selectHeroCandidates } from './selectHeroCandidates';

export interface PresentedHomeFeed {
  heroItems: HomeItem[];
  sections: HomeSection[];
  showColdWelcome: boolean;
}

export function presentHomeSections(
  sections: HomeSection[],
  isPersonalized: boolean,
): PresentedHomeFeed {
  const visibleSections = applyHomeSectionPolicy(sections, isPersonalized);
  const heroCandidates = selectHeroCandidates(visibleSections, isPersonalized);
  const showColdWelcome = !isPersonalized;

  const removalsBySection = new Map<HomeSectionType, Set<string>>();
  for (const candidate of heroCandidates) {
    const existing = removalsBySection.get(candidate.sourceType) ?? new Set<string>();
    existing.add(candidate.item.id);
    removalsBySection.set(candidate.sourceType, existing);
  }

  const presentedSections = visibleSections
    .map((section) => {
      const idsToRemove = removalsBySection.get(section.type);
      if (!idsToRemove) {
        return section;
      }

      return {
        ...section,
        items: section.items.filter((item) => !idsToRemove.has(item.id)),
      };
    })
    .filter((section) => section.items.length > 0);

  return {
    heroItems: heroCandidates.map((candidate) => candidate.item),
    sections: presentedSections,
    showColdWelcome,
  };
}
