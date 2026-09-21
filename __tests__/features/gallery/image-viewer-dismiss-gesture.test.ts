import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  shouldCaptureImageViewerDismissGesture,
  shouldDismissImageViewerOnRelease,
} from '@/features/gallery/utils/image-viewer-dismiss-gesture';

const dismissGestureSource = readFileSync(
  join(__dirname, '../../../src/features/gallery/utils/image-viewer-dismiss-gesture.ts'),
  'utf8',
);

describe('image viewer dismiss gesture', () => {
  it('keeps dismiss-intent capture worklet-safe for UI-runtime gesture handlers', () => {
    expect(dismissGestureSource).toMatch(
      /export function shouldCaptureImageViewerDismissGesture[\s\S]*?'worklet';/,
    );
  });

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
