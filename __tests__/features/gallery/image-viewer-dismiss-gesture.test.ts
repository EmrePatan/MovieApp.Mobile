import {
  shouldCaptureImageViewerDismissGesture,
  shouldDismissImageViewerOnRelease,
} from '@/features/gallery/utils/image-viewer-dismiss-gesture';

describe('image viewer dismiss gesture', () => {
  it('captures downward vertical swipes', () => {
    expect(shouldCaptureImageViewerDismissGesture(4, 24)).toBe(true);
  });

  it('ignores horizontal swipes so gallery paging still works', () => {
    expect(shouldCaptureImageViewerDismissGesture(40, 8)).toBe(false);
  });

  it('dismisses after a long downward drag', () => {
    expect(shouldDismissImageViewerOnRelease(120, 0)).toBe(true);
  });

  it('dismisses after a fast downward flick', () => {
    expect(shouldDismissImageViewerOnRelease(20, 1.2)).toBe(true);
  });
});
