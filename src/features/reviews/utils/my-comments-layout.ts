import { spacing } from '@/theme/spacing';

/** Minimal horizontal inset so comment cards use nearly the full screen width. */
export const MY_COMMENTS_HORIZONTAL_INSET = spacing.sm;

const POSTER_MIN_WIDTH = 60;
const POSTER_MAX_WIDTH = 72;
const POSTER_WIDTH_RATIO = 0.155;

export function getMyCommentPosterSize(screenWidth: number): { width: number; height: number } {
  const width = Math.min(
    POSTER_MAX_WIDTH,
    Math.max(POSTER_MIN_WIDTH, Math.round(screenWidth * POSTER_WIDTH_RATIO)),
  );

  return {
    width,
    height: Math.round(width * 1.5),
  };
}
