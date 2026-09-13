export const MIN_BACKEND_SCORE = 1;
export const MAX_BACKEND_SCORE = 10;
export const MIN_STAR_RATING = 0.5;
export const MAX_STAR_RATING = 5;
export const STAR_COUNT = 5;
export const RATING_STAR_VISUAL_SIZE = 34;
export const RATING_STAR_GAP = 4;
export const RATING_TRACK_HORIZONTAL_PADDING = 28;
/** Narrow edge strip used to clear an existing rating by dragging to the far left. */
export const RATING_CLEAR_ZONE_WIDTH = 4;

export function getRatingStarClusterWidth(): number {
  return STAR_COUNT * RATING_STAR_VISUAL_SIZE + (STAR_COUNT - 1) * RATING_STAR_GAP;
}

export function getRatingTouchTrackWidth(): number {
  return getRatingStarClusterWidth() + RATING_TRACK_HORIZONTAL_PADDING * 2;
}

export type StarFillState = 'empty' | 'half' | 'full';

export function backendScoreToStarRating(score: number): number {
  return score / 2;
}

export function starRatingToBackendScore(stars: number): number {
  const clamped = Math.max(MIN_STAR_RATING, Math.min(MAX_STAR_RATING, stars));
  const backendScore = Math.round(clamped * 2);

  if (backendScore < MIN_BACKEND_SCORE || backendScore > MAX_BACKEND_SCORE) {
    throw new Error(`Invalid backend score derived from star rating: ${stars}`);
  }

  return backendScore;
}

export function isValidBackendScore(score: number): boolean {
  return (
    Number.isInteger(score) &&
    score >= MIN_BACKEND_SCORE &&
    score <= MAX_BACKEND_SCORE
  );
}

export function formatStarRatingDisplay(stars: number): string {
  return stars.toFixed(1);
}

export function formatStarRatingAccessibilityLabel(stars: number): string {
  return `Your rating: ${formatStarRatingDisplay(stars)} out of 5 stars`;
}

export function formatCommunityStarRatingDisplay(averageScore: number): string {
  const stars = averageScore / 2;
  const truncated = Math.floor(stars * 10) / 10;

  return truncated.toFixed(1);
}

export function formatCommunityRatingCountLabel(ratingCount: number): string {
  if (ratingCount === 1) {
    return '1 rating';
  }

  return `${ratingCount.toLocaleString()} ratings`;
}

export function formatCommunityRatingAccessibilityLabel(
  averageScore: number,
  ratingCount: number,
): string {
  const stars = formatCommunityStarRatingDisplay(averageScore);
  const countLabel = formatCommunityRatingCountLabel(ratingCount);

  return `Community average ${stars} out of 5 stars, ${countLabel}`;
}

export function getStarFillState(starIndex: number, starRating: number): StarFillState {
  if (starRating >= starIndex) {
    return 'full';
  }

  if (starRating >= starIndex - 0.5) {
    return 'half';
  }

  return 'empty';
}

export type RatingGesturePosition = number | 'clear';

export function resolveRatingGesturePosition(
  localX: number,
  trackWidth: number,
  starClusterWidth = trackWidth,
): RatingGesturePosition {
  if (trackWidth <= 0) {
    return MIN_STAR_RATING;
  }

  const clampedX = Math.max(0, Math.min(trackWidth, localX));
  const clusterWidth = Math.min(starClusterWidth, trackWidth);
  const starStart = (trackWidth - clusterWidth) / 2;
  const starEnd = starStart + clusterWidth;

  if (clampedX < RATING_CLEAR_ZONE_WIDTH) {
    return 'clear';
  }

  if (clampedX < starStart) {
    return MIN_STAR_RATING;
  }

  if (clampedX >= starEnd) {
    return MAX_STAR_RATING;
  }

  const relativeX = clampedX - starStart;
  const continuous =
    MIN_STAR_RATING +
    (relativeX / clusterWidth) * (MAX_STAR_RATING - MIN_STAR_RATING);
  const stepped = Math.round(continuous * 2) / 2;

  return Math.max(MIN_STAR_RATING, Math.min(MAX_STAR_RATING, stepped));
}

export function positionToStarRating(
  localX: number,
  trackWidth: number,
  starClusterWidth = trackWidth,
): number {
  const resolved = resolveRatingGesturePosition(localX, trackWidth, starClusterWidth);

  if (resolved === 'clear') {
    return MIN_STAR_RATING;
  }

  return resolved;
}

export function formatStarRatingAccessibilityValue(stars: number | null): string {
  if (stars == null) {
    return 'Not rated';
  }

  return `${formatStarRatingDisplay(stars)} out of 5 stars`;
}

export function stepStarRating(stars: number | null, delta: number): number {
  const current = stars ?? 0;
  const next = Math.round((current + delta) * 2) / 2;
  return Math.max(MIN_STAR_RATING, Math.min(MAX_STAR_RATING, next));
}
