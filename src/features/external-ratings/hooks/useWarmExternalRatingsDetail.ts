import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { isValidGuid } from '@/features/details/shared/routes';
import { preloadExternalRatingBrandAssets } from '../config/external-rating-provider-brand-config';
import { prefetchExternalRatings } from './external-ratings-query-options';
import type { ExternalRatingsMediaType } from '../types';

/**
 * Starts the external-ratings query as soon as the detail route is active,
 * in parallel with the main catalog detail fetch (avoids waiting for hero/content).
 */
export function useWarmExternalRatingsDetail(
  mediaType: ExternalRatingsMediaType,
  contentId: string | undefined,
  enabled: boolean,
): void {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!enabled || !contentId || !isValidGuid(contentId)) {
      return;
    }

    preloadExternalRatingBrandAssets();
    prefetchExternalRatings(queryClient, mediaType, contentId);
  }, [queryClient, mediaType, contentId, enabled]);
}
