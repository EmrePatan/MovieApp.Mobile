import type { ContentType } from '@/models/api/pagination';
import { resolveImageUri } from '@/utils/image-url';
import type { UpcomingCatalogItem, UpcomingCatalogItemResponse } from '../types';

function mapContentType(contentType: UpcomingCatalogItemResponse['contentType']): ContentType {
  return contentType === 'Movie' ? 'movie' : 'tv';
}

function deriveYear(releaseDate: string | null | undefined): number | null {
  if (!releaseDate) {
    return null;
  }

  const year = Number.parseInt(releaseDate.slice(0, 4), 10);
  return Number.isNaN(year) ? null : year;
}

export function mapUpcomingCatalogItem(item: UpcomingCatalogItemResponse): UpcomingCatalogItem {
  const releaseDate = item.releaseDate ?? null;

  return {
    id: item.contentId,
    type: mapContentType(item.contentType),
    upcomingKind: item.upcomingKind,
    title: item.title,
    originalTitle: item.title,
    overview: '',
    posterUrl: resolveImageUri(item.posterPath),
    backdropUrl: null,
    releaseDate,
    voteAverage: 0,
    voteCount: 0,
    year: deriveYear(releaseDate),
    isFollowed: item.isFollowed,
    episodeId: item.episodeId ?? undefined,
    seasonNumber: item.seasonNumber ?? undefined,
    episodeNumber: item.episodeNumber ?? undefined,
    episodeName: item.episodeName ?? undefined,
  };
}

export function mapUpcomingCatalogItems(items: UpcomingCatalogItemResponse[]): UpcomingCatalogItem[] {
  return items.map(mapUpcomingCatalogItem);
}
