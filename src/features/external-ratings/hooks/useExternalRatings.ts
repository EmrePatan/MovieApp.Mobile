import { useQuery } from '@tanstack/react-query';
import { isValidGuid } from '@/features/details/shared/routes';
import type { ExternalRatingsMediaType } from '../types';
import { externalRatingsQueryOptions } from './external-ratings-query-options';

export function useExternalRatings(
  mediaType: ExternalRatingsMediaType,
  contentId: string,
) {
  const options = externalRatingsQueryOptions(mediaType, contentId);

  return useQuery({
    ...options,
    enabled: isValidGuid(contentId),
    retry: 1,
  });
}
