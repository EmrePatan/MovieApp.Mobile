import { buildCatalogDetailRoute } from '@/features/details/shared/routes';
import type { ContentType } from '@/models/api/pagination';

export function buildNotificationRoute(
  contentType: ContentType,
  contentId: string,
): string {
  return buildCatalogDetailRoute(contentId, contentType);
}
