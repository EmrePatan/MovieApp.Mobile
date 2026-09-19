import {
  getHomeBrandLeftInset,
  getHomeBrandLogoWidth,
  getHomeHeaderHeroOffsetCompensation,
  getHomeHeaderLayout,
} from '@/features/home/utils/home-header-layout';

describe('home header layout', () => {
  it('scales logo width within safe bounds across phone widths', () => {
    expect(getHomeBrandLogoWidth(320)).toBe(148);
    expect(getHomeBrandLogoWidth(390)).toBe(161);
    expect(getHomeBrandLogoWidth(430)).toBe(180);
    expect(getHomeBrandLogoWidth(520)).toBe(196);
  });

  it('keeps hero offset tied to logo height rather than a fixed constant', () => {
    const compact = getHomeHeaderLayout(320);
    const regular = getHomeHeaderLayout(430);

    expect(compact.heroOffsetCompensation).toBeGreaterThan(0);
    expect(regular.heroOffsetCompensation).toBeGreaterThanOrEqual(compact.heroOffsetCompensation);
  });

  it('nudges the brand left using spacing tokens with a smaller inset on narrow screens', () => {
    expect(getHomeBrandLeftInset(320)).toBe(-16);
    expect(getHomeBrandLeftInset(390)).toBe(-20);
    expect(getHomeBrandLeftInset(390)).toBeLessThan(getHomeBrandLeftInset(320));
  });

  it('derives hero compensation from logo height', () => {
    expect(getHomeHeaderHeroOffsetCompensation(45)).toBe(0);
    expect(getHomeHeaderHeroOffsetCompensation(61)).toBe(16);
  });
});
