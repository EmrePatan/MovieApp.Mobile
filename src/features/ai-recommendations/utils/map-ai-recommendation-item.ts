import type { RecommendationItem } from '@/features/recommendations/types';
import type { AiRecommendationMovieItem } from '../types';

export function mapAiRecommendationToRecommendationItem(
  item: AiRecommendationMovieItem,
): RecommendationItem {
  return {
    id: item.id,
    type: item.type,
    title: item.title,
    originalTitle: item.originalTitle,
    overview: item.overview,
    posterUrl: item.posterUrl,
    backdropUrl: item.backdropUrl,
    releaseDate: item.releaseDate,
    voteAverage: item.voteAverage,
    voteCount: item.voteCount,
    year: item.year,
    score: item.voteAverage,
    reason: item.reason,
  };
}
