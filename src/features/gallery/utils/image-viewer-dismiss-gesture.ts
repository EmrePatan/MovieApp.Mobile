export const IMAGE_VIEWER_DISMISS_DRAG_THRESHOLD = 100;
export const IMAGE_VIEWER_DISMISS_VELOCITY_THRESHOLD = 1;
export const IMAGE_VIEWER_VERTICAL_INTENT_THRESHOLD = 10;

export function shouldCaptureImageViewerDismissGesture(dx: number, dy: number): boolean {
  return (
    dy >= IMAGE_VIEWER_VERTICAL_INTENT_THRESHOLD &&
    dy > Math.abs(dx)
  );
}

export function shouldDismissImageViewerOnRelease(dy: number, vy: number): boolean {
  return dy >= IMAGE_VIEWER_DISMISS_DRAG_THRESHOLD || vy >= IMAGE_VIEWER_DISMISS_VELOCITY_THRESHOLD;
}
