import type { PickSomethingMediaType } from '../pick-something-types';

export function pickSomethingQueryKey(
  mediaType: PickSomethingMediaType,
  excludeIds: readonly string[],
) {
  return ['discovery', 'pick-something', mediaType, excludeIds] as const;
}
