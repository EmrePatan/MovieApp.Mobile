import {
  HOME_HEADER_BAR_HEIGHT,
  getHomeHeaderBarHeight,
  getHomeHeaderHeroOffsetCompensation,
  getHomeHeaderLayout,
} from '@/features/home/utils/home-header-layout';

describe('home header layout', () => {
  it('uses a fixed premium bar height across phone widths', () => {
    expect(getHomeHeaderBarHeight()).toBe(HOME_HEADER_BAR_HEIGHT);
    expect(getHomeHeaderLayout(320).barHeight).toBe(HOME_HEADER_BAR_HEIGHT);
    expect(getHomeHeaderLayout(430).barHeight).toBe(HOME_HEADER_BAR_HEIGHT);
  });

  it('keeps hero offset tied to bar height rather than a fixed constant', () => {
    const compact = getHomeHeaderLayout(320);
    const regular = getHomeHeaderLayout(430);

    expect(compact.heroOffsetCompensation).toBeGreaterThan(0);
    expect(regular.heroOffsetCompensation).toBe(compact.heroOffsetCompensation);
  });

  it('derives hero compensation from bar height', () => {
    expect(getHomeHeaderHeroOffsetCompensation(45)).toBe(0);
    expect(getHomeHeaderHeroOffsetCompensation(54)).toBe(9);
  });
});
