/**
 * Cover framing maths shared by the on-screen adjuster (UI thread worklets) and
 * the final crop. The image is laid out "cover-fit" in the frame; `scale` (>= 1)
 * zooms on top of that and `tx`/`ty` shift the image centre from the frame centre.
 */

/** Width / height of the profile cover frame; matches the backend's 1200x400 cover crop. */
export const COVER_ASPECT = 3;
export const COVER_MAX_ZOOM = 4;

export interface CoverFrameInput {
  imageWidth: number;
  imageHeight: number;
  frameWidth: number;
  frameHeight: number;
}

export interface CoverCropRect {
  originX: number;
  originY: number;
  width: number;
  height: number;
}

export function resolveCoverBaseScale(input: CoverFrameInput): number {
  'worklet';
  return Math.max(
    input.frameWidth / input.imageWidth,
    input.frameHeight / input.imageHeight,
  );
}

export function clampCoverScale(scale: number): number {
  'worklet';
  return Math.min(COVER_MAX_ZOOM, Math.max(1, scale));
}

/** Keeps the frame fully covered by the image. */
export function clampCoverTranslation(
  input: CoverFrameInput,
  scale: number,
  tx: number,
  ty: number,
): { tx: number; ty: number } {
  'worklet';
  const base = Math.max(
    input.frameWidth / input.imageWidth,
    input.frameHeight / input.imageHeight,
  );
  const displayedWidth = input.imageWidth * base * scale;
  const displayedHeight = input.imageHeight * base * scale;
  const maxX = Math.max(0, (displayedWidth - input.frameWidth) / 2);
  const maxY = Math.max(0, (displayedHeight - input.frameHeight) / 2);

  return {
    tx: Math.min(maxX, Math.max(-maxX, tx)),
    ty: Math.min(maxY, Math.max(-maxY, ty)),
  };
}

/** Source-pixel rectangle that is visible inside the frame. */
export function computeCoverCropRect(
  input: CoverFrameInput,
  scale: number,
  tx: number,
  ty: number,
): CoverCropRect {
  const base = resolveCoverBaseScale(input);
  const factor = base * scale;
  const clamped = clampCoverTranslation(input, scale, tx, ty);

  const width = Math.min(input.imageWidth, input.frameWidth / factor);
  const height = Math.min(input.imageHeight, input.frameHeight / factor);
  const originX = (input.imageWidth - width) / 2 - clamped.tx / factor;
  const originY = (input.imageHeight - height) / 2 - clamped.ty / factor;

  return {
    originX: Math.round(Math.min(input.imageWidth - width, Math.max(0, originX))),
    originY: Math.round(Math.min(input.imageHeight - height, Math.max(0, originY))),
    width: Math.round(width),
    height: Math.round(height),
  };
}
