import type { CollectionPart } from '../types';
import type { RecommendationItem } from '@/features/recommendations/types';
import { resolveImageUri } from '@/utils/image-url';

function parseCatalogYear(releaseDate: string | null): number | null {
  if (!releaseDate) {
    return null;
  }

  const year = Number.parseInt(releaseDate.slice(0, 4), 10);
  return Number.isFinite(year) ? year : null;
}

export function mapCollectionPartToRecommendationItem(part: CollectionPart): RecommendationItem {
  return {
    id: part.id,
    type: 'movie',
    title: part.title,
    originalTitle: null,
    overview: null,
    posterUrl: resolveImageUri(part.posterPath),
    backdropUrl: null,
    releaseDate: part.releaseDate,
    voteAverage: part.voteAverage,
    voteCount: part.voteCount,
    year: parseCatalogYear(part.releaseDate),
    score: 0,
    reason: null,
  };
}

export function sortCollectionParts(parts: CollectionPart[]): CollectionPart[] {
  return [...parts].sort((left, right) => {
    const leftTime = left.releaseDate ? Date.parse(left.releaseDate) : Number.NaN;
    const rightTime = right.releaseDate ? Date.parse(right.releaseDate) : Number.NaN;

    if (Number.isFinite(leftTime) && Number.isFinite(rightTime) && leftTime !== rightTime) {
      return leftTime - rightTime;
    }

    if (Number.isFinite(leftTime) !== Number.isFinite(rightTime)) {
      return Number.isFinite(leftTime) ? -1 : 1;
    }

    return left.title.localeCompare(right.title, undefined, { sensitivity: 'base' });
  });
}
