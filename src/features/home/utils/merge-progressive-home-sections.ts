import type { HomeBrowseResponse, HomePersonalizedResponse, HomeSection } from '../types';

export function mergeProgressiveHomeSections(
  browse?: HomeBrowseResponse,
  personalized?: HomePersonalizedResponse,
): HomeSection[] {
  const merged: HomeSection[] = [];
  const seenTypes = new Set<string>();

  for (const section of browse?.sections ?? []) {
    merged.push(section);
    seenTypes.add(section.type);
  }

  for (const section of personalized?.sections ?? []) {
    if (seenTypes.has(section.type)) {
      continue;
    }

    merged.push(section);
    seenTypes.add(section.type);
  }

  return merged;
}
