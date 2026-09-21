import type { TFunction } from 'i18next';
import type { HomeSectionType } from '../types';

const SECTION_TITLE_KEYS: Partial<Record<HomeSectionType, string>> = {
  Trending: 'home.sections.trending',
  TopRated: 'home.sections.topRated',
  NewReleases: 'home.sections.newReleases',
  RecommendedForYou: 'home.sections.recommendedForYou',
  ComingUp: 'home.sections.comingUp',
};

export function resolveHomeSectionTitle(
  type: HomeSectionType,
  fallbackTitle: string,
  t: TFunction,
): string {
  const key = SECTION_TITLE_KEYS[type];
  return key ? t(key) : fallbackTitle;
}
