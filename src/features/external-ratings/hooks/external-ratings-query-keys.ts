import type { ExternalRatingsMediaType } from '../types';

export function externalRatingsQueryKey(
  mediaType: ExternalRatingsMediaType,
  contentId: string,
): readonly ['external-ratings', ExternalRatingsMediaType, string] {
  return ['external-ratings', mediaType, contentId];
}
