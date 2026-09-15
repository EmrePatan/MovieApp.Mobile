import { api } from '@/api/client';
import type { SearchResponse } from '@/features/search/types';
import {
  buildAdvancedDiscoverPath,
  buildBrowsePath,
  buildDiscoveryWatchProvidersPath,
  buildExplorePreviewPath,
  buildGenresPath,
  buildNowInTheatersPath,
} from './routes';
import type { NowInTheatersRequest } from '../now-in-theaters-types';
import type { AdvancedDiscoverMediaType, AdvancedDiscoverRequest } from '../advanced-discover-types';
import type { DiscoveryBrowseRequest, ExplorePreviewResponse, Genre } from '../types';
import type { DiscoveryWatchProvidersResponse } from '../watch-provider-types';

export async function getDiscoveryWatchProviders(
  mediaType: AdvancedDiscoverMediaType,
  watchRegion: string,
  signal?: AbortSignal,
): Promise<DiscoveryWatchProvidersResponse> {
  return api.get<DiscoveryWatchProvidersResponse>(
    buildDiscoveryWatchProvidersPath(mediaType, watchRegion),
    {
      authenticated: false,
      signal,
    },
  );
}

export async function getAdvancedDiscover(
  criteria: AdvancedDiscoverRequest,
  signal?: AbortSignal,
): Promise<SearchResponse> {
  return api.get<SearchResponse>(buildAdvancedDiscoverPath(criteria), {
    authenticated: false,
    signal,
  });
}

export async function getBrowseDiscovery(
  criteria: DiscoveryBrowseRequest,
  signal?: AbortSignal,
): Promise<SearchResponse> {
  return api.get<SearchResponse>(buildBrowsePath(criteria), {
    authenticated: false,
    signal,
  });
}

export async function getGenres(signal?: AbortSignal): Promise<Genre[]> {
  return api.get<Genre[]>(buildGenresPath(), {
    authenticated: false,
    signal,
  });
}

export async function getExplorePreview(
  sectionSize: number,
  signal?: AbortSignal,
): Promise<ExplorePreviewResponse> {
  return api.get<ExplorePreviewResponse>(buildExplorePreviewPath(sectionSize), {
    authenticated: false,
    signal,
  });
}

export async function getNowInTheaters(
  criteria: NowInTheatersRequest,
  signal?: AbortSignal,
): Promise<SearchResponse> {
  return api.get<SearchResponse>(
    buildNowInTheatersPath(
      criteria.releaseRegion,
      criteria.page ?? 1,
      criteria.pageSize ?? 20,
    ),
    {
      authenticated: false,
      signal,
    },
  );
}
