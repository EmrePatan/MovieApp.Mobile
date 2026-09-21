export function clampGalleryIndex(index: number, imageCount: number): number {
  if (imageCount <= 0) {
    return 0;
  }

  return Math.max(0, Math.min(index, imageCount - 1));
}

export function resolveGalleryActiveIndex(
  offsetX: number,
  pageWidth: number,
  imageCount: number,
): number {
  if (pageWidth <= 0 || imageCount <= 0) {
    return 0;
  }

  return clampGalleryIndex(Math.round(offsetX / pageWidth), imageCount);
}
