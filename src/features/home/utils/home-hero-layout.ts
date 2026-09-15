import { spacing } from '@/theme/spacing';

export const HERO_CAROUSEL_SIDE_INSET = spacing.md;

export function getHomeHeroHeight(screenWidth: number): number {
  return Math.round(Math.min(480, Math.max(310, screenWidth * 0.64)));
}

export function getHomeHeroCardWidth(screenWidth: number): number {
  return screenWidth - HERO_CAROUSEL_SIDE_INSET * 2;
}

export function getHomeHeroSnapInterval(screenWidth: number): number {
  return getHomeHeroCardWidth(screenWidth);
}
