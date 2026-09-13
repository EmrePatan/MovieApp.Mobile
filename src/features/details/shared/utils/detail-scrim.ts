const DETAIL_BACKGROUND_RGB_VALUE = '10, 10, 15';

function buildScrimOpacities(stripCount: number): number[] {
  return Array.from({ length: stripCount }, (_, index) => {
    const progress = index / (stripCount - 1);
    const smoothstep = progress * progress * (3 - 2 * progress);
    return Math.pow(smoothstep, 1.35) * 0.97;
  });
}

export const DETAIL_SCRIM_STRIP_COUNT = 40;
export const DETAIL_SCRIM_OPACITIES = buildScrimOpacities(DETAIL_SCRIM_STRIP_COUNT);
export const DETAIL_BACKGROUND_RGB = DETAIL_BACKGROUND_RGB_VALUE;
