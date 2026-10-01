import { layout } from '@/theme/layout';
import {
  getHomeHeroCardWidth,
  getHomeHeroCarouselHorizontalPadding,
  getHomeHeroHeight,
  getHomeHeroSnapInterval,
  getHomeHeroViewportLayoutInput,
  HOME_HERO_POSTER_ASPECT_RATIO,
  resolveHomeHeroPosterDimensions,
} from '@/features/home/utils/home-hero-layout';

describe('getHomeHeroHeight', () => {
  it('uses portrait poster height for common phone widths', () => {
    const width390 = getHomeHeroCardWidth(390);
    expect(getHomeHeroHeight(390)).toBe(Math.round(width390 * HOME_HERO_POSTER_ASPECT_RATIO));

    const width428 = getHomeHeroCardWidth(428);
    expect(getHomeHeroHeight(428)).toBe(Math.round(width428 * HOME_HERO_POSTER_ASPECT_RATIO));
  });

  it('caps active poster width on wider layouts', () => {
    expect(getHomeHeroCardWidth(900)).toBe(228);
    expect(getHomeHeroHeight(900)).toBe(Math.round(228 * HOME_HERO_POSTER_ASPECT_RATIO));
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

describe('resolveHomeHeroPosterDimensions', () => {
  it('grows the hero to fill space while keeping the first section row visible', () => {
    const input = getHomeHeroViewportLayoutInput({
      windowWidth: 390,
      windowHeight: 844,
      safeAreaTop: 47,
      tabBarTotalHeight: 50,
      heroOffsetCompensation: 9,
      peekSectionRowHeight: layout.homeSection.rowHeight,
      includePaginationDots: true,
    });

    const widthOnlyHeight = getHomeHeroHeight(input.windowWidth);
    const resolved = resolveHomeHeroPosterDimensions(input);

    expect(resolved.posterHeight).toBeGreaterThanOrEqual(widthOnlyHeight);
    expect(resolved.posterWidth).toBe(
      Math.round(resolved.posterHeight / HOME_HERO_POSTER_ASPECT_RATIO),
    );
  });

  it('shrinks the hero on short viewports instead of clipping the peek section', () => {
    const input = getHomeHeroViewportLayoutInput({
      windowWidth: 390,
      windowHeight: 640,
      safeAreaTop: 20,
      tabBarTotalHeight: 56,
      heroOffsetCompensation: 9,
      peekSectionRowHeight: layout.homeSection.rowHeight,
      includePaginationDots: true,
    });

    const resolved = resolveHomeHeroPosterDimensions(input);
    const widthOnlyHeight = getHomeHeroHeight(input.windowWidth);

    expect(resolved.posterHeight).toBeLessThan(widthOnlyHeight);
  });
});
