import type { HomeSectionType } from '../types';

export type HomeSectionVariant = 'standard' | 'continueWatching';

export function getHomeSectionVariant(type: HomeSectionType): HomeSectionVariant {
  if (type === 'ContinueWatching') {
    return 'continueWatching';
  }

  return 'standard';
}
