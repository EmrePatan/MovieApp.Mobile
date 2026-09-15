import {
  getHomeHeroCardWidth,
  getHomeHeroHeight,
  getHomeHeroSnapInterval,
  HERO_CAROUSEL_SIDE_INSET,
} from '@/features/home/utils/home-hero-layout';
import { spacing } from '@/theme/spacing';

describe('getHomeHeroHeight', () => {
  it('uses a modest responsive height for common phone widths', () => {
    expect(getHomeHeroHeight(390)).toBe(310);
    expect(getHomeHeroHeight(428)).toBe(310);
  });

  it('scales up on wider layouts without exceeding the cap', () => {
    expect(getHomeHeroHeight(600)).toBe(384);
    expect(getHomeHeroHeight(900)).toBe(480);
  });
});

describe('getHomeHeroCardWidth', () => {
  it('insets carousel cards from the screen edges', () => {
    expect(getHomeHeroCardWidth(390)).toBe(390 - HERO_CAROUSEL_SIDE_INSET * 2);
    expect(HERO_CAROUSEL_SIDE_INSET).toBe(spacing.md);
  });

  it('uses card width as the carousel snap interval', () => {
    expect(getHomeHeroSnapInterval(390)).toBe(getHomeHeroCardWidth(390));
  });
});
