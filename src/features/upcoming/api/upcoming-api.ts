import { api } from '@/api/client';
import type { PaginatedResponse } from '@/models/api/pagination';
import { buildUpcomingCatalogPath } from './routes';
import { mapUpcomingCatalogItems } from '../utils/map-upcoming-catalog-item';
import type {
  UpcomingCatalogItem,
  UpcomingCatalogItemResponse,
  UpcomingCatalogRequest,
} from '../types';

export async function getUpcomingCatalog(
  criteria: UpcomingCatalogRequest = {},
  signal?: AbortSignal,
): Promise<PaginatedResponse<UpcomingCatalogItem>> {
  const response = await api.get<PaginatedResponse<UpcomingCatalogItemResponse>>(
    buildUpcomingCatalogPath(criteria),
    { signal },
  );

  return {
    ...response,
    items: mapUpcomingCatalogItems(response.items),
  };
}
