import { layout } from '@/theme/layout';
import { spacing } from '@/theme/spacing';

import { MOVIE_CAVE_LOGO_ASPECT_RATIO } from '@/features/branding/movie-cave-branding';

const LOGO_ASPECT_RATIO = MOVIE_CAVE_LOGO_ASPECT_RATIO;
const LOGO_MIN_WIDTH = 148;
const LOGO_MAX_WIDTH = 196;
const LOGO_WIDTH_RATIO = 0.46;
const BASELINE_LOGO_HEIGHT = 45;

export function getHomeBrandLogoWidth(screenWidth: number): number {
  const contentWidth = screenWidth - layout.screenPaddingHorizontal * 2;
  const scaledWidth = Math.round(contentWidth * LOGO_WIDTH_RATIO);

  return Math.min(LOGO_MAX_WIDTH, Math.max(LOGO_MIN_WIDTH, scaledWidth));
}

export function getHomeBrandLogoHeight(logoWidth: number): number {
  return Math.round(logoWidth * LOGO_ASPECT_RATIO);
}

export function getHomeBrandLeftInset(screenWidth: number): number {
  const overlap = spacing.md + spacing.xs;

  if (screenWidth < 360) {
    return -Math.round(overlap * 0.8);
  }

  if (screenWidth >= 430) {
    return -Math.round(overlap * 1.05);
  }

  return -overlap;
}

export function getHomeHeaderHeroOffsetCompensation(logoHeight: number): number {
  return Math.max(0, logoHeight - BASELINE_LOGO_HEIGHT);
}

export function getHomeHeaderLayout(screenWidth: number) {
  const logoWidth = getHomeBrandLogoWidth(screenWidth);
  const logoHeight = getHomeBrandLogoHeight(logoWidth);

  return {
    logoWidth,
    logoHeight,
    brandLeftInset: getHomeBrandLeftInset(screenWidth),
    heroOffsetCompensation: getHomeHeaderHeroOffsetCompensation(logoHeight),
  };
}

export type HomeHeaderLayout = ReturnType<typeof getHomeHeaderLayout>;
