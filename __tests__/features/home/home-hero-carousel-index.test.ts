import {
  getActiveIndexFromScrollIndex,
  getHeroCarouselActiveIndexFromOffset,
  HERO_CAROUSEL_LOOP_HEAD_INDEX,
} from '@/features/home/utils/home-hero-carousel-index';

const SNAP = 358;
const COUNT = 3;

describe('home hero carousel index helpers', () => {
  it('maps loop scroll indices to logical active indices', () => {
    expect(getActiveIndexFromScrollIndex(0, COUNT)).toBe(2);
    expect(getActiveIndexFromScrollIndex(HERO_CAROUSEL_LOOP_HEAD_INDEX, COUNT)).toBe(0);
    expect(getActiveIndexFromScrollIndex(2, COUNT)).toBe(1);
    expect(getActiveIndexFromScrollIndex(COUNT + 1, COUNT)).toBe(0);
  });

  it('keeps the current indicator below 50% drag progress', () => {
    const baseOffset = HERO_CAROUSEL_LOOP_HEAD_INDEX * SNAP;
    expect(getHeroCarouselActiveIndexFromOffset(baseOffset + SNAP * 0.49, SNAP, COUNT)).toBe(0);
  });

  it('switches indicator at or beyond 50% drag progress', () => {
    const baseOffset = HERO_CAROUSEL_LOOP_HEAD_INDEX * SNAP;
    expect(getHeroCarouselActiveIndexFromOffset(baseOffset + SNAP * 0.5, SNAP, COUNT)).toBe(1);
    expect(getHeroCarouselActiveIndexFromOffset(baseOffset + SNAP * 0.51, SNAP, COUNT)).toBe(1);
  });

  it('returns to the previous indicator when dragging back below 50%', () => {
    const baseOffset = HERO_CAROUSEL_LOOP_HEAD_INDEX * SNAP;
    expect(getHeroCarouselActiveIndexFromOffset(baseOffset + SNAP * 0.55, SNAP, COUNT)).toBe(1);
    expect(getHeroCarouselActiveIndexFromOffset(baseOffset + SNAP * 0.45, SNAP, COUNT)).toBe(0);
  });
});
