import type { HomeItem, HomeSection } from '../types';
import { applyHomeSectionPolicy } from './home-section-policy';
import type { PersonalizationState } from './personalization-state';
import { selectHeroCandidates } from './selectHeroCandidates';

export interface PresentedHomeFeed {
  heroItems: HomeItem[];
  sections: HomeSection[];
  showColdWelcome: boolean;
}

export function presentHomeSections(
  sections: HomeSection[],
  personalization: PersonalizationState | boolean,
): PresentedHomeFeed {
  const personalizationState: PersonalizationState =
    typeof personalization === 'boolean'
      ? personalization
        ? 'personalized'
        : 'not-personalized'
      : personalization;
  const isPersonalized = personalizationState === 'personalized';
  const heroCandidates = selectHeroCandidates(sections, isPersonalized);
  const visibleSections = applyHomeSectionPolicy(sections, isPersonalized);
  const showColdWelcome = personalizationState === 'not-personalized';
  const heroIds = new Set(heroCandidates.map((candidate) => candidate.item.id));

  const presentedSections = visibleSections
    .map((section) => {
      if (section.type !== 'RecommendedForYou' || heroIds.size === 0) {
        return section;
      }

      const withoutHero = section.items.filter((item) => !heroIds.has(item.id));

      return {
        ...section,
        items: withoutHero.length >= 10 ? withoutHero.slice(0, 10) : section.items,
      };
    })
    .filter((section) => section.items.length > 0);

  return {
    heroItems: heroCandidates.map((candidate) => candidate.item),
    sections: presentedSections,
    showColdWelcome,
  };
}
