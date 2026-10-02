import type { TFunction } from 'i18next';
import type { HomeComingUpSource, HomeSectionType } from '../types';

const SECTION_TITLE_KEYS: Partial<Record<HomeSectionType, string>> = {
  HotThisWeek: 'home.sections.hotThisWeek',
  Trending: 'home.sections.trending',
  TopRated: 'home.sections.topRated',
  NewReleases: 'home.sections.newReleases',
  RecommendedForYou: 'home.sections.recommendedForYou',
  ComingUp: 'home.sections.comingUp',
  OnTvThisWeek: 'home.sections.onTvThisWeek',
  NowInTheaters: 'home.sections.nowInTheaters',
};

export interface ResolveHomeSectionTitleOptions {
  comingUpSource?: HomeComingUpSource;
}

export function resolveHomeSectionTitle(
  type: HomeSectionType,
  fallbackTitle: string,
  t: TFunction,
  options?: ResolveHomeSectionTitleOptions,
): string {
  if (type === 'ComingUp' && options?.comingUpSource === 'personalized') {
    return t('home.sections.comingUpPersonalized');
  }

  const key = SECTION_TITLE_KEYS[type];
  return key ? t(key) : fallbackTitle;
}
