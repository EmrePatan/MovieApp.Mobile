import type { HomeItem, HomeSection, HomeSectionType } from '../types';
import { selectHeroCandidates } from './selectHeroCandidates';

export function selectFeaturedSourceSectionType(
  sections: HomeSection[],
  isPersonalized = false,
): HomeSectionType | null {
  const candidates = selectHeroCandidates(sections, isPersonalized);
  return candidates[0]?.sourceType ?? null;
}

export function selectFeaturedItem(
  sections: HomeSection[],
  isPersonalized = false,
): HomeItem | null {
  const candidates = selectHeroCandidates(sections, isPersonalized);
  return candidates[0]?.item ?? null;
}
