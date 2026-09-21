import {
  clampGalleryIndex,
  resolveGalleryActiveIndex,
} from '@/features/gallery/utils/image-viewer-navigation';

describe('image viewer navigation', () => {
  it('clamps gallery indices to valid bounds', () => {
    expect(clampGalleryIndex(-2, 5)).toBe(0);
    expect(clampGalleryIndex(3, 5)).toBe(3);
    expect(clampGalleryIndex(9, 5)).toBe(4);
    expect(clampGalleryIndex(0, 0)).toBe(0);
  });

  it('resolves the active index from horizontal scroll offsets', () => {
    expect(resolveGalleryActiveIndex(0, 390, 8)).toBe(0);
    expect(resolveGalleryActiveIndex(390, 390, 8)).toBe(1);
    expect(resolveGalleryActiveIndex(1170, 390, 8)).toBe(3);
    expect(resolveGalleryActiveIndex(2800, 390, 8)).toBe(7);
  });

  it('clamps resolved index at the last image', () => {
    expect(resolveGalleryActiveIndex(5000, 390, 4)).toBe(3);
  });
});
