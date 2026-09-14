import type { HomeItem, HomeSection, HomeSectionType } from '../types';
import { selectHeroCandidates } from './selectHeroCandidates';

export function selectFeaturedSourceSectionType(
  sections: HomeSection[],
): HomeSectionType | null {
  const candidates = selectHeroCandidates(sections);
  return candidates[0]?.sourceType ?? null;
}

export function selectFeaturedItem(sections: HomeSection[]): HomeItem | null {
  const candidates = selectHeroCandidates(sections);
  return candidates[0]?.item ?? null;
}
