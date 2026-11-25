import {
  clampCoverScale,
  clampCoverTranslation,
  computeCoverCropRect,
  COVER_ASPECT,
  COVER_MAX_ZOOM,
  resolveCoverBaseScale,
} from '@/features/profile/utils/cover-crop';

const frame = { frameWidth: 400, frameHeight: 400 / COVER_ASPECT };

describe('cover-crop', () => {
  it('fits a wide image by height and a tall poster by width', () => {
    expect(resolveCoverBaseScale({ imageWidth: 2000, imageHeight: 1000, ...frame })).toBeCloseTo(0.2);
    expect(resolveCoverBaseScale({ imageWidth: 1000, imageHeight: 1500, ...frame })).toBeCloseTo(0.4);
  });

  it('crops the centred band of a poster at scale 1', () => {
    const rect = computeCoverCropRect({ imageWidth: 1000, imageHeight: 1500, ...frame }, 1, 0, 0);

    expect(rect.width).toBe(1000);
    expect(rect.height).toBe(333);
    expect(rect.originX).toBe(0);
    expect(rect.originY).toBe(583);
  });

  it('moves the crop window when the image is dragged and keeps it inside the image', () => {
    const input = { imageWidth: 1000, imageHeight: 1500, ...frame };
    const dragDown = computeCoverCropRect(input, 1, 0, 10_000);

    expect(dragDown.originY).toBe(0);

    const dragUp = computeCoverCropRect(input, 1, 0, -10_000);
    expect(dragUp.originY).toBe(1167);
  });

  it('zooming shrinks the crop window', () => {
    const rect = computeCoverCropRect({ imageWidth: 1000, imageHeight: 1500, ...frame }, 2, 0, 0);

    expect(rect.width).toBe(500);
    expect(rect.height).toBe(167);
  });

  it('clamps translation so the frame stays covered', () => {
    const input = { imageWidth: 2000, imageHeight: 1000, ...frame };

    const clamped = clampCoverTranslation(input, 1, 500, 500);
    expect(clamped.tx).toBe(0);
    expect(clamped.ty).toBeCloseTo(33.33, 1);
    expect(clampCoverTranslation(input, 2, 500, 0).tx).toBe(200);
  });

  it('clamps zoom between 1 and the maximum', () => {
    expect(clampCoverScale(0.2)).toBe(1);
    expect(clampCoverScale(99)).toBe(COVER_MAX_ZOOM);
  });
});
