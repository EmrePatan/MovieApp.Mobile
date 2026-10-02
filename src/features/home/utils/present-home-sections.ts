import type { HomeItem, HomeSection } from '../types';
import { applyHomeSectionPolicy } from './home-section-policy';
import type { PersonalizationState } from './personalization-state';
import { selectHeroCandidates } from './selectHeroCandidates';

/**
 * Recommended For You drops titles that are already in the hero only when the
 * rail would still have at least this many cards. A shorter remainder keeps
 * the original items, including hero overlap, so the row does not collapse.
 * When the threshold is met, the deduped rail is capped at this length.
 */
export const RECOMMENDED_HERO_DEDUPE_MIN_COUNT = 10;

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
  const showColdWelcome =
    personalizationState === 'not-personalized' && heroCandidates.length === 0;
  const heroIds = new Set(heroCandidates.map((candidate) => candidate.item.id));

  const presentedSections = visibleSections
    .map((section) => {
      if (section.type !== 'RecommendedForYou' || heroIds.size === 0) {
        return section;
      }

      const withoutHero = section.items.filter((item) => !heroIds.has(item.id));

      return {
        ...section,
        items:
          withoutHero.length >= RECOMMENDED_HERO_DEDUPE_MIN_COUNT
            ? withoutHero.slice(0, RECOMMENDED_HERO_DEDUPE_MIN_COUNT)
            : section.items,
      };
    })
    .filter((section) => section.items.length > 0);

  return {
    heroItems: heroCandidates.map((candidate) => candidate.item),
    sections: presentedSections,
    showColdWelcome,
  };
}
