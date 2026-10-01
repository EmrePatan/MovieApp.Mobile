import {
  getHomeHeroCardWidth,
  getHomeHeroCarouselHorizontalPadding,
  getHomeHeroHeight,
  getHomeHeroSnapInterval,
  HOME_HERO_POSTER_ASPECT_RATIO,
} from '@/features/home/utils/home-hero-layout';

describe('getHomeHeroHeight', () => {
  it('uses portrait poster height for common phone widths', () => {
    const width390 = getHomeHeroCardWidth(390);
    expect(getHomeHeroHeight(390)).toBe(Math.round(width390 * HOME_HERO_POSTER_ASPECT_RATIO));
    expect(getHomeHeroHeight(390)).toBeLessThan(310);

    const width428 = getHomeHeroCardWidth(428);
    expect(getHomeHeroHeight(428)).toBe(Math.round(width428 * HOME_HERO_POSTER_ASPECT_RATIO));
  });

  it('caps active poster width on wider layouts', () => {
    expect(getHomeHeroCardWidth(900)).toBe(196);
    expect(getHomeHeroHeight(900)).toBe(Math.round(196 * HOME_HERO_POSTER_ASPECT_RATIO));
  });
});

describe('getHomeHeroSnapInterval', () => {
  it('uses a stride smaller than the active poster for side peek', () => {
    const width = 390;
    const activeWidth = getHomeHeroCardWidth(width);
    expect(getHomeHeroSnapInterval(width)).toBeLessThan(activeWidth);
    expect(getHomeHeroSnapInterval(width)).toBe(Math.round(activeWidth * 0.64));
    expect(getHomeHeroCarouselHorizontalPadding(width)).toBeGreaterThan(0);
  });
});
