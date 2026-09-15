import {
  shouldCaptureImageViewerDismissGesture,
  shouldDismissImageViewerOnRelease,
} from '@/features/gallery/utils/image-viewer-dismiss-gesture';

describe('image viewer dismiss gesture', () => {
  it('captures downward vertical swipes', () => {
    expect(shouldCaptureImageViewerDismissGesture(2, 12)).toBe(true);
  });

  it('ignores horizontal swipes so gallery paging still works', () => {
    expect(shouldCaptureImageViewerDismissGesture(40, 8)).toBe(false);
  });

  it('dismisses after a long downward drag', () => {
    expect(shouldDismissImageViewerOnRelease(100, 0)).toBe(true);
  });

  it('dismisses after a fast downward flick', () => {
    expect(shouldDismissImageViewerOnRelease(20, 900)).toBe(true);
  });
});
