/** Max bounds for reply-thread GIF / photo frames (keeps aspect, no stretch). */
export const THREAD_MEDIA_MAX_WIDTH = 280;
export const THREAD_MEDIA_MAX_HEIGHT = 320;
export const THREAD_MEDIA_FALLBACK_ASPECT = 16 / 10;

export function resolveThreadMediaFrame(
  aspectRatio: number,
  maxWidth = THREAD_MEDIA_MAX_WIDTH,
  maxHeight = THREAD_MEDIA_MAX_HEIGHT,
): { width: number; height: number } {
  const safeAspect =
    Number.isFinite(aspectRatio) && aspectRatio > 0 ? aspectRatio : THREAD_MEDIA_FALLBACK_ASPECT;
  let width = maxWidth;
  let height = width / safeAspect;
  if (height > maxHeight) {
    height = maxHeight;
    width = height * safeAspect;
  }
  return {
    width: Math.round(width),
    height: Math.round(height),
  };
}
