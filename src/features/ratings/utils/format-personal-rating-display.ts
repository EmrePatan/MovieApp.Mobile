import { backendScoreToStarRating } from './star-rating';

export function formatPersonalRatingOutOfFive(backendScore: number): string {
  const stars = backendScoreToStarRating(backendScore);
  const formatted = Number.isInteger(stars) ? String(stars) : stars.toFixed(1);

  return formatted;
}
