export const RATING_GESTURE_MOVE_THRESHOLD = 6;

export type RatingGestureMode = 'pending' | 'rating' | 'vertical';

export function isHorizontalRatingIntent(dx: number, dy: number): boolean {
  return (
    Math.abs(dx) >= RATING_GESTURE_MOVE_THRESHOLD &&
    Math.abs(dx) > Math.abs(dy)
  );
}

export function isVerticalScrollIntent(dx: number, dy: number): boolean {
  return (
    Math.abs(dy) >= RATING_GESTURE_MOVE_THRESHOLD &&
    Math.abs(dy) > Math.abs(dx)
  );
}

export function resolveRatingGestureMode(
  currentMode: RatingGestureMode,
  dx: number,
  dy: number,
): RatingGestureMode {
  if (currentMode === 'rating' || currentMode === 'vertical') {
    return currentMode;
  }

  if (isVerticalScrollIntent(dx, dy)) {
    return 'vertical';
  }

  if (isHorizontalRatingIntent(dx, dy)) {
    return 'rating';
  }

  return 'pending';
}

export function shouldCommitRatingGesture(mode: RatingGestureMode): boolean {
  return mode === 'rating' || mode === 'pending';
}
