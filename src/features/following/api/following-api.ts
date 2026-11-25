import { api } from '@/api/client';
import type { PaginatedResponse } from '@/models/api/pagination';
import { buildFollowingCatalogPath } from './routes';
import type {
  FollowingCatalogItem,
  FollowingCatalogRequest,
  FollowingCatalogResponse,
} from '../types';

/** Wire shape of GET /api/follows/catalog (CatalogFollowItemResponse). */
interface FollowingCatalogWireItem {
  contentId?: string;
  contentType?: string;
  posterPath?: string | null;
  title: string;
  releaseDate?: string | null;
}

type WireItem = FollowingCatalogItem | FollowingCatalogWireItem;

function normalizeFollowingItem(item: WireItem): FollowingCatalogItem {
  if ('type' in item && item.type) {
    return item;
  }

  const wire = item as FollowingCatalogWireItem;
  const releaseDate = wire.releaseDate ?? null;
  const year = releaseDate ? Number.parseInt(releaseDate.slice(0, 4), 10) : null;

  return {
    id: wire.contentId ?? '',
    type: wire.contentType?.toLowerCase() === 'tv' ? 'tv' : 'movie',
    title: wire.title,
    posterUrl: wire.posterPath ?? null,
    releaseDate,
    year: Number.isFinite(year) ? year : null,
  };
}

export async function getFollowingCatalog(
  criteria: FollowingCatalogRequest = {},
  signal?: AbortSignal,
): Promise<FollowingCatalogResponse> {
  const response = await api.get<PaginatedResponse<WireItem>>(
    buildFollowingCatalogPath(criteria),
    { signal },
  );

  return { ...response, items: response.items.map(normalizeFollowingItem) };
}
