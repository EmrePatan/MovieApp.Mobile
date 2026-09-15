import { api } from '@/api/client';
import type { SearchResponse } from '@/features/search/types';
import {
  buildAdvancedDiscoverPath,
  buildBrowsePath,
  buildExplorePreviewPath,
  buildGenresPath,
} from './routes';
import type { AdvancedDiscoverRequest } from '../advanced-discover-types';
import type { DiscoveryBrowseRequest, ExplorePreviewResponse, Genre } from '../types';

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
