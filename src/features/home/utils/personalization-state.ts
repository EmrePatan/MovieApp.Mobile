export type PersonalizationState = 'unknown' | 'personalized' | 'not-personalized';

export function resolvePersonalizationState(
  isLoading: boolean,
  hasData: boolean,
  isPersonalized?: boolean,
): PersonalizationState {
  if (isLoading && !hasData) {
    return 'unknown';
  }

  return isPersonalized ? 'personalized' : 'not-personalized';
}
