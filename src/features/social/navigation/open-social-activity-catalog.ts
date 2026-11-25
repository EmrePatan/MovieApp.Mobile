import type { QueryClient } from '@tanstack/react-query';
import type { ImperativeRouter } from 'expo-router';
import { openCatalogDetailFromTab } from '@/features/details/shared/navigation/open-catalog-detail-from-tab';
import { buildEpisodeDetailRoute } from '@/features/details/shared/routes';
import type { SocialFeedItem } from '../types';

type CatalogTarget =
  | { kind: 'catalog'; id: string; type: 'movie' | 'tv' }
  | { kind: 'episode'; tvShowId: string; seasonNumber: number; episodeNumber: number };

function resolveCatalogTarget(item: SocialFeedItem): CatalogTarget | null {
  if (
    item.catalogNavigationType === 'episode'
    && item.catalogNavigationId
    && item.catalogSeasonNumber != null
    && item.catalogEpisodeNumber != null
  ) {
    return {
      kind: 'episode',
      tvShowId: item.catalogNavigationId,
      seasonNumber: item.catalogSeasonNumber,
      episodeNumber: item.catalogEpisodeNumber,
    };
  }

  if (
    item.catalogNavigationId
    && (item.catalogNavigationType === 'movie' || item.catalogNavigationType === 'tv')
  ) {
    return { kind: 'catalog', id: item.catalogNavigationId, type: item.catalogNavigationType };
  }

  if (item.targetContentType === 'Movie') {
    return { kind: 'catalog', id: item.targetContentId, type: 'movie' };
  }

  if (item.targetContentType === 'TvShow') {
    return { kind: 'catalog', id: item.targetContentId, type: 'tv' };
  }

  return null;
}

export function openSocialActivityCatalog(
  router: ImperativeRouter,
  item: SocialFeedItem,
  options?: { queryClient?: QueryClient },
): boolean {
  const target = resolveCatalogTarget(item);
  if (!target) {
    return false;
  }

  if (target.kind === 'episode') {
    router.push(buildEpisodeDetailRoute(target.tvShowId, target.seasonNumber, target.episodeNumber));
    return true;
  }

  openCatalogDetailFromTab(router, target.id, target.type, 'home', options);
  return true;
}
