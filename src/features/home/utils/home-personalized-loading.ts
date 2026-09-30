import type { UseQueryResult } from '@tanstack/react-query';
import type { HomePersonalizedResponse } from '../types';
import type { PersonalizationState } from './personalization-state';

export function shouldShowPersonalizedLoadingSlot(
  personalization: PersonalizationState,
  personalized: Pick<UseQueryResult<HomePersonalizedResponse>, 'isError' | 'data'>,
): boolean {
  if (personalization !== 'unknown' || personalized.isError) {
    return false;
  }

  return personalized.data === undefined;
}
